import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sitePath = resolve("src/config/site.ts");
const projectsPath = resolve("src/config/projects.ts");

const siteContent = readFileSync(sitePath, "utf-8");
const projectsContent = readFileSync(projectsPath, "utf-8");

const errors = [];

function checkForbiddenWords(text, context) {
  const forbidden = [/TODO/i, /\[EDIT\]/i, /lorem\s+ipsum/i];
  for (const regex of forbidden) {
    if (regex.test(text)) {
      errors.push(`[${context}] Contains placeholder pattern: ${regex}`);
    }
  }
}

// 1. Check Site Config
const highlightMatch = siteContent.match(/highlight:\s*["']([^"']+)["']/);
const quoteTextMatch = siteContent.match(/text:\s*["']([^"']+)["']/);

if (highlightMatch && quoteTextMatch) {
  const highlight = highlightMatch[1];
  const quoteText = quoteTextMatch[1];
  if (!quoteText.includes(highlight)) {
    errors.push(`[site.ts quote] highlight "${highlight}" is not a substring of quote text "${quoteText}"`);
  }
}

const urlRegex = /(https?:\/\/[^\s"',]+)/g;
let match;
while ((match = urlRegex.exec(siteContent)) !== null) {
  const url = match[1];
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      errors.push(`[site.ts URL] URL "${url}" must use https://`);
    }
  } catch (e) {
    errors.push(`[site.ts URL] Invalid URL "${url}": ${e.message}`);
  }
}

// 2. Parse projects from projects.ts
const projectBlocks = projectsContent.split(/\{\s*id:/).slice(1);

projectBlocks.forEach((block, index) => {
  const idMatch = block.match(/["']?([a-zA-Z0-9_-]+)["']?,/);
  const id = idMatch ? idMatch[1] : `Project #${index + 1}`;

  const titleMatch = block.match(/title:\s*["']([^"']+)["']/);
  const title = titleMatch ? titleMatch[1] : "";

  const descMatch = block.match(/description:\s*(?:\n\s*)?["']([^"']+)["']/);
  const desc = descMatch ? descMatch[1] : "";

  const storyMatch = block.match(/story:\s*(?:\n\s*)?["']([^"']+)["']/);
  const story = storyMatch ? storyMatch[1] : "";

  const urlMatch = block.match(/url:\s*["']([^"']*)["']/);
  const url = urlMatch ? urlMatch[1] : "";

  const tiltMatch = block.match(/tilt:\s*(-?[\d.]+)/);
  const tilt = tiltMatch ? parseFloat(tiltMatch[1]) : 0;

  const statusMatch = block.match(/status:\s*["']([^"']+)["']/);
  const status = statusMatch ? statusMatch[1] : "coming-soon";

  if (tilt < -5 || tilt > 5) {
    errors.push(`[projects.ts -> ${id}] Tilt ${tilt}° is outside allowed range of [-5, 5]`);
  }

  if (desc.length > 120) {
    errors.push(`[projects.ts -> ${id}] Description length (${desc.length} chars) exceeds 120 chars`);
  }

  if (story.length > 90) {
    errors.push(`[projects.ts -> ${id}] Story length (${story.length} chars) exceeds 90 chars`);
  }

  if (status === "live") {
    checkForbiddenWords(title, `Project ${id} title`);
    checkForbiddenWords(desc, `Project ${id} description`);
    checkForbiddenWords(story, `Project ${id} story`);

    if (!title || !desc || !story) {
      errors.push(`[projects.ts -> ${id}] Live project is missing title, description, or story`);
    }

    if (!url) {
      errors.push(`[projects.ts -> ${id}] Marked "live" but has empty url`);
    } else {
      try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:") {
          errors.push(`[projects.ts -> ${id}] URL "${url}" must use https://`);
        }
      } catch (e) {
        errors.push(`[projects.ts -> ${id}] Invalid URL "${url}": ${e.message}`);
      }
    }
  } else if (url && url.trim().length > 0) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") {
        errors.push(`[projects.ts -> ${id}] URL "${url}" must use https://`);
      }
    } catch (e) {
      errors.push(`[projects.ts -> ${id}] Invalid URL "${url}": ${e.message}`);
    }
  }
});

if (errors.length > 0) {
  console.error("\n❌ Content Validation Failed with " + errors.length + " error(s):");
  errors.forEach((err) => console.error("  - " + err));
  console.error("");
  process.exit(1);
} else {
  console.log("✓ Content check passed: all live fields, URLs, and constraints verified.");
  process.exit(0);
}
