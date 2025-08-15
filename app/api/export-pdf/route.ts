import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// Force Node.js runtime for Puppeteer compatibility
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let browser
  let page
  try {
    const { html, filename = 'export.pdf' } = await request.json()

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      )
    }

    console.log('Starting PDF generation...')
    console.log('HTML content length:', html.length)

    // Launch browser with serverless-optimized flags
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-client-side-phishing-detection',
        '--disable-component-update',
        '--disable-domain-reliability',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-ipc-flooding-protection',
        '--no-default-browser-check',
        '--no-first-run',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    }

    console.log('Launching browser with options:', JSON.stringify(launchOptions, null, 2))
    
    browser = await puppeteer.launch(launchOptions)
    console.log('Browser launched successfully')

    page = await browser.newPage()
    console.log('Page created successfully')

    // Set content and wait for it to load
    console.log('Setting HTML content...')
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })
    console.log('HTML content set successfully')

    // Wait a bit more to ensure content is fully rendered
    console.log('Waiting for content to render...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Content rendering wait completed')

    // Generate PDF with optimized settings
    console.log('Generating PDF...')
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      displayHeaderFooter: false,
      preferCSSPageSize: true,
    })
    console.log('PDF generated successfully, buffer size:', pdfBuffer.length)

    // Return PDF as response with proper headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error stack:', errorStack)
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: errorMessage,
        stack: errorStack
      },
      { status: 500 }
    )
  } finally {
    // Close page first, then browser
    if (page) {
      try {
        await page.close()
        console.log('Page closed successfully')
      } catch (closeError) {
        console.error('Error closing page:', closeError)
      }
    }
    
    if (browser) {
      try {
        await browser.close()
        console.log('Browser closed successfully')
      } catch (closeError) {
        console.error('Error closing browser:', closeError)
      }
    }
  }
} 