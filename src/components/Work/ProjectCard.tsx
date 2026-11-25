import React, { useState } from "react";
import styles from "./WorkBoard.module.css";
import { Project } from "@/config/projects";
import { FallbackThumbnail } from "./FallbackThumbnail";
import { useDraggable } from "@/hooks/useDraggable";

interface ProjectCardProps {
  project: Project;
  index: number;
  featured?: boolean;
  isPinned: boolean;
}

function getDomainLabel(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  featured = false,
  isPinned,
}) => {
  const { offset, isDragging, dragProps } = useDraggable();
  const [desktopImgError, setDesktopImgError] = useState(false);
  const [mobileImgError, setMobileImgError] = useState(false);

  const isLive = Boolean(project.url && project.url.startsWith("https://"));
  const indexLabel = String(index + 1).padStart(2, "0");
  const domainLabel = getDomainLabel(project.url);
  const animFloatClass = index % 2 === 0 ? "animate-float-1" : "animate-float-2";

  const slotClassName = [
    styles.boardSlot,
    featured ? styles.slotFeatured : styles[`slotItem${index}`] ?? "",
    isPinned ? styles.slotPinned : styles.slotPrePin,
    animFloatClass,
  ]
    .filter(Boolean)
    .join(" ");

  const slotStyle: React.CSSProperties = {
    "--pin-delay": `${index * 90}ms`,
    "--base-tilt": "0deg",
    zIndex: isDragging ? "var(--z-sticker-drag)" : undefined,
  } as React.CSSProperties;

  const cardStyle: React.CSSProperties = {
    "--drag-x": `${offset.x}px`,
    "--drag-y": `${offset.y}px`,
    "--card-tilt": `${project.tilt}deg`,
    "--card-accent": project.accent,
    "--card-accent-ink": project.accentInk,
    "--card-accent-on-fill": project.accentOnFill,
    cursor: isLive ? (isDragging ? "grabbing" : "grab") : "default",
  } as React.CSSProperties;

  const browserPreview = (
    <div className={styles.visualStage}>
      {/* Browser Window Frame */}
      <div className={styles.browserFrame}>
        <div className={styles.browserChrome} aria-hidden="true">
          <span className={styles.trafficLights}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </span>
          <span className={styles.addressBar}>{domainLabel || "coming-soon"}</span>
        </div>

        <div className={styles.browserViewport}>
          {project.thumbnail && !desktopImgError ? (
            <img
              src={project.thumbnail}
              alt={`${project.title} desktop preview`}
              className={styles.desktopShot}
              loading="lazy"
              decoding="async"
              width={1280}
              height={800}
              onError={() => setDesktopImgError(true)}
            />
          ) : (
            <FallbackThumbnail
              title={project.title}
              accent={project.accent}
              kind={project.kind}
            />
          )}
        </div>
      </div>

      {/* Overlapping Mobile Phone Mockup */}
      {project.mobileThumbnail && !mobileImgError && (
        <div className={styles.phoneMockup} aria-hidden="true">
          <div className={styles.phoneBezel}>
            <span className={styles.phoneNotch} />
            <img
              src={project.mobileThumbnail}
              alt=""
              className={styles.mobileShot}
              loading="lazy"
              decoding="async"
              width={390}
              height={844}
              onError={() => setMobileImgError(true)}
            />
          </div>
        </div>
      )}
    </div>
  );

  const infoContent = (
    <div className={styles.cardInfoPanel}>
      <div className={styles.cardTopRow}>
        <span className={styles.cardIndex}>{indexLabel}</span>
        <span
          className={styles.cardKind}
          style={{ color: project.accentInk }}
        >
          {project.kind}
        </span>
      </div>

      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardDescription}>{project.description}</p>

      {/* Torn-paper story note */}
      <div className={styles.storyNote}>
        <span className={styles.storyPin} aria-hidden="true" />
        <p className={styles.storyText}>{project.story}</p>
      </div>

      {/* Tags */}
      <div className={styles.tagsRow}>
        {project.tags.map((tag) => (
          <span key={tag} className={styles.tagBadge}>
            {tag}
          </span>
        ))}
      </div>

      {/* Visit Pill */}
      <div className={styles.cardFooter}>
        {isLive ? (
          <span className={styles.visitPill}>
            {featured ? "Visit live site" : "Visit"}{" "}
            <span aria-hidden="true">↗</span>
          </span>
        ) : (
          <span className={styles.comingSoonBadge}>Coming soon</span>
        )}
      </div>
    </div>
  );

  return (
    <div className={slotClassName} style={slotStyle}>
      {isLive ? (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.title} (opens in a new tab)`}
          className={`${styles.projectCard} ${
            featured ? styles.featuredCard : styles.masonryCard
          } ${isDragging ? styles.dragging : ""}`}
          style={cardStyle}
          {...dragProps}
        >
          {featured ? (
            <>
              <span className={styles.tapeTopLeft} aria-hidden="true" />
              <span className={styles.tapeTopRight} aria-hidden="true" />
            </>
          ) : (
            <span className={styles.cardTape} aria-hidden="true" />
          )}
          <div className={featured ? styles.featuredLayout : styles.masonryLayout}>
            {browserPreview}
            {infoContent}
          </div>
        </a>
      ) : (
        <div
          role="article"
          aria-label={`${project.title} (${project.kind}) — Coming soon`}
          className={`${styles.projectCard} ${styles.comingSoonCard} ${
            featured ? styles.featuredCard : styles.masonryCard
          } ${isDragging ? styles.dragging : ""}`}
          style={cardStyle}
          {...dragProps}
        >
          <span className={styles.cardTape} aria-hidden="true" />
          <div className={featured ? styles.featuredLayout : styles.masonryLayout}>
            {browserPreview}
            {infoContent}
          </div>
        </div>
      )}
    </div>
  );
};
