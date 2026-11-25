import React, { useState, useRef, useEffect } from "react";
import styles from "./Footer.module.css";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SectionId } from "@/hooks/useHashNavigation";

const DOT_COLORS = [
  "#0B2EE6", // 1 Cobalt
  "#F25CF2", // 2 Magenta
  "#00C27A", // 3 Green
  "#8B3FE0", // 4 Purple
  "#FFD600", // 5 Yellow
  "#0B2EE6", // 6 Cobalt
];

interface ConnectTheDotsProps {
  compact?: boolean;
  onNavigate?: (e: React.MouseEvent<HTMLAnchorElement>, id: SectionId) => void;
}

export const ConnectTheDots: React.FC<ConnectTheDotsProps> = ({
  compact = false,
  onNavigate,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [completed, setCompleted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  // Trigger pixel confetti when completed
  useEffect(() => {
    if (!completed || prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 280;
    canvas.height = 140;

    const colors = ["#0B2EE6", "#F25CF2", "#00C27A", "#8B3FE0", "#FFD600"];
    const confettiPieces = Array.from({ length: 42 }, () => ({
      x: canvas.width / 2,
      y: canvas.height - 16,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6.5 - 2,
      size: Math.random() * 5 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      confettiPieces.forEach((p) => {
        if (p.life > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.22;
          p.life -= 0.018;

          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      });

      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [completed, prefersReduced]);

  const handleDotClick = (index: number) => {
    if (completed) return;

    if (index === currentStep) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep === DOT_COLORS.length) {
        setCompleted(true);
      }
    } else {
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setCurrentStep(0);
      }, 450);
    }
  };

  return (
    <div className={`${styles.dotsWidget} ${compact ? styles.dotsWidgetCompact : ""}`}>
      <div className={styles.dotsHeaderRow}>
        <span className={styles.dotsTitle}>Connect the dots</span>
        {completed && (
          <a
            href="#contact"
            onClick={(e) => onNavigate && onNavigate(e, "contact")}
            className={styles.rewardLink}
          >
            Say hi →
          </a>
        )}
      </div>

      {/* 6 Sequential Buttons with SVG connecting line */}
      <div className={`${styles.dotsRow} ${isShaking ? styles.shakeAnimation : ""}`}>
        <svg className={styles.dotsSvg} viewBox="0 0 242 36" aria-hidden="true">
          {currentStep > 1 && (
            <polyline
              points={Array.from({ length: currentStep }, (_, i) => `${19 + i * 40},18`).join(" ")}
              fill="none"
              stroke="var(--color-cobalt)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 3"
            />
          )}
        </svg>

        {DOT_COLORS.map((color, idx) => {
          const isActive = idx < currentStep;
          const isNext = idx === currentStep;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDotClick(idx)}
              className={`${styles.dotBtn} ${isActive ? styles.dotActive : ""} ${
                isNext ? styles.dotPulse : ""
              }`}
              aria-label={`Dot ${idx + 1} of 6`}
              aria-pressed={isActive}
            >
              <span
                className={styles.dotCore}
                style={{
                  backgroundColor: color,
                  boxShadow: isActive ? `0 0 8px ${color}` : "none",
                }}
              />
            </button>
          );
        })}

        {completed && (
          <canvas ref={canvasRef} className={styles.confettiCanvas} aria-hidden="true" />
        )}
      </div>
    </div>
  );
};
