export type ProjectKind = "Website" | "App" | "Design" | "Other";
export type ProjectStatus = "live" | "coming-soon";

export interface Project {
  id: string;
  title: string;
  kind: ProjectKind;
  year?: string;
  description: string;
  story: string;
  tags: string[];
  url: string;
  thumbnail?: string;
  mobileThumbnail?: string;
  accent: string;
  accentInk: string;
  accentOnFill: string;
  tilt: number;
  status: ProjectStatus;
}

export const projects: Project[] = [
  {
    id: "hunger-drama",
    title: "Hunger Drama",
    kind: "Website",
    description:
      "Street-food brand site for a Vikaspuri, Delhi kitchen: menu, cart and direct WhatsApp ordering.",
    story: "I built a street-food brand site with a live cart and direct WhatsApp orders.",
    tags: ["Food brand", "Ordering", "WhatsApp"],
    url: "https://hunger-drama.vercel.app/",
    thumbnail: "/projects/hunger-drama-desktop.webp",
    mobileThumbnail: "/projects/hunger-drama-mobile.webp",
    accent: "#00C27A",
    accentInk: "#006E45",
    accentOnFill: "#0A0A0A",
    tilt: -2.2,
    status: "live",
  },
  {
    id: "dinja-studio",
    title: "Dinja Studio",
    kind: "Website",
    description:
      "Cinematic site for a video production studio in Alwar: showreel hero, services, packages and a quote form.",
    story: "I crafted a showreel-driven studio site with service packages and a quote form.",
    tags: ["Studio", "Video", "Lead generation"],
    url: "https://dinja-studio.vercel.app/",
    thumbnail: "/projects/dinja-studio-desktop.webp",
    mobileThumbnail: "/projects/dinja-studio-mobile.webp",
    accent: "#8B3FE0",
    accentInk: "#4A1199",
    accentOnFill: "#FFFFFF",
    tilt: 2.4,
    status: "live",
  },
  {
    id: "shreedha-artistry",
    title: "Shreedha Artistry",
    kind: "Website",
    description:
      "Online store for handcrafted devotional goods: shop, categories and CAD / USD / INR pricing.",
    story: "I designed an online store for handcrafted devotional goods in CAD, USD and INR.",
    tags: ["E-commerce", "Devotional goods"],
    url: "https://shreedha-artistry.vercel.app/",
    thumbnail: "/projects/shreedha-artistry-desktop.webp",
    mobileThumbnail: "/projects/shreedha-artistry-mobile.webp",
    accent: "#F25CF2",
    accentInk: "#9E0E9E",
    accentOnFill: "#0A0A0A",
    tilt: -1.8,
    status: "live",
  },
  {
    id: "algo1",
    title: "Algo1",
    kind: "App",
    description:
      "Product site with an interactive demo for a no-code AI trading-strategy builder.",
    story: "I built the product site and interactive demo for a no-code trading builder.",
    tags: ["SaaS", "AI", "Fintech"],
    url: "https://algo-1.vercel.app/",
    thumbnail: "/projects/algo1-desktop.webp",
    mobileThumbnail: "/projects/algo1-mobile.webp",
    accent: "#0B2EE6",
    accentInk: "#0925BA",
    accentOnFill: "#FFFFFF",
    tilt: 3.1,
    status: "live",
  },
  {
    id: "brainstorm-canvas",
    title: "Brainstorm Canvas",
    kind: "App",
    description: "A minimal infinite canvas for brainstorming together.",
    story: "I created a minimal infinite canvas where anyone can drop in and brainstorm.",
    tags: ["Collaboration", "Whiteboard"],
    url: "https://brainstorm-canvas-lemon.vercel.app/",
    thumbnail: "/projects/brainstorm-canvas-desktop.webp",
    mobileThumbnail: "/projects/brainstorm-canvas-mobile.webp",
    accent: "#0A0A0A",
    accentInk: "#0A0A0A",
    accentOnFill: "#FFFFFF",
    tilt: -2.6,
    status: "live",
  },
];
