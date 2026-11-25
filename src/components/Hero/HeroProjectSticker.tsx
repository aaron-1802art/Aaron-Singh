import React, { useState } from "react";
import styles from "./Hero.module.css";
import { Project } from "@/config/projects";

interface HeroProjectStickerProps {
  project: Project;
  index: number;
}

export const HeroProjectSticker: React.FC<HeroProjectStickerProps> = ({
  project,
  index,
}) => {
  const [imgError, setImgError] = useState(false);
  const isLive = Boolean(project.url && project.url.startsWith("https://"));

  const stickerStyle: React.CSSProperties = {
    "--base-tilt": `${project.tilt}deg`,
    transform: `rotate(${project.tilt}deg)`,
  } as React.CSSProperties;

  const animClass = index % 2 === 0 ? "animate-float-1" : "animate-float-2";

  const content = (
    <>
      <span
        className={styles.stickerAccentBar}
        style={{ backgroundColor: project.accent }}
        aria-hidden="true"
      />

      {/* Mini Real Screenshot Preview or Accent Fallback */}
      <div className={styles.stickerThumbWrap} aria-hidden="true">
        {project.thumbnail && !imgError ? (
          <img
            src={project.thumbnail}
            alt=""
            className={styles.stickerThumbImg}
            loading="lazy"
            decoding="async"
            width={112}
            height={70}
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            className={styles.stickerThumbFallback}
            style={{ backgroundColor: project.accent }}
          >
            {project.title.charAt(0)}
          </span>
        )}
      </div>

      <div className={styles.stickerBody}>
        <div className={styles.stickerHeaderRow}>
          <span
            className={styles.stickerKind}
            style={{ color: project.accentInk }}
          >
            {project.kind}
          </span>
        </div>
        <span className={styles.stickerTitle}>{project.title}</span>
        <span className={isLive ? styles.stickerVisit : styles.stickerSoon}>
          {isLive ? "Visit ↗" : "Coming soon"}
        </span>
      </div>
    </>
  );

  if (isLive) {
    return (
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${project.title} (opens in a new tab)`}
        className={`${styles.heroProjectSticker} ${styles.heroProjectStickerLive} ${animClass}`}
        style={stickerStyle}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      role="article"
      aria-label={`${project.title} (${project.kind}) — Coming soon`}
      className={`${styles.heroProjectSticker} ${styles.heroProjectStickerSoon} ${animClass}`}
      style={stickerStyle}
    >
      {content}
    </div>
  );
};
