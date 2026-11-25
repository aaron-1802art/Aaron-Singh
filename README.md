# Aaron Singh — Handcrafted Personal Portfolio

A playful, handcrafted and memorable personal portfolio website built with **Vite + React + TypeScript** and pure CSS with design tokens. Features self-hosted Google Fonts via `@fontsource`, graph-paper grid aesthetics, scrapbook stickers, a torn-paper quote card, interactive pinboard with draggable/tappable project cards, live footer clock, and a "connect the dots" minigame.

---

## 🎨 Design System & Palette

All values live in design tokens (`src/styles/tokens.css` and typed `src/styles/tokens.ts`):
- **Graph Paper**: `#F6F6F7` background with `rgba(190, 70, 200, 0.28)` grid lines
- **Cobalt Blue**: `#0B2EE6`
- **Magenta**: `#F25CF2`
- **Green**: `#00C27A`
- **Purple**: `#8B3FE0`
- **Ink**: `#0A0A0A`
- **Highlighter**: `rgba(255, 235, 59, 0.65)`

### Self-Hosted Typography:
- **Hero Name**: `Kaushan Script` (`@fontsource/kaushan-script`)
- **Thin Script Label**: `Mrs Saint Delafield` (`@fontsource/mrs-saint-delafield`)
- **Spaced Serif Caps**: `Cormorant Garamond` (`@fontsource/cormorant-garamond`)
- **Body & Meta**: `Space Mono` (`@fontsource/space-mono`)

---

## 📁 How to Edit Content

### 1. Site Configuration (`src/config/site.ts`)
Edit `src/config/site.ts` to customize:
- `firstName` & `lastName` (leave `lastName` empty for a single large display name)
- `roles`: 2 to 3 short labels (e.g. `["Creative Developer", "Product Builder"]`)
- `quote`: Text and its highlighted substring (`highlight`)
- `bio`: 2 to 3 sentences about your craft
- `city` & `timezone`: Default is `"Delhi"` and `"Asia/Kolkata"`
- Contact handles: `email`, `whatsapp`, `instagram`, `github`, `linkedin` (empty fields are automatically hidden)
- `heroCutoutImage`: Optional cutout image path (if omitted, displays an original handcrafted SVG stamp)

### 2. Projects & The Board (`src/config/projects.ts`)
Add or edit projects in `src/config/projects.ts`:
```ts
{
  id: "hunger-drama",
  title: "Hunger Drama",
  kind: "Website", // "Website" | "App" | "Design" | "Other"
  year: "2024",
  description: "A food-brand website featuring bold visual identity and tactile interactions.",
  tags: ["Branding", "Website", "Design"],
  url: "https://example.com", // Valid https URL; if empty, rendered as "Coming soon"
  thumbnail: "/images/projects/hunger-drama.webp", // Optional image path
  accent: "#0B2EE6", // Token color
  tilt: -3.5, // Degrees between -6 and 6
  status: "live", // "live" | "coming-soon"
}
```

### 3. Adding a Thumbnail Image
1. Place your thumbnail image (WebP or AVIF recommended) inside `public/images/projects/` (e.g. `public/images/projects/my-site.webp`).
2. Reference the path in `src/config/projects.ts`: `thumbnail: "/images/projects/my-site.webp"`.
3. If no thumbnail is provided, the card automatically renders a branded fallback tile with custom pattern and monogram initial.

---

## 🚀 Development & Build Commands

```bash
# Install dependencies
npm install

# Start local dev server (default port 3000)
npm run dev

# Content validation (verifies all live URLs, forbidden placeholders, and character limits)
npm run check:content

# Production build (runs check:content -> tsc -> vite build)
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment

### Netlify
1. Connect your repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configuration is already defined in `netlify.toml` with immutable asset caching headers.

### Cloudflare Pages
1. In Cloudflare Dashboard, create a new Pages project connected to your git repository.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Caching and security headers are automatically applied via `public/_headers`.
