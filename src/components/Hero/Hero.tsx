import React, { useState, useEffect } from "react";
import styles from "./Hero.module.css";
import { siteConfig } from "@/config/site";
import { projects } from "@/config/projects";
import { BrushUnderline } from "@/assets/BrushUnderline";
import { BrushStrokeAccent } from "@/assets/BrushStrokeAccent";
import { HandDrawnArrow } from "@/assets/HandDrawnArrow";
import { TornPaperQuote } from "./TornPaperQuote";
import { LiveShowreelDevice } from "./LiveShowreelDevice";
import { SpinningTextBadge } from "./SpinningTextBadge";
import { ProjectTicker } from "./ProjectTicker";
import { HeroProjectSticker } from "./HeroProjectSticker";
import { LiveClock } from "@/components/Footer/LiveClock";
import { ConnectTheDots } from "@/components/Footer/ConnectTheDots";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SectionId } from "@/hooks/useHashNavigation";

interface HeroProps {
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  // Subtle offset opposite to cursor for 3D print depth behind name (max ~10px)
  const [nameDepth, setNameDepth] = useState({ x: 4, y: 4 });
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setNameDepth({ x: 4, y: 4 });
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
      setNameDepth({
        x: Math.round((-nx * 7 + 3) * 10) / 10,
        y: Math.round((-ny * 7 + 3) * 10) / 10,
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [prefersReduced]);

  const fullName = siteConfig.lastName
    ? `${siteConfig.firstName} ${siteConfig.lastName}`
    : siteConfig.firstName;

  const roleScript = siteConfig.roles[0] || "Creative Developer";
  const roleSerif = (siteConfig.roles[1] || "Product Builder").toUpperCase();
  const heroProjects = projects.slice(0, 3);

  return (
    <section className={styles.heroSection} aria-label="Introduction">
      {/* ============================================================
          3-COLUMN COLLAGE STAGE (SHOWREEL+QUOTE · CENTER NAME · BADGE+CARDS)
          ============================================================ */}
      <div className={styles.heroStage}>
        {/* LEFT WING: Live Showreel Device (upper-left) + Quote & Arrow (lower-left) */}
        <div className={styles.leftWing}>
          <div className={`${styles.showreelSlot} hero-stagger-2`}>
            <LiveShowreelDevice />
          </div>

          <div className={`${styles.quoteArrowGroup} hero-stagger-3`}>
            <TornPaperQuote quote={siteConfig.quote} author={siteConfig.quoteAuthor} />
            <div className={styles.quoteArrowWrap} aria-hidden="true">
              <HandDrawnArrow className={styles.largeBlueArrow} />
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Role Labels + Brush Strokes + Expressive 3D Name */}
        <div className={`${styles.heroCenter} hero-stagger-1`}>
          {/* Role 1 (Thin Script) + Magenta Brush Stroke */}
          <div className={`${styles.roleScriptGroup} animate-float-1`}>
            <span className={styles.roleScript}>{roleScript}</span>
            <BrushStrokeAccent
              variant="magenta"
              className={styles.roleStrokeMagenta}
            />
          </div>

          {/* Primary Display Name (single unbroken text) + 3D Depth Copy + Write-On Underline */}
          <div className={styles.nameContainer}>
            <span
              className={styles.nameDepthLayer}
              aria-hidden="true"
              style={{
                transform: prefersReduced
                  ? "translate3d(4px, 4px, 0)"
                  : `translate3d(${nameDepth.x}px, ${nameDepth.y}px, 0)`,
              }}
            >
              {fullName}
            </span>
            <h1 className={styles.hugeName}>{fullName}</h1>
            <div className={styles.brushUnderlineWrapper}>
              <BrushUnderline className={styles.brushUnderline} animateOnMount />
            </div>
          </div>

          {/* Role 2 (Spaced Serif Caps) + Green Brush Stroke */}
          <div className={`${styles.roleSerifGroup} animate-float-2`}>
            <span className={styles.roleSerif}>{roleSerif}</span>
            <BrushStrokeAccent
              variant="green"
              className={styles.roleStrokeGreen}
            />
          </div>
        </div>

        {/* RIGHT WING: Spinning Text Badge (upper-right) + 3 Hero Project Cards */}
        <div className={styles.rightWing}>
          <div className={styles.rightTopBadge}>
            <SpinningTextBadge />
          </div>

          <div
            className={`${styles.heroStickersCluster} hero-stagger-2`}
            aria-label="Featured project shortcuts"
          >
            {heroProjects.map((project, idx) => (
              <HeroProjectSticker
                key={project.id}
                project={project}
                index={idx}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          TILTED BLACK PROJECT TICKER BAND
          ============================================================ */}
      <ProjectTicker />

      {/* ============================================================
          BOTTOM BAR (VISIBLE FIRST SCREEN): CLOCK + CONNECT DOTS + EXPLORE WORK
          ============================================================ */}
      <div className={styles.heroBottomBar}>
        <div className={styles.bottomClockCol}>
          <span className={styles.heroAvailability}>
            <span className={styles.heroGreenBeacon} aria-hidden="true" />
            Available worldwide
          </span>
          <LiveClock />
        </div>

        <div className={styles.bottomDotsCol}>
          <ConnectTheDots compact onNavigate={onNavigate} />
        </div>

        <div className={styles.bottomExploreCol}>
          <a
            href="#work"
            onClick={(e) => onNavigate(e, "work")}
            className={styles.exploreWorkLink}
          >
            <span>Explore work</span>
            <span className={styles.exploreArrow} aria-hidden="true">
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};
