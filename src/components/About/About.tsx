import React from "react";
import styles from "./About.module.css";
import { siteConfig } from "@/config/site";

export const About: React.FC = () => {
  const socialLinks = [
    { label: "GitHub", url: siteConfig.github?.trim() },
    { label: "LinkedIn", url: siteConfig.linkedin?.trim() },
  ].filter((item): item is { label: string; url: string } => Boolean(item.url));

  return (
    <section id="about" className={styles.aboutSection} aria-label="About Aaron">
      <div className={styles.container}>
        <div className={styles.tornAboutCard}>
          <span className={styles.cardPin} aria-hidden="true" />
          <div className={styles.badgeRow}>
            <span className={styles.aboutBadge}>ABOUT // THE MAKER</span>
            <span className={styles.locationBadge}>{siteConfig.city} · Available</span>
          </div>

          <h2 className={styles.aboutHeading}>
            Building at the intersection of tactile design and clean code.
          </h2>

          <p className={styles.bioText}>{siteConfig.bio}</p>

          {/* Social Links from Config */}
          {socialLinks.length > 0 && (
            <div className={styles.socialRow}>
              <span className={styles.socialLabel}>Profiles:</span>
              <ul className={styles.socialList}>
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={`${social.label} (opens in a new tab)`}
                    >
                      {social.label} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

