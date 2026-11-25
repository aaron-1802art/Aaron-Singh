export const tokens = {
  colors: {
    paper: "#F6F6F7",
    paperCard: "#FFFFFF",
    ink: "#0A0A0A",
    inkMuted: "#4A4A52",
    inkFaint: "#55555E",
    cobalt: "#0B2EE6",
    cobaltInk: "#0925BA",
    magenta: "#F25CF2",
    magentaInk: "#9E0E9E",
    green: "#00C27A",
    greenInk: "#007A4D",
    purple: "#8B3FE0",
    purpleInk: "#4A1199",
    yellow: "#FFD600",
    highlighter: "rgba(255, 235, 59, 0.72)",
    gridLine: "rgba(190, 70, 200, 0.24)",
    borderSubtle: "rgba(10, 10, 10, 0.14)",
  },
  fonts: {
    brush: '"Kaushan Script", cursive',
    thinScript: '"Mrs Saint Delafield", cursive',
    serifCaps: '"Cormorant Garamond", Georgia, serif',
    mono: '"Space Mono", monospace',
  },
  radii: {
    xs: "2px",
    sm: "6px",
    md: "10px",
    lg: "16px",
    xl: "24px",
    pill: "9999px",
  },
  shadows: {
    sticker: "0 6px 18px rgba(10, 10, 10, 0.08), 0 2px 6px rgba(10, 10, 10, 0.04)",
    stickerHover: "0 16px 36px rgba(10, 10, 10, 0.14), 0 4px 12px rgba(10, 10, 10, 0.06)",
  },
} as const;

export type ColorToken = keyof typeof tokens.colors;
