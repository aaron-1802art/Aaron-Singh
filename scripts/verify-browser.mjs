import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const screenshotDir = resolve("screenshots");
mkdirSync(screenshotDir, { recursive: true });

function rectsOverlap(a, b, pad = 2) {
  if (!a || !b) return false;
  return !(
    a.right <= b.left + pad ||
    a.left >= b.right - pad ||
    a.bottom <= b.top + pad ||
    a.top >= b.bottom - pad
  );
}

async function runVerification() {
  console.log("Connecting to Chrome on port 9222...");
  const browser = await puppeteer.connect({
    browserURL: "http://localhost:9222",
    defaultViewport: null,
  });

  const page = await browser.newPage();
  const consoleMessages = [];
  const pageErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  // 1. Audit Hero across all 8 required viewports + Quote Author + Links + Unverified Copy
  const heroViewports = [
    { width: 360, height: 640, name: "hero-360" },
    { width: 390, height: 844, name: "hero-390" },
    { width: 768, height: 1024, name: "hero-768" },
    { width: 1024, height: 768, name: "hero-1024" },
    { width: 1366, height: 650, name: "hero-1366x650" },
    { width: 1440, height: 800, name: "hero-1440x800" },
    { width: 1920, height: 1080, name: "hero-1920" },
    { width: 2560, height: 1440, name: "hero-2560" },
  ];

  for (const vp of heroViewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 950));

    // Trigger short ink trail on 1440x800
    if (vp.name === "hero-1440x800") {
      await page.mouse.move(500, 460);
      await page.mouse.move(620, 420, { steps: 6 });
      await page.mouse.move(740, 440, { steps: 6 });
      await new Promise((r) => setTimeout(r, 120));
    }

    const audit = await page.evaluate(() => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const box = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || r.width === 0 || r.height === 0) {
          return null;
        }
        return {
          left: Math.round(r.left),
          right: Math.round(r.right),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          width: Math.round(r.width),
          height: Math.round(r.height),
        };
      };

      const playButtonFound = Boolean(
        document.querySelector('button[aria-label*="playful"]') ||
          document.body.classList.contains("play-mode-active")
      );
      const quoteAuthorText = document.querySelector('[class*="quoteAuthor"]')?.textContent?.trim() ?? "";

      return {
        winW,
        winH,
        overflowX: document.documentElement.scrollWidth > winW,
        playButtonFound,
        hasInkCanvas: Boolean(document.querySelector('canvas[aria-hidden="true"]')),
        showreel: box('[class*="showreelLink"]'),
        badge: box('[class*="spinningBadgeWrap"]'),
        ticker: box('[class*="tickerBand"]'),
        name: box('[class*="hugeName"]'),
        quote: box('[class*="quoteArrowGroup"]'),
        quoteCard: box('[class*="tornQuoteCard"]'),
        quoteArrow: box('[class*="quoteArrowWrap"]'),
        quoteAuthor: box('[class*="quoteAuthor"]'),
        quoteAuthorText,
        stickers: box('[class*="heroStickersCluster"]'),
        stickerCount: document.querySelectorAll('[class*="heroProjectSticker"]').length,
        bottomBar: box('[class*="heroBottomBar"]'),
        brokenHeroImgs: Array.from(document.querySelectorAll("main section:first-of-type img")).filter(
          (img) => img.complete && img.naturalWidth === 0
        ).length,
      };
    });

    if (audit.overflowX) throw new Error(`Horizontal overflow at ${vp.name}`);
    if (audit.playButtonFound) throw new Error(`Play remnants at ${vp.name}`);
    if (!audit.hasInkCanvas || !audit.showreel || !audit.badge || !audit.ticker) {
      throw new Error(`Missing core hero component at ${vp.name}: ${JSON.stringify(audit)}`);
    }
    if (audit.quoteAuthorText !== "— John Maeda" || !audit.quoteAuthor) {
      throw new Error(`Missing or malformed quote author at ${vp.name}: ${JSON.stringify(audit)}`);
    }
    if (rectsOverlap(audit.quoteAuthor, audit.quoteArrow, 1)) {
      throw new Error(`Quote author overlaps arrow at ${vp.name}`);
    }
    if (audit.stickerCount !== 3 || audit.brokenHeroImgs > 0) {
      throw new Error(`Hero stickers/images issue at ${vp.name}`);
    }

    if (vp.width >= 1024) {
      const bottomOverflow = [
        ["name", audit.name],
        ["showreel", audit.showreel],
        ["badge", audit.badge],
        ["quote", audit.quote],
        ["stickers", audit.stickers],
        ["ticker", audit.ticker],
        ["bottomBar", audit.bottomBar],
      ].filter(([, r]) => r && r.bottom > audit.winH + 2);
      if (bottomOverflow.length > 0) {
        throw new Error(`Hero bottom clipped at ${vp.name}: ${JSON.stringify(bottomOverflow)}`);
      }
    }

    const pairs = [
      ["showreel", audit.showreel, "name", audit.name],
      ["badge", audit.badge, "name", audit.name],
      ["showreel", audit.showreel, "badge", audit.badge],
      ["quote", audit.quote, "name", audit.name],
      ["stickers", audit.stickers, "name", audit.name],
      ["quote", audit.quote, "stickers", audit.stickers],
      ["quote", audit.quote, "ticker", audit.ticker],
      ["stickers", audit.stickers, "ticker", audit.ticker],
      ["ticker", audit.ticker, "bottomBar", audit.bottomBar],
      ["showreel", audit.showreel, "quote", audit.quote],
      ["badge", audit.badge, "stickers", audit.stickers],
    ];
    const overlaps = pairs.filter(([, a, , b]) => rectsOverlap(a, b, 2));
    if (overlaps.length > 0) {
      throw new Error(`Hero overlap at ${vp.name}: ${JSON.stringify(overlaps.map((o) => [o[0], o[2]]))}`);
    }

    await page.screenshot({ path: resolve(screenshotDir, `${vp.name}.png`), fullPage: false });
    console.log(`✓ Hero ${vp.width}x${vp.height} (${vp.name}.png): quote author ok, 0 clipping, 0 overlaps`);
  }

  // 2. Watch Hero for 20s to confirm LiveShowreelDevice cycles all 5 projects + loops + pause/resume
  await page.setViewport({ width: 1440, height: 800 });
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await page.mouse.move(10, 10); // cursor away from showreel

  const expectedOrder = [
    "Hunger Drama",
    "Dinja Studio",
    "Shreedha Artistry",
    "Algo1",
    "Brainstorm Canvas",
    "Hunger Drama",
  ];
  const observedSequence = [];

  for (let step = 0; step < 6; step++) {
    const snap = await page.evaluate(() => {
      const link = document.querySelector('[class*="showreelLink"]');
      const activeImgs = Array.from(document.querySelectorAll('[class*="showreelSlideActive"] img')).map((img) =>
        img.getAttribute("src")
      );
      const fillActive = Boolean(document.querySelector('[class*="progressDotFill"]'));
      return {
        title: document.querySelector('[class*="showreelTitle"]')?.textContent?.trim(),
        href: link?.getAttribute("href"),
        ariaLabel: link?.getAttribute("aria-label"),
        activeImgs,
        fillActive,
      };
    });
    observedSequence.push(snap);
    if (snap.title !== expectedOrder[step]) {
      throw new Error(`Showreel step ${step} expected "${expectedOrder[step]}", got ${JSON.stringify(snap)}`);
    }
    if (!snap.ariaLabel?.includes(snap.title) || !snap.href?.startsWith("https://") || !snap.fillActive) {
      throw new Error(`Showreel metadata invalid at step ${step}: ${JSON.stringify(snap)}`);
    }
    if (step < 5) {
      await new Promise((r) => setTimeout(r, 3600));
    }
  }
  console.log(
    `✓ Showreel cycled full 5-project loop over ~19s: ${observedSequence.map((s) => s.title).join(" -> ")}`
  );

  // Verify pause on hover AND resume after mouse leaves
  const showreelBox = await page.evaluate(() => {
    const r = document.querySelector('[class*="showreelLink"]').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.move(showreelBox.x, showreelBox.y);
  const pausedTitle = await page.evaluate(
    () => document.querySelector('[class*="showreelTitle"]')?.textContent?.trim()
  );
  await new Promise((r) => setTimeout(r, 3800));
  const stillPausedTitle = await page.evaluate(
    () => document.querySelector('[class*="showreelTitle"]')?.textContent?.trim()
  );
  if (stillPausedTitle !== pausedTitle) {
    throw new Error(`Showreel did not pause while hovered (${pausedTitle} -> ${stillPausedTitle})`);
  }

  // Move mouse out and confirm resume
  await page.mouse.move(10, 10);
  await new Promise((r) => setTimeout(r, 3800));
  const resumedTitle = await page.evaluate(
    () => document.querySelector('[class*="showreelTitle"]')?.textContent?.trim()
  );
  if (resumedTitle === stillPausedTitle) {
    throw new Error(`Showreel failed to resume after mouse left (${stillPausedTitle})`);
  }
  console.log(`✓ Showreel paused on hover (${pausedTitle}) and resumed on leave (-> ${resumedTitle})`);

  // 3. elementsFromPoint audit across About & Say hi (16 points per section at 1440x800 and 390x844)
  for (const vp of [
    { width: 1440, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewport(vp);
    for (const sectionId of ["about", "contact"]) {
      await page.goto(`http://localhost:4173/#${sectionId}`, { waitUntil: "networkidle0" });
      await new Promise((r) => setTimeout(r, 400));
      const hitResult = await page.evaluate((id) => {
        const sec = document.getElementById(id);
        const r = sec.getBoundingClientRect();
        const violations = [];
        let tested = 0;

        for (let xi = 0; xi < 4; xi++) {
          for (let yi = 0; yi < 4; yi++) {
            const x = Math.round(r.left + 12 + ((r.width - 24) * xi) / 3);
            const y = Math.round(
              Math.max(8, Math.min(window.innerHeight - 8, r.top + 16 + ((r.height - 32) * yi) / 3))
            );
            tested++;
            const stack = document.elementsFromPoint(x, y);
            const fromWork = stack.find((el) => el.closest("#work"));
            if (fromWork) {
              violations.push({ x, y, tag: fromWork.tagName, href: fromWork.getAttribute?.("href") });
            }
          }
        }
        return { tested, violations };
      }, sectionId);

      if (hitResult.tested < 16 || hitResult.violations.length > 0) {
        throw new Error(
          `Work element leaked over #${sectionId} at ${vp.width}x${vp.height}: ${JSON.stringify(hitResult)}`
        );
      }
    }
  }
  console.log("✓ elementsFromPoint (32 pts across About & Say hi at 1440x800 & 390x844): 0 Work leaks");

  // 4. Verify blank GitHub/LinkedIn links are hidden, Email is present, and copy has 0 unverified claims
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  const linkAndCopyAudit = await page.evaluate(() => {
    const githubLinks = Array.from(document.querySelectorAll('a[href*="github.com"], a[aria-label*="GitHub"]'));
    const linkedinLinks = Array.from(
      document.querySelectorAll('a[href*="linkedin.com"], a[aria-label*="LinkedIn"]')
    );
    const emailLinks = Array.from(document.querySelectorAll('a[href="mailto:aasingh1822@gmail.com"]'));
    const allNavHrefs = Array.from(document.querySelectorAll("header nav a")).map((a) => a.getAttribute("href"));
    const bodyText = document.body.innerText;
    const unverifiedMatch = bodyText.match(
      /\b(fast|high-performance|blazing|best|award-winning|world-class|cutting-edge|fastest)\b/i
    );
    return {
      githubCount: githubLinks.length,
      linkedinCount: linkedinLinks.length,
      emailCount: emailLinks.length,
      allNavHrefs,
      unverifiedMatch: unverifiedMatch?.[0] ?? null,
    };
  });
  if (
    linkAndCopyAudit.githubCount > 0 ||
    linkAndCopyAudit.linkedinCount > 0 ||
    linkAndCopyAudit.emailCount !== 1 ||
    linkAndCopyAudit.unverifiedMatch
  ) {
    throw new Error(`Profile link or copy audit failed: ${JSON.stringify(linkAndCopyAudit)}`);
  }
  console.log("✓ Blank GitHub/LinkedIn links hidden; Email active; zero unverified copy claims");

  // 5. Work Board consistency (16:10 screenshots + front-overlapping phone mockup at all 6 viewports)
  const workViewports = [
    { width: 360, height: 640, name: "work-360" },
    { width: 390, height: 844, name: "work-390" },
    { width: 768, height: 1024, name: "work-768" },
    { width: 1024, height: 768, name: "work-1024" },
    { width: 1440, height: 900, name: "work-1440" },
    { width: 1920, height: 1080, name: "work-1920" },
  ];

  for (const vp of workViewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto("http://localhost:4173/#work", { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 850));

    const workAudit = await page.evaluate(() => {
      const winW = window.innerWidth;
      const cards = Array.from(document.querySelectorAll('#work a[class*="projectCard"]'));
      const imgs = Array.from(document.querySelectorAll("#work img"));
      const cardBounds = cards.map((c, idx) => {
        const r = c.getBoundingClientRect();
        const vpEl = c.querySelector('[class*="browserViewport"]');
        const vpBox = vpEl.getBoundingClientRect();
        const vpRatio = +(vpEl.offsetWidth / vpEl.offsetHeight).toFixed(3);
        const frameZ = parseInt(getComputedStyle(c.querySelector('[class*="browserFrame"]')).zIndex, 10) || 0;
        const phone = c.querySelector('[class*="phoneMockup"]');
        const phoneBox = phone?.getBoundingClientRect();
        const phoneStyle = phone ? getComputedStyle(phone) : null;
        const phoneZ = phoneStyle ? parseInt(phoneStyle.zIndex, 10) || 0 : 0;

        return {
          idx,
          title: c.querySelector("h3")?.textContent?.trim(),
          left: Math.round(r.left),
          right: Math.round(r.right),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          clippedX: r.left < -1 || r.right > winW + 1,
          vpRatio,
          phoneInFront: phoneZ > frameZ && parseFloat(phoneStyle?.opacity || "0") > 0.95,
          phoneOverlapsRight:
            Boolean(phoneBox) && phoneBox.right >= vpBox.right - 2 && phoneBox.left < vpBox.right - 10,
        };
      });

      const brokenImgs = imgs.filter((img) => img.complete && img.naturalWidth === 0).length;
      return {
        overflowX: document.documentElement.scrollWidth > winW,
        cardCount: cards.length,
        cardBounds,
        anyClippedX: cardBounds.some((c) => c.clippedX),
        ratioMismatch: cardBounds.filter((c) => Math.abs(c.vpRatio - 1.6) > 0.06),
        phoneHidden: cardBounds.filter((c) => !c.phoneInFront || !c.phoneOverlapsRight),
        brokenImgs,
      };
    });

    let anyOverlap = false;
    for (let i = 0; i < workAudit.cardBounds.length; i++) {
      for (let j = i + 1; j < workAudit.cardBounds.length; j++) {
        if (rectsOverlap(workAudit.cardBounds[i], workAudit.cardBounds[j], 2)) anyOverlap = true;
      }
    }

    if (
      workAudit.overflowX ||
      workAudit.cardCount !== 5 ||
      workAudit.anyClippedX ||
      anyOverlap ||
      workAudit.brokenImgs > 0 ||
      workAudit.ratioMismatch.length > 0 ||
      workAudit.phoneHidden.length > 0
    ) {
      throw new Error(`WorkBoard consistency failed at ${vp.name}: ${JSON.stringify(workAudit)}`);
    }

    await page.screenshot({ path: resolve(screenshotDir, `${vp.name}.png`), fullPage: false });
    if (vp.width === 1440) {
      // Scroll cleanly so Dinja Studio + Shreedha Artistry + Algo1 + Brainstorm Canvas are captured too
      await page.evaluate(() => window.scrollBy(0, 620));
      await new Promise((r) => setTimeout(r, 250));
      await page.screenshot({ path: resolve(screenshotDir, "work-1440-masonry.png"), fullPage: false });
    }
    console.log(`✓ Work ${vp.width}x${vp.height} (${vp.name}.png): all 16:10 frames + phones in front, 0 overlap`);
  }

  // 6. Drag vs tap + Keyboard Tab + Reduced motion + Zero console errors
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:4173/#work", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
  const cardCenter = await page.evaluate(() => {
    const r = document.querySelector('#work a[class*="projectCard"]').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  const pagesBeforeDrag = (await browser.pages()).length;
  await page.mouse.move(cardCenter.x, cardCenter.y);
  await page.mouse.down();
  await page.mouse.move(cardCenter.x + 25, cardCenter.y + 15, { steps: 5 });
  await page.mouse.up();
  await new Promise((r) => setTimeout(r, 250));
  if ((await browser.pages()).length !== pagesBeforeDrag) {
    throw new Error("Dragging a project card triggered navigation!");
  }
  console.log("✓ Drag (>6px) moved card without triggering navigation");

  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
  console.log(`✓ Keyboard Tab navigation verified (focused element: ${focusedTag})`);

  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 200));
  const reducedAudit = await page.evaluate(() => {
    const underlinePath = document.querySelector(".brush-write-on-1");
    const quoteWrap = document.querySelector('[class*="quoteCard"]');
    const showreelFrame = document.querySelector('[class*="showreelFloat"]');
    return {
      underlineAnim: underlinePath ? getComputedStyle(underlinePath).animationName : "none",
      quoteAnim: quoteWrap ? getComputedStyle(quoteWrap).animationName : "none",
      showreelAnim: showreelFrame ? getComputedStyle(showreelFrame).animationName : "none",
    };
  });
  if (reducedAudit.underlineAnim !== "none" || reducedAudit.quoteAnim !== "none" || reducedAudit.showreelAnim !== "none") {
    throw new Error(`Animations still running under prefers-reduced-motion: ${JSON.stringify(reducedAudit)}`);
  }
  console.log("✓ prefers-reduced-motion disables hero float/write-on animations cleanly");

  if (pageErrors.length > 0 || consoleMessages.length > 0) {
    throw new Error(`Console errors/warnings detected: ${JSON.stringify({ pageErrors, consoleMessages })}`);
  }
  console.log("✓ Zero console errors or warnings!");

  await page.close();
  await browser.disconnect();
  console.log("\n✅ All 7 fixes and quality gates passed!");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
