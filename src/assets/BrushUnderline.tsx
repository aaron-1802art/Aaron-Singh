import React from "react";

interface BrushUnderlineProps {
  className?: string;
  color?: string;
  animateOnMount?: boolean;
}

export const BrushUnderline: React.FC<BrushUnderlineProps> = ({
  className = "",
  color = "var(--color-green)",
  animateOnMount = false,
}) => {
  return (
    <svg
      viewBox="0 0 340 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <path
        d="M3 18.5C42.2 11.8 114.6 7.4 175.5 10.5C236.4 13.6 308.8 21.2 337 17.5C310.2 24.8 212.8 26.5 148.5 24C84.2 21.5 24.8 17.5 3 26"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animateOnMount ? "brush-write-on-1" : undefined}
        style={{
          filter: "drop-shadow(0 1px 2px rgba(0, 194, 122, 0.3))",
        }}
      />
      <path
        d="M28 22C85 16 195 14 315 22"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.85"
        className={animateOnMount ? "brush-write-on-2" : undefined}
      />
    </svg>
  );
};
