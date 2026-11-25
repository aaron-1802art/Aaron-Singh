import React, { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface InkPoint {
  x: number;
  y: number;
  width: number;
  color: string;
  bornAt: number;
}

interface InkSplash {
  x: number;
  y: number;
  color: string;
  bornAt: number;
}

const PALETTE = ["#0B2EE6", "#F25CF2", "#00C27A", "#8B3FE0"] as const;
const STROKE_LIFETIME_MS = 800;
const SPLASH_LIFETIME_MS = 600;
const MAX_TRAIL_POINTS = 26;

export const InkTrailCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const points: InkPoint[] = [];
    const splashes: InkSplash[] = [];
    let rafId: number | null = null;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let colorIndex = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();

    const startLoop = () => {
      if (rafId !== null || document.hidden) return;
      rafId = requestAnimationFrame(render);
    };

    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const render = (now: number) => {
      rafId = null;
      if (document.hidden) return;

      ctx.clearRect(0, 0, width, height);

      // Prune expired points & splashes (prevents memory growth)
      while (points.length > 0 && now - points[0].bornAt > STROKE_LIFETIME_MS) {
        points.shift();
      }
      while (splashes.length > 0 && now - splashes[0].bornAt > SPLASH_LIFETIME_MS) {
        splashes.shift();
      }

      // Draw brush strokes
      if (points.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < points.length; i++) {
          const prev = points[i - 1];
          const curr = points[i];

          // Skip jumps after long pauses
          const gap = Math.hypot(curr.x - prev.x, curr.y - prev.y);
          if (gap > 140) continue;

          const age = now - curr.bornAt;
          const alpha = Math.max(0, 1 - age / STROKE_LIFETIME_MS) * 0.42;
          if (alpha <= 0.005) continue;

          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.strokeStyle = curr.color;
          ctx.globalAlpha = alpha;
          ctx.lineWidth = curr.width * (0.4 + 0.6 * (1 - age / STROKE_LIFETIME_MS));
          ctx.stroke();
        }
      }

      // Draw touch tap ink-splash ripples
      for (const splash of splashes) {
        const progress = (now - splash.bornAt) / SPLASH_LIFETIME_MS;
        if (progress >= 1) continue;

        const radius = 8 + progress * 34;
        const alpha = (1 - progress) * 0.48;

        ctx.beginPath();
        ctx.arc(splash.x, splash.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = splash.color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 3 * (1 - progress) + 1;
        ctx.stroke();

        // Tiny satellite splash dots
        for (let k = 0; k < 4; k++) {
          const angle = (k * Math.PI) / 2 + 0.4;
          const dx = Math.cos(angle) * (radius * 1.15);
          const dy = Math.sin(angle) * (radius * 1.15);
          ctx.beginPath();
          ctx.arc(splash.x + dx, splash.y + dy, 2.5 * (1 - progress), 0, Math.PI * 2);
          ctx.fillStyle = splash.color;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      if (points.length > 0 || splashes.length > 0) {
        rafId = requestAnimationFrame(render);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      // No brush trail on touch devices (preserves native scroll)
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;

      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);

      if (dist < 2 && points.length > 0) return;

      const speed = dist / dt; // px per ms
      // Vary brush width by cursor speed (calmer = wider ink, fast flick = tapered stroke)
      const strokeWidth = Math.max(3.5, Math.min(13, 12.5 - speed * 3.5));

      if (dist > 45 || now - lastTime > 260) {
        colorIndex = (colorIndex + 1) % PALETTE.length;
      }

      points.push({
        x: e.clientX,
        y: e.clientY,
        width: strokeWidth,
        color: PALETTE[colorIndex],
        bornAt: now,
      });

      if (points.length > MAX_TRAIL_POINTS) {
        points.shift();
      }

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
      startLoop();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      splashes.push({
        x: e.clientX,
        y: e.clientY,
        color: PALETTE[colorIndex],
        bornAt: performance.now(),
      });
      colorIndex = (colorIndex + 1) % PALETTE.length;
      startLoop();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else if (points.length > 0 || splashes.length > 0) {
        startLoop();
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopLoop();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [prefersReduced]);

  if (prefersReduced) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
      }}
    />
  );
};

