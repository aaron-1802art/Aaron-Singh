import React from "react";
import styles from "./WorkBoard.module.css";

interface FallbackThumbnailProps {
  title: string;
  accent: string;
  kind: string;
}

export const FallbackThumbnail: React.FC<FallbackThumbnailProps> = ({
  title,
  accent,
  kind,
}) => {
  const initial = title.charAt(0).toUpperCase() || "A";

  return (
    <div
      className={styles.fallbackThumbnail}
      style={{
        backgroundColor: accent,
      }}
      aria-hidden="true"
    >
      {/* Handcrafted diagonal hatched pattern overlay */}
      <div className={styles.thumbnailPattern} />

      {/* Branded initial letter */}
      <span className={styles.thumbnailInitial}>{initial}</span>

      {/* Corner kind badge */}
      <span className={styles.thumbnailKind}>{kind}</span>
    </div>
  );
};

