import React from "react";

interface HandDrawnArrowProps {
  className?: string;
  color?: string;
}

export const HandDrawnArrow: React.FC<HandDrawnArrowProps> = ({
  className = "",
  color = "var(--color-cobalt)",
}) => {
  return (
    <svg
      viewBox="0 0 130 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Sweeping hand-drawn curve from left quote area down to Work board */}
      <path
        d="M12 16C48 12 84 30 96 64C100 76 98 88 94 98"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Secondary sketch line for handcrafted weight */}
      <path
        d="M16 20C50 18 81 33 93 66"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Arrowhead left wing */}
      <path
        d="M74 82C83 90 90 96 94 102"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrowhead right wing */}
      <path
        d="M114 82C106 90 99 97 94 102"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
