import React from "react";
import { siteConfig } from "@/config/site";

export const JsonLd: React.FC = () => {
  const sameAs = [
    siteConfig.github,
    siteConfig.linkedin,
  ].filter(Boolean);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.lastName
      ? `${siteConfig.firstName} ${siteConfig.lastName}`
      : siteConfig.firstName,
    jobTitle: siteConfig.roles.join(" & "),
    description: siteConfig.bio,
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.city,
    },
    email: siteConfig.email ? `mailto:${siteConfig.email}` : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

