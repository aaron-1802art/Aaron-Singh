import React from "react";
import styles from "./Contact.module.css";
import { siteConfig } from "@/config/site";

export const Contact: React.FC = () => {
  const channels = [
    siteConfig.email?.trim() && {
      id: "email",
      label: "Email Me",
      detail: siteConfig.email.trim(),
      href: `mailto:${siteConfig.email.trim()}`,
      accent: "var(--color-cobalt)",
      icon: "✉",
    },
    siteConfig.github?.trim() && {
      id: "github",
      label: "GitHub",
      detail: "Code & experiments",
      href: siteConfig.github.trim(),
      accent: "var(--color-ink)",
      icon: "⌘",
    },
    siteConfig.linkedin?.trim() && {
      id: "linkedin",
      label: "LinkedIn",
      detail: "Connect professionally",
      href: siteConfig.linkedin.trim(),
      accent: "var(--color-purple)",
      icon: "in",
    },
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    detail: string;
    href: string;
    accent: string;
    icon: string;
  }>;

  return (
    <section id="contact" className={styles.contactSection} aria-label="Contact">
      <div className={styles.container}>
        <div className={styles.contactHeader}>
          <span className={styles.contactBadge}>SAY HI // TRANSMISSION</span>
          <h2 className={styles.contactTitle}>Let's build together.</h2>
          <p className={styles.contactSubtitle}>
            Have an exciting idea, website commission or collaboration in mind? Tap below to reach out.
          </p>
        </div>

        {/* Large Accessible Tap Targets */}
        <div className={styles.targetsGrid}>
          {channels.map((ch) => (
            <a
              key={ch.id}
              href={ch.href}
              target={ch.id !== "email" ? "_blank" : undefined}
              rel={ch.id !== "email" ? "noopener noreferrer" : undefined}
              className={styles.contactCard}
              style={{ "--card-accent": ch.accent } as React.CSSProperties}
              aria-label={`${ch.label}: ${ch.detail}`}
            >
              <div className={styles.cardIconBadge}>{ch.icon}</div>
              <div className={styles.cardInfo}>
                <span className={styles.cardLabel}>{ch.label}</span>
                <span className={styles.cardDetail}>{ch.detail}</span>
              </div>
              <span className={styles.cardArrow} aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
