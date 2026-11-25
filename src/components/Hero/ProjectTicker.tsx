import React, { useEffect, useRef } from "react";
import styles from "./Hero.module.css";
import { projects } from "@/config/projects";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const STAR_COLORS = ["#0B2EE6", "#F25CF2", "#00C27A", "#8B3FE0", "#FFD600"];

export const ProjectTicker: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  // Boost CSS marquee playbackRate temporarily based on scroll velocity
  useEffect(() => {
    if (prefersReduced) return;

    let boost = 0;
    let lastY = window.scrollY;
    let rafId: number | null = null;
    let lastTime = performance.now();

    const decay = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      boost *= Math.pow(0.04, dt);
      if (boost < 0.05) boost = 0;

      const el = trackRef.current;
      if (el) {
        const anims = el.getAnimations();
        if (anims[0]) {
          anims[0].playbackRate = 1 + boost;
        }
      }

      if (boost > 0) {
        rafId = requestAnimationFrame(decay);
      } else {
        rafId = null;
      }
    };

    const handleScroll = () => {
      const y = window.scrollY;
      const dy = Math.abs(y - lastY);
      lastY = y;
      boost = Math.min(4.5, boost + dy * 0.06);

      if (rafId === null) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(decay);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [prefersReduced]);

  const tickerItems = projects.map((p, idx) => (
    <React.Fragment key={p.id}>
      <span className={styles.tickerName}>{p.title.toUpperCase()}</span>
      <span
        className={styles.tickerStar}
        style={{ color: STAR_COLORS[idx % STAR_COLORS.length] }}
      >
        ✦
      </span>
    </React.Fragment>
  ));

  return (
    <div className={styles.tickerBand} aria-hidden="true">
      <div ref={trackRef} className={styles.tickerTrack}>
        <div className={styles.tickerGroup}>{tickerItems}</div>
        <div className={styles.tickerGroup}>{tickerItems}</div>
        <div className={styles.tickerGroup}>{tickerItems}</div>
        <div className={styles.tickerGroup}>{tickerItems}</div>
      </div>
    </div>
  );
};

