import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectsPath = resolve("src/config/projects.ts");
const projectsContent = readFileSync(projectsPath, "utf-8");

const projectBlocks = projectsContent.split(/\{\s*id:/).slice(1);
const urlsToCheck = [];

for (const block of projectBlocks) {
  const id = block.match(/["']([^"']+)["']/)?.[1] ?? "unknown";
  const url = block.match(/url:\s*["']([^"']*)["']/)?.[1] ?? "";
  const status = block.match(/status:\s*["']([^"']+)["']/)?.[1] ?? "coming-soon";

  if (status === "live" || url.trim().length > 0) {
    urlsToCheck.push({ id, url });
  }
}

async function verifyLinks() {
  if (urlsToCheck.length === 0) {
    console.log("No live project URLs to verify.");
    process.exit(0);
  }

  const failures = [];

  for (const { id, url } of urlsToCheck) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      failures.push(`[${id}] Invalid URL format: "${url}"`);
      continue;
    }

    if (parsed.protocol !== "https:") {
      failures.push(`[${id}] URL must use https:// -> "${url}"`);
      continue;
    }

    try {
      let res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (res.status === 405 || res.status === 403) {
        res = await fetch(url, { method: "GET", redirect: "follow" });
      }
      if (res.status < 200 || res.status >= 400) {
        failures.push(`[${id}] ${url} returned HTTP ${res.status}`);
      } else {
        console.log(`✓ [${id}] ${url} -> HTTP ${res.status}`);
      }
    } catch (err) {
      failures.push(`[${id}] Request failed for ${url}: ${err.message}`);
    }
  }

  if (failures.length > 0) {
    console.error("\n❌ Link check failed:");
    failures.forEach((f) => console.error("  - " + f));
    process.exit(1);
  }

  console.log(`\n✓ Link safety passed: ${urlsToCheck.length} live project URL(s) verified.`);
}

verifyLinks();

