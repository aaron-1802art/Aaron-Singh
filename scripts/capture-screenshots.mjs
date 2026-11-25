import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve("public/projects");
mkdirSync(outDir, { recursive: true });

// Read projects dynamically from src/config/projects.ts
function loadProjectsFromConfig() {
  const raw = readFileSync(resolve("src/config/projects.ts"), "utf-8");
  const blocks = raw.split(/\{\s*id:/).slice(1);
  return blocks
    .map((block) => {
      const id = block.match(/["']([^"']+)["']/)?.[1] ?? "";
      const url = block.match(/url:\s*["']([^"']*)["']/)?.[1] ?? "";
      return { id, url };
    })
    .filter((p) => p.id && p.url.startsWith("https://"));
}

async function waitForSiteReady(page, id) {
  try {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
  } catch {
    // Fallback if a site has long-polling sockets
  }

  if (id === "hunger-drama") {
    try {
      const hasIntro = await page.evaluate(() => /click or press any key to skip|scene 1/i.test(document.body.innerText));
      if (hasIntro) {
        await page.mouse.click(200, 200);
      }
      await page.waitForFunction(
        () =>
          !/click or press any key to skip/i.test(document.body.innerText) &&
          /your cravings|explore the menu/i.test(document.body.innerText),
        { timeout: 12000 }
      );
      await page.waitForTimeout(900);
    } catch {
      console.warn("  [warn] hunger-drama intro skip wait timed out");
    }
  }

  if (id === "dinja-studio") {
    try {
      await page.waitForFunction(
        () => {
          const loadingEls = Array.from(document.querySelectorAll("*")).filter(
            (el) => /loading\s+experience/i.test(el.textContent || "")
          );
          const anyVisibleLoading = loadingEls.some((el) => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              parseFloat(style.opacity) > 0.05 &&
              rect.width > 0 &&
              rect.height > 0
            );
          });
          return (
            !anyVisibleLoading &&
            !/loading\s+experience/i.test(document.body.innerText) &&
            /videos|showreel/i.test(document.body.innerText)
          );
        },
        { timeout: 25000 }
      );
      await page.waitForTimeout(1600);
    } catch {
      console.warn("  [warn] dinja-studio Loading Experience overlay wait timed out");
    }
  }

  if (id === "brainstorm-canvas") {
    try {
      await page.waitForFunction(
        () => !document.body.innerText.includes("Loading canvas"),
        { timeout: 15000 }
      );
    } catch {
      console.warn("  [warn] brainstorm-canvas Loading canvas wait timed out");
    }
  }

  if (id === "shreedha-artistry") {
    // Dismiss or hide cookie notice if visible
    try {
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button, a"));
        const target = buttons.find((el) =>
          /accept|got it|agree|allow|close|dismiss|ok/i.test(el.textContent || "") &&
          /cookie|consent|privacy/i.test(el.closest("div, section, aside")?.textContent || "")
        );
        if (target && target instanceof HTMLElement) {
          target.click();
          return true;
        }
        // Fallback: hide fixed/bottom cookie banner elements
        const overlays = Array.from(document.querySelectorAll("div, section, aside"));
        let hid = false;
        for (const el of overlays) {
          const st = getComputedStyle(el);
          if (
            (st.position === "fixed" || st.position === "sticky") &&
            /cookie/i.test(el.textContent || "")
          ) {
            el.style.display = "none";
            hid = true;
          }
        }
        return hid;
      });
      if (clicked) {
        await page.waitForTimeout(400);
      }
    } catch {
      // Safe ignore
    }
  }

  if (id === "algo1") {
    await page.waitForTimeout(2600);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(500);
  } else {
    await page.waitForTimeout(1500);
  }
}

async function convertPngToWebp(helperPage, pngBuffer, maxWidth, maxBytes = 148 * 1024) {
  const b64 = pngBuffer.toString("base64");
  const dataUri = `data:image/png;base64,${b64}`;

  for (const quality of [0.82, 0.75, 0.66, 0.56]) {
    const webpDataUrl = await helperPage.evaluate(
      async ({ src, targetWidth, q }) => {
        const img = new Image();
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = src;
        });

        const scale = img.naturalWidth > targetWidth ? targetWidth / img.naturalWidth : 1;
        const w = Math.round(img.naturalWidth * scale);
        const h = Math.round(img.naturalHeight * scale);

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, w, h);
        return canvas.toDataURL("image/webp", q);
      },
      { src: dataUri, targetWidth: maxWidth, q: quality }
    );

    const base64Part = webpDataUrl.split(",")[1];
    const buffer = Buffer.from(base64Part, "base64");
    if (buffer.length <= maxBytes || quality <= 0.56) {
      return { buffer, quality };
    }
  }
}

async function main() {
  const targets = loadProjectsFromConfig();
  console.log(`Capturing desktop + mobile screenshots for ${targets.length} projects...\n`);

  const browser = await chromium.launch({ headless: true });
  const helperContext = await browser.newContext();
  const helperPage = await helperContext.newPage();

  for (const project of targets) {
    console.log(`→ [${project.id}] ${project.url}`);

    // 1. Desktop 1440x900 (scaled to max 1280px wide WebP)
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopCtx.newPage();
    await desktopPage.goto(project.url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitForSiteReady(desktopPage, project.id);

    const desktopPng = await desktopPage.screenshot({ type: "png" });
    const desktopWebp = await convertPngToWebp(helperPage, desktopPng, 1280);
    const desktopPath = resolve(outDir, `${project.id}-desktop.webp`);
    writeFileSync(desktopPath, desktopWebp.buffer);
    console.log(
      `  ✓ desktop: ${desktopPath} (${Math.round(desktopWebp.buffer.length / 1024)} KB, q=${desktopWebp.quality})`
    );
    await desktopCtx.close();

    // 2. Mobile 390x844 (isMobile, deviceScaleFactor 2 -> scaled cleanly to ~520px wide WebP under 150KB)
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      deviceScaleFactor: 2,
      hasTouch: true,
    });
    const mobilePage = await mobileCtx.newPage();
    await mobilePage.goto(project.url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await waitForSiteReady(mobilePage, project.id);

    const mobilePng = await mobilePage.screenshot({ type: "png" });
    const mobileWebp = await convertPngToWebp(helperPage, mobilePng, 520);
    const mobilePath = resolve(outDir, `${project.id}-mobile.webp`);
    writeFileSync(mobilePath, mobileWebp.buffer);
    console.log(
      `  ✓ mobile:  ${mobilePath} (${Math.round(mobileWebp.buffer.length / 1024)} KB, q=${mobileWebp.quality})\n`
    );
    await mobileCtx.close();
  }

  await browser.close();
  console.log("✅ All project screenshots captured successfully.");
}

main().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
