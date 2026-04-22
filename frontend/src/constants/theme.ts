export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  border: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: "#FBF8F1",
  surface: "#F2EFE8",
  surfaceElevated: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#5C564C",
  accent: "#A78B5D",
  accentSoft: "#E8DDC4",
  border: "#E5DFD1",
  overlay: "rgba(26,26,26,0.45)",
};

export const darkColors: ThemeColors = {
  background: "#121212",
  surface: "#1A1A1A",
  surfaceElevated: "#242424",
  textPrimary: "#EAEAEA",
  textSecondary: "#A0A0A0",
  accent: "#C2A878",
  accentSoft: "#3A3124",
  border: "#2A2A2A",
  overlay: "rgba(0,0,0,0.6)",
};

export const getColors = (mode: ThemeMode): ThemeColors =>
  mode === "dark" ? darkColors : lightColors;

// Font size bounds (for quran text)
export const FONT_SIZE_MIN = 22;
export const FONT_SIZE_MAX = 48;
export const FONT_SIZE_DEFAULT = 30;
export const FONT_SIZE_STEP = 2;

// Line height multiplier keeps tashkeel from clipping
export const LINE_HEIGHT_MULTIPLIER = 2.1;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
