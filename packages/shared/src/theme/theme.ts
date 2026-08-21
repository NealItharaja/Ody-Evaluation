import {
  borderWidth,
  elevation,
  layout,
  motion,
  opacity,
  palette,
  radius,
  space,
  typography,
  zIndex,
} from './tokens';

/**
 * Semantic layer. Components only ever read from here, which is what makes a
 * re-theme (or a dark mode) a single-file change.
 */

export type SemanticTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

type ToneRamp = {
  /** Tinted background for badges, banners and soft buttons. */
  surface: string;
  /** Border for the tinted surface. */
  border: string;
  /** Solid fill for strong buttons and status dots. */
  solid: string;
  solidHover: string;
  /** Text/icon color that reads on `surface`. */
  onSurface: string;
  /** Text/icon color that reads on `solid`. */
  onSolid: string;
};

const tones: Record<SemanticTone, ToneRamp> = {
  neutral: {
    surface: palette.neutral[100],
    border: palette.neutral[200],
    solid: palette.neutral[800],
    solidHover: palette.neutral[900],
    onSurface: palette.neutral[700],
    onSolid: palette.neutral[0],
  },
  brand: {
    surface: palette.brand[50],
    border: palette.brand[100],
    solid: palette.brand[500],
    solidHover: palette.brand[600],
    onSurface: palette.brand[700],
    onSolid: palette.neutral[0],
  },
  success: {
    surface: palette.green[50],
    border: palette.green[100],
    solid: palette.green[500],
    solidHover: palette.green[600],
    onSurface: palette.green[700],
    onSolid: palette.neutral[0],
  },
  warning: {
    surface: palette.amber[50],
    border: palette.amber[100],
    solid: palette.amber[500],
    solidHover: palette.amber[600],
    onSurface: palette.amber[700],
    onSolid: palette.neutral[0],
  },
  danger: {
    surface: palette.red[50],
    border: palette.red[100],
    solid: palette.red[500],
    solidHover: palette.red[600],
    onSurface: palette.red[700],
    onSolid: palette.neutral[0],
  },
  info: {
    surface: palette.blue[50],
    border: palette.blue[100],
    solid: palette.blue[500],
    solidHover: palette.blue[600],
    onSurface: palette.blue[700],
    onSolid: palette.neutral[0],
  },
};

export const theme = {
  color: {
    /** Page background, one step down from cards so surfaces float. */
    canvas: palette.neutral[50],
    /** Default card/panel background. */
    surface: palette.neutral[0],
    /** Recessed areas: table headers, code blocks, inset panels. */
    surfaceSunken: palette.neutral[100],
    /** Hover background for rows and ghost controls. */
    surfaceHover: palette.neutral[100],
    surfacePressed: palette.neutral[200],
    /** Sidebar / chrome. */
    chrome: palette.neutral[900],
    chromeHover: palette.neutral[800],

    border: palette.neutral[200],
    borderStrong: palette.neutral[300],
    borderFocus: palette.brand[400],

    text: palette.neutral[900],
    textSecondary: palette.neutral[600],
    textMuted: palette.neutral[500],
    textPlaceholder: palette.neutral[400],
    textInverse: palette.neutral[0],
    textOnChrome: palette.neutral[100],
    textOnChromeMuted: palette.neutral[400],

    accent: palette.accent[400],
    accentSurface: palette.accent[50],

    overlay: 'rgba(28, 26, 24, 0.45)',
    /** Focus ring is intentionally a single token — consistent everywhere. */
    focusRing: palette.brand[300],
    skeleton: palette.neutral[200],
    skeletonHighlight: palette.neutral[100],
  },
  tone: tones,
  space,
  radius,
  borderWidth,
  elevation,
  typography,
  layout,
  motion,
  zIndex,
  opacity,
  palette,
} as const;

export type Theme = typeof theme;
