import React, { useEffect, useRef } from "react";
import styles from "./Hero.module.css";
import { siteConfig } from "@/config/site";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export const SpinningTextBadge: React.FC = () => {
  const ringRef = useRef<SVGGElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  const rolesText = siteConfig.roles.map((r) => r.trim().toUpperCase()).join(" • ");
  const ringString = `${rolesText} • AVAILABLE WORLDWIDE • `;

  const initials = `${siteConfig.firstName.charAt(0)}${
    siteConfig.lastName ? siteConfig.lastName.charAt(0) : ""
  }`.toUpperCase();

  useEffect(() => {
    if (prefersReduced) return;

    let angle = 0;
    let scrollBoost = 0;
    let lastScrollY = window.scrollY;
    let lastFrameTime = performance.now();
    let rafId = 0;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;
      scrollBoost = Math.min(260, scrollBoost + delta * 1.8);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      if (!document.hidden && ringRef.current) {
        const baseDegPerSec = 16;
        angle = (angle + (baseDegPerSec + scrollBoost) * dt) % 360;
        scrollBoost *= Math.pow(0.08, dt); // Smooth ease back
        if (scrollBoost < 0.2) scrollBoost = 0;

        ringRef.current.style.transform = `rotate(${angle.toFixed(2)}deg)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prefersReduced]);

  return (
    <div className={styles.spinningBadgeWrap} aria-hidden="true">
      <svg
        viewBox="0 0 180 180"
        className={styles.spinningBadgeSvg}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path
            id="badgeTextCirclePath"
            d="M 90, 90 m -64, 0 a 64,64 0 1,1 128,0 a 64,64 0 1,1 -128,0"
          />
        </defs>

        {/* Hard offset sticker shadow */}
        <circle cx="94" cy="95" r="82" fill="#0A0A0A" />

        {/* Main crisp paper badge with thick black outline */}
        <circle
          cx="90"
          cy="90"
          r="82"
          fill="#FFFFFF"
          stroke="#0A0A0A"
          strokeWidth="4"
        />

        {/* Subtle inner accent ring */}
        <circle
          cx="90"
          cy="90"
          r="46"
          fill="#F6F6F7"
          stroke="#0A0A0A"
          strokeWidth="2.5"
        />

        {/* Rotating Circular Text Ring */}
        <g
          ref={ringRef}
          style={{ transformOrigin: "90px 90px" }}
        >
          <text
            fill="#0A0A0A"
            fontFamily="var(--font-mono)"
            fontSize="8.8"
            fontWeight="700"
            letterSpacing="1.1"
          >
            <textPath href="#badgeTextCirclePath" startOffset="0%">
              {ringString}
            </textPath>
          </text>
        </g>

        {/* Central Bold Star + Monogram */}
        <polygon
          points="90,54 98,74 119,76 103,90 107,111 90,100 73,111 77,90 61,76 82,74"
          fill="#00C27A"
          stroke="#0A0A0A"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <text
          x="90"
          y="94"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="12.5"
          fontWeight="700"
          fill="#0A0A0A"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
};
