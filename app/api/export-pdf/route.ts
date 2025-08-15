import type { NextRequest } from 'next/server'
import puppeteer, { Browser, Page } from 'puppeteer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type LaunchOpts = Parameters<typeof puppeteer.launch>[0]

async function launchBrowser(opts?: LaunchOpts) {
  return puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
      '--no-first-run',
      '--no-zygote',
      '--hide-scrollbars',
      '--mute-audio',
    ],
    // Only use this if you KNOW it’s correct in prod; otherwise let Puppeteer manage Chromium.
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    ...opts,
  })
}

export async function POST(req: NextRequest) {
  let browser: Browser | null = null
  let page: Page | null = null

  try {
    const { html, filename = 'export.pdf' } = await req.json()
    if (!html || typeof html !== 'string') {
      return new Response(JSON.stringify({ error: 'HTML content is required' }), { status: 400 })
    }

    const maxRetries = 2
    let lastError: unknown

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check if we need to create/recreate browser or page
        if (!browser || (browser as Browser && !(browser as Browser).isConnected())) {
          console.log(`Attempt ${attempt + 1}: Launching browser...`)
          browser = await launchBrowser()
        }
        
        // At this point, browser should be defined and connected
        if (!browser) {
          throw new Error('Failed to launch browser')
        }
        
        if (!page || (page as Page && (page as Page).isClosed())) {
          console.log(`Attempt ${attempt + 1}: Creating new page...`)
          page = await browser.newPage()
        }
        
        // At this point, page should be defined and open
        if (!page) {
          throw new Error('Failed to create page')
        }
        
        console.log(`Attempt ${attempt + 1}: Setting content and generating PDF...`)
        await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })
        await page.setContent(html, { waitUntil: ['domcontentloaded', 'networkidle0'], timeout: 30_000 })

        // Optional: ensure print colours/backgrounds
        await page.addStyleTag({
          content: `
            @page { size: A4; margin: 20mm; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            html, body { background: #fff; }
          `,
        })

        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          displayHeaderFooter: false,
          preferCSSPageSize: true,
          margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
        })

        console.log(`Attempt ${attempt + 1}: PDF generated successfully, size: ${pdf.length} bytes`)
        
        // Success: return immediately
        return new Response(pdf, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename.replace(/"/g, '')}"`,
            'Cache-Control': 'no-store',
          },
        })
      } catch (err) {
        lastError = err
        console.error(`Attempt ${attempt + 1} failed:`, err)
        
        // Clean up resources and try again
        if (page && !page.isClosed()) {
          try { 
            await page.close() 
          } catch (closeError) {
            console.error('Error closing page:', closeError)
          }
        }
        page = null
        
        if (browser) {
          try { 
            await browser.close() 
          } catch (closeError) {
            console.error('Error closing browser:', closeError)
          }
        }
        browser = null
        
        // Small backoff before retry
        if (attempt < maxRetries) {
          console.log(`Waiting 800ms before retry...`)
          await new Promise(r => setTimeout(r, 800))
        }
      }
    }

    // All attempts failed
    console.error('PDF generation failed:', lastError)
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), { status: 500 })
  } finally {
    try { if (page && !page.isClosed()) await page.close() } catch {}
    try { if (browser) await browser.close() } catch {}
  }
}
