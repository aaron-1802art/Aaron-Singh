import React from "react";

interface BrushStrokeAccentProps {
  variant: "magenta" | "green";
  className?: string;
}

export const BrushStrokeAccent: React.FC<BrushStrokeAccentProps> = ({
  variant,
  className = "",
}) => {
  if (variant === "magenta") {
    return (
      <svg
        viewBox="0 0 180 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M4 16C38 6 95 4 174 12"
          stroke="var(--color-magenta)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M22 20C68 12 128 11 162 17"
          stroke="var(--color-magenta)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 160 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 13C46 18 104 16 155 7"
        stroke="var(--color-green)"
        strokeWidth="4.5"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M18 8C64 13 114 11 144 4"
        stroke="var(--color-green)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};

