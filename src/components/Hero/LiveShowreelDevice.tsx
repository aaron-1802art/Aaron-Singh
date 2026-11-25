import React, { useState, useEffect, useRef } from "react";
import styles from "./Hero.module.css";
import { projects } from "@/config/projects";
import { FallbackThumbnail } from "@/components/Work/FallbackThumbnail";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const CYCLE_MS = 3500;

export const LiveShowreelDevice: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(() =>
    typeof document !== "undefined" ? document.visibilityState === "hidden" : false
  );
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [failedDesktop, setFailedDesktop] = useState<Record<string, boolean>>({});
  const [failedMobile, setFailedMobile] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLAnchorElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  const isPaused = isHovered || isFocusVisible || isTabHidden;

  // Keep tab visibility state synced so switching back immediately resumes cycling
  useEffect(() => {
    const handleVisibility = () => {
      setIsTabHidden(document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Advance cleanly through all projects in config order (~3.5s each) and loop forever
  useEffect(() => {
    if (isPaused || prefersReduced || projects.length <= 1) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % projects.length);
    }, CYCLE_MS);

    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, prefersReduced]);

  // Subtle tilt toward cursor (max ~8deg, transform only, mouse pointers only)
  useEffect(() => {
    if (prefersReduced) {
      setTilt({ rx: 0, ry: 0 });
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.45)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.45)));

      setTilt({
        rx: -ny * 7,
        ry: nx * 8,
      });
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [prefersReduced]);

  const currentProject = projects[activeIndex] ?? projects[0];
  if (!currentProject) return null;

  const isLive = Boolean(currentProject.url && currentProject.url.startsWith("https://"));

  const deviceTransformStyle: React.CSSProperties = prefersReduced
    ? {}
    : {
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) rotate(-3deg)`,
      };

  return (
    <a
      ref={containerRef}
      href={isLive ? currentProject.url : "#work"}
      target={isLive ? "_blank" : undefined}
      rel={isLive ? "noopener noreferrer" : undefined}
      aria-label={`Open ${currentProject.title} (opens in a new tab)`}
      className={styles.showreelLink}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={(e) => {
        if (e.currentTarget.matches(":focus-visible")) {
          setIsFocusVisible(true);
        }
      }}
      onBlur={() => setIsFocusVisible(false)}
    >
      <div className={`${styles.showreelFloatWrap} animate-float-1`}>
        <div className={styles.showreelDeviceStage} style={deviceTransformStyle}>
          {/* Tilted Laptop Mockup */}
          <div className={styles.showreelLaptop}>
            <div className={styles.laptopBezel}>
              <span className={styles.laptopWebcam} aria-hidden="true" />
              <div className={styles.laptopScreen}>
                {projects.map((proj, idx) => {
                  const isActive = idx === activeIndex;
                  const showFallback = !proj.thumbnail || failedDesktop[proj.id];

                  return (
                    <div
                      key={proj.id}
                      className={`${styles.showreelSlide} ${
                        isActive ? styles.showreelSlideActive : ""
                      }`}
                    >
                      {showFallback ? (
                        <FallbackThumbnail
                          title={proj.title}
                          accent={proj.accent}
                          kind={proj.kind}
                        />
                      ) : (
                        <img
                          src={proj.thumbnail}
                          alt=""
                          className={styles.showreelSlideImg}
                          loading="eager"
                          decoding="async"
                          width={1280}
                          height={800}
                          onError={() =>
                            setFailedDesktop((prev) => ({ ...prev, [proj.id]: true }))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={styles.laptopBase} aria-hidden="true">
              <span className={styles.laptopNotch} />
            </div>
          </div>

          {/* Overlapping Phone Mockup */}
          <div className={styles.showreelPhone} aria-hidden="true">
            <div className={styles.showreelPhoneBezel}>
              <span className={styles.showreelPhoneNotch} />
              <div className={styles.showreelPhoneScreen}>
                {projects.map((proj, idx) => {
                  const isActive = idx === activeIndex;
                  const showFallback = !proj.mobileThumbnail || failedMobile[proj.id];

                  return (
                    <div
                      key={proj.id}
                      className={`${styles.showreelSlide} ${
                        isActive ? styles.showreelSlideActive : ""
                      }`}
                    >
                      {showFallback ? (
                        <FallbackThumbnail
                          title={proj.title}
                          accent={proj.accent}
                          kind={proj.kind}
                        />
                      ) : (
                        <img
                          src={proj.mobileThumbnail}
                          alt=""
                          className={styles.showreelPhoneImg}
                          loading="eager"
                          decoding="async"
                          width={390}
                          height={844}
                          onError={() =>
                            setFailedMobile((prev) => ({ ...prev, [proj.id]: true }))
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption & Progress Bar Under Device */}
      <div className={styles.showreelMeta}>
        <div className={styles.showreelProgress} aria-hidden="true">
          {projects.map((proj, idx) => (
            <span
              key={proj.id}
              className={`${styles.progressDot} ${
                idx === activeIndex ? styles.progressDotActive : ""
              }`}
            >
              {idx === activeIndex && (
                <span
                  key={`${proj.id}-${activeIndex}`}
                  className={styles.progressDotFill}
                  style={{
                    backgroundColor: proj.accent,
                    animationPlayState: isPaused ? "paused" : "running",
                  }}
                />
              )}
            </span>
          ))}
        </div>
        <div className={styles.showreelCaptionRow}>
          <span className={styles.showreelTitle}>{currentProject.title}</span>
          <span className={styles.showreelOpenHint}>Visit ↗</span>
        </div>
      </div>
    </a>
  );
};

