import React, { useEffect, useRef, useState } from "react";
import styles from "./WorkBoard.module.css";
import { projects } from "@/config/projects";
import { ProjectCard } from "./ProjectCard";
import { BrushUnderline } from "@/assets/BrushUnderline";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export const WorkBoard: React.FC = () => {
  const boardRef = useRef<HTMLElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const [hasEntered, setHasEntered] = useState<boolean>(prefersReduced);

  useEffect(() => {
    if (prefersReduced) {
      setHasEntered(true);
      return;
    }

    const el = boardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);

    // Safety fallback so cards never remain hidden after deep-link jumps
    const fallbackTimer = window.setTimeout(() => setHasEntered(true), 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, [prefersReduced]);

  const featuredProject = projects[0];
  const boardProjects = projects.slice(1);

  return (
    <section
      id="work"
      ref={boardRef}
      className={styles.boardSection}
      aria-label="Work Board"
    >
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.boardHeader}>
          <div className={styles.headerTopRow}>
            <div className={styles.headerBadge}>
              <span className={styles.badgeDot} aria-hidden="true" />
              <span className={styles.badgeText}>{projects.length} sites I built</span>
            </div>
          </div>

          <div className={styles.titleUnderlineWrap}>
            <h2 className={styles.boardTitle}>The Board</h2>
            <BrushUnderline
              className={styles.headerUnderline}
              color="var(--color-cobalt)"
            />
          </div>

          <p className={styles.boardSubtitle}>
            Tap any sticker to open the live site.
          </p>
        </div>

        {/* 1. Featured Card (Hunger Drama) */}
        {featuredProject && (
          <div className={styles.featuredRow}>
            <ProjectCard
              project={featuredProject}
              index={0}
              featured
              isPinned={hasEntered}
            />
          </div>
        )}

        {/* 2. Masonry-Style Board for Projects 02 to 05 */}
        <div className={styles.masonryGrid}>
          {boardProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx + 1}
              isPinned={hasEntered}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
