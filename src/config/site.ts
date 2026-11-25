export interface QuoteConfig {
  text: string;
  highlight: string;
}

export interface SiteConfig {
  firstName: string;
  lastName?: string;
  roles: string[];
  quote: QuoteConfig;
  quoteAuthor?: string;
  bio: string;
  city: string;
  timezone: string;
  email?: string;
  github?: string;
  linkedin?: string;
  heroCutoutImage?: string;
}

export const siteConfig: SiteConfig = {
  firstName: "Aaron",
  lastName: "Singh",
  roles: ["Creative Developer", "Product Builder"],
  quote: {
    text: "Simplicity is about subtracting the obvious and adding the meaningful.",
    highlight: "adding the meaningful",
  },
  quoteAuthor: "John Maeda",
  bio: "I design and build tactile websites and digital tools. Combining clean frontend engineering with playful, handcrafted visual experiments.",
  city: "Delhi",
  timezone: "Asia/Kolkata",
  email: "aasingh1822@gmail.com",
  github: "", // TODO: add GitHub profile URL
  linkedin: "", // TODO: add LinkedIn profile URL
  heroCutoutImage: undefined, // Optional cutout path
};
