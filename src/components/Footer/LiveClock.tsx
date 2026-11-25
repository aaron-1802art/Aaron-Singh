import React from "react";
import styles from "./Footer.module.css";
import { useLiveClock } from "@/hooks/useLiveClock";
import { siteConfig } from "@/config/site";

export const LiveClock: React.FC = () => {
  const clockText = useLiveClock(siteConfig.city, siteConfig.timezone);

  return (
    <div className={styles.clockContainer}>
      <span className={styles.clockPulseDot} aria-hidden="true" />
      <span className={styles.clockText}>
        {clockText || `${siteConfig.city} · Loading...`}
      </span>
    </div>
  );
};

