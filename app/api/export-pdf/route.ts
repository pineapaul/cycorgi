import type { NextRequest } from "next/server";
import puppeteer, { Browser, Page } from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sanitizes filename to prevent header injection attacks
 * Removes or replaces dangerous characters that could be used in HTTP header injection
 * Uses efficient string operations to avoid ReDoS vulnerabilities
 */
function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    return "export.pdf";
  }

  // Limit input length first to prevent processing extremely long strings
  if (filename.length > 200) {
    filename = filename.substring(0, 200);
  }

  let sanitized = filename;

  // Remove null bytes and control characters (safe regex - no quantifiers)
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, "");

  // Replace dangerous characters with underscores (safe regex - no quantifiers)
  sanitized = sanitized.replace(/[<>:"|?*\\/]/g, "_");

  // Efficiently remove consecutive underscores and dots using string operations
  // This avoids the ReDoS vulnerability of /[._]+/ regex
  sanitized = sanitized.replace(/_+/g, "_").replace(/\.+/g, ".");

  // Remove leading and trailing underscores and dots efficiently
  while (sanitized.startsWith("_") || sanitized.startsWith(".")) {
    sanitized = sanitized.substring(1);
  }
  while (sanitized.endsWith("_") || sanitized.endsWith(".")) {
    sanitized = sanitized.substring(0, sanitized.length - 1);
  }

  // Remove .pdf extension if present (safe regex - no quantifiers)
  if (sanitized.toLowerCase().endsWith(".pdf")) {
    sanitized = sanitized.substring(0, sanitized.length - 4);
  }

  // Limit length to prevent header size issues
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  // Add .pdf extension
  sanitized = sanitized + ".pdf";

  // Fallback if sanitization results in empty or invalid filename
  if (!sanitized || sanitized === ".pdf" || sanitized.length < 5) {
    return "export.pdf";
  }

  return sanitized;
}

type LaunchOpts = Parameters<typeof puppeteer.launch>[0];

async function launchBrowser(opts?: LaunchOpts) {
  return puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
      "--no-first-run",
      "--no-zygote",
      "--hide-scrollbars",
      "--mute-audio",
    ],
    // Only use this if you KNOW it’s correct in prod; otherwise let Puppeteer manage Chromium.
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    ...opts,
  });
}

export async function POST(req: NextRequest) {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    const { html, filename = "export.pdf" } = await req.json();

    // Validate required fields
    if (!html || typeof html !== "string") {
      return new Response(
        JSON.stringify({ error: "HTML content is required" }),
        { status: 400 }
      );
    }

    // Validate filename parameter
    if (
      filename !== undefined &&
      (typeof filename !== "string" || filename.length > 200)
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid filename parameter" }),
        { status: 400 }
      );
    }

    const maxRetries = 2;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check if we need to create/recreate browser or page
        if (
          !browser ||
          ((browser as Browser) && !(browser as Browser).isConnected())
        ) {
          console.log(`Attempt ${attempt + 1}: Launching browser...`);
          browser = await launchBrowser();
        }

        // At this point, browser should be defined and connected
        if (!browser) {
          throw new Error("Failed to launch browser");
        }

        if (!page || ((page as Page) && (page as Page).isClosed())) {
          console.log(`Attempt ${attempt + 1}: Creating new page...`);
          page = await browser.newPage();
        }

        // At this point, page should be defined and open
        if (!page) {
          throw new Error("Failed to create page");
        }

        console.log(
          `Attempt ${attempt + 1}: Setting content and generating PDF...`
        );
        await page.setViewport({
          width: 1280,
          height: 800,
          deviceScaleFactor: 1,
        });
        await page.setContent(html, {
          waitUntil: ["domcontentloaded", "networkidle0"],
          timeout: 30_000,
        });

        // Optional: ensure print colours/backgrounds
        await page.addStyleTag({
          content: `
            @page { size: A4; margin: 20mm; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            html, body { background: #fff; }
          `,
        });

        const pdf = await page.pdf({
          format: "A4",
          printBackground: true,
          displayHeaderFooter: false,
          preferCSSPageSize: true,
          margin: { top: "20mm", right: "20mm", bottom: "20mm", left: "20mm" },
        });

        console.log(
          `Attempt ${attempt + 1}: PDF generated successfully, size: ${
            pdf.length
          } bytes`
        );

        // Success: return immediately
        const safeFilename = sanitizeFilename(filename);
        return new Response(pdf, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${safeFilename}"`,
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Content-Security-Policy": "default-src 'none'",
          },
        });
      } catch (err) {
        lastError = err;
        console.error(`Attempt ${attempt + 1} failed:`, err);

        // Clean up resources and try again
        if (page && !page.isClosed()) {
          try {
            await page.close();
          } catch (closeError) {
            console.error("Error closing page:", closeError);
          }
        }
        page = null;

        if (browser) {
          try {
            await browser.close();
          } catch (closeError) {
            console.error("Error closing browser:", closeError);
          }
        }
        browser = null;

        // Small backoff before retry
        if (attempt < maxRetries) {
          console.log(`Waiting 800ms before retry...`);
          await new Promise((r) => setTimeout(r, 800));
        }
      }
    }

    // All attempts failed
    console.error("PDF generation failed:", lastError);
    return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
      status: 500,
    });
  } finally {
    try {
      if (page && !page.isClosed()) await page.close();
    } catch {}
    try {
      if (browser) await browser.close();
    } catch {}
  }
}
