import React from "react";
import styles from "./Footer.module.css";
import { LiveClock } from "./LiveClock";
import { siteConfig } from "@/config/site";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} aria-label="Site Footer">
      <div className={styles.container}>
        <div className={styles.bottomBar}>
          <div className={styles.leftCol}>
            <span className={styles.availabilityLabel}>
              <span className={styles.greenBeacon} aria-hidden="true" />
              Available worldwide
            </span>
            <LiveClock />
          </div>

          <div className={styles.rightCol}>
            <span className={styles.copyrightText}>
              © {new Date().getFullYear()} {siteConfig.firstName} {siteConfig.lastName || ""}. Handcrafted with code.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
