import { Platform } from 'react-native';

/**
 * Primitive design tokens.
 *
 * These are raw values only. Nothing in the app should reference a raw hex code
 * or a magic number for spacing/radius; components consume the semantic `theme`
 * built on top of these primitives in `./theme.ts`.
 */

/* ------------------------------------------------------------------ palette */

export const palette = {
  /** Warm neutral ramp — the backbone of every surface, border and text color. */
  neutral: {
    0: '#FFFFFF',
    25: '#FCFCFB',
    50: '#F8F7F5',
    100: '#F1EFEC',
    200: '#E4E1DC',
    300: '#D0CCC5',
    400: '#A8A29A',
    500: '#7C766D',
    600: '#5C5751',
    700: '#433F3A',
    800: '#2C2926',
    900: '#1C1A18',
    1000: '#0F0E0D',
  },
  /** Brand: deep kitchen green. Used for primary actions and active nav. */
  brand: {
    50: '#EDF6F2',
    100: '#D3E9E0',
    200: '#A6D3C3',
    300: '#73B7A1',
    400: '#449A81',
    500: '#1F7D63',
    600: '#166552',
    700: '#125244',
    800: '#0E3E34',
    900: '#0A2B24',
  },
  /** Accent: saffron. Reserved for highlights, never for primary CTAs. */
  accent: {
    50: '#FEF6E7',
    100: '#FDE9C2',
    200: '#FAD289',
    300: '#F5B94F',
    400: '#E9A23B',
    500: '#D08420',
    600: '#A66617',
    700: '#7E4E14',
  },
  green: {
    50: '#ECFDF3',
    100: '#D1FADF',
    200: '#A6F4C5',
    500: '#12B76A',
    600: '#039855',
    700: '#027A48',
  },
  amber: {
    50: '#FFFAEB',
    100: '#FEF0C7',
    200: '#FEDF89',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
  },
  red: {
    50: '#FEF3F2',
    100: '#FEE4E2',
    200: '#FECDCA',
    500: '#F04438',
    600: '#D92D20',
    700: '#B42318',
  },
  blue: {
    50: '#EFF8FF',
    100: '#D1E9FF',
    200: '#B2DDFF',
    500: '#2E90FA',
    600: '#1570EF',
    700: '#175CD3',
  },
  purple: {
    50: '#F4F3FF',
    100: '#EBE9FE',
    200: '#D9D6FE',
    500: '#7A5AF8',
    600: '#6938EF',
    700: '#5925DC',
  },
} as const;

/* ------------------------------------------------------------------ spacing */

/**
 * 4px base scale. Keys are multipliers, so `space[4]` === 16px, which keeps the
 * relationship between steps obvious at the call site.
 */
export const space = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export type SpaceToken = keyof typeof space;

/* --------------------------------------------------------------- typography */

const fontFamily = Platform.select({
  web: '"Inter var", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  ios: 'System',
  default: 'sans-serif',
}) as string;

const fontFamilyMono = Platform.select({
  web: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  ios: 'Menlo',
  default: 'monospace',
}) as string;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * Type scale. Every entry is a complete recipe (size + line height + weight +
 * tracking) so text never gets composed ad hoc.
 */
export const typography = {
  fontFamily,
  fontFamilyMono,
  fontWeight,
  variants: {
    display: { fontSize: 34, lineHeight: 40, fontWeight: fontWeight.bold, letterSpacing: -0.6 },
    h1: { fontSize: 26, lineHeight: 32, fontWeight: fontWeight.semibold, letterSpacing: -0.4 },
    h2: { fontSize: 20, lineHeight: 28, fontWeight: fontWeight.semibold, letterSpacing: -0.2 },
    h3: { fontSize: 17, lineHeight: 24, fontWeight: fontWeight.semibold, letterSpacing: -0.1 },
    h4: { fontSize: 15, lineHeight: 22, fontWeight: fontWeight.semibold, letterSpacing: 0 },
    bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular, letterSpacing: 0 },
    body: { fontSize: 14, lineHeight: 21, fontWeight: fontWeight.regular, letterSpacing: 0 },
    bodySm: { fontSize: 13, lineHeight: 19, fontWeight: fontWeight.regular, letterSpacing: 0 },
    label: { fontSize: 13, lineHeight: 18, fontWeight: fontWeight.medium, letterSpacing: 0 },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.regular, letterSpacing: 0.1 },
    overline: { fontSize: 11, lineHeight: 14, fontWeight: fontWeight.semibold, letterSpacing: 0.8 },
    mono: {
      fontSize: 12,
      lineHeight: 18,
      fontWeight: fontWeight.regular,
      letterSpacing: 0,
      fontFamily: fontFamilyMono,
    },
    /** Tabular figures for money/metrics so columns stay aligned. */
    metric: { fontSize: 28, lineHeight: 34, fontWeight: fontWeight.semibold, letterSpacing: -0.5 },
  },
} as const;

export type TextVariant = keyof typeof typography.variants;

/* ---------------------------------------------------------- shape & surface */

export const radius = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

export const borderWidth = {
  none: 0,
  hairline: Platform.OS === 'web' ? 1 : 0.5,
  thin: 1,
  thick: 2,
} as const;

/**
 * Elevation ramp. Native gets shadow/elevation props, web gets a layered
 * boxShadow, so the same token reads correctly on both platforms.
 */
export const elevation = {
  0: Platform.select({
    web: { boxShadow: 'none' },
    default: {},
  }),
  1: Platform.select({
    web: { boxShadow: '0 1px 2px rgba(28, 26, 24, 0.05)' },
    default: {
      shadowColor: '#1C1A18',
      shadowOpacity: 0.06,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
  }),
  2: Platform.select({
    web: {
      boxShadow: '0 1px 3px rgba(28, 26, 24, 0.07), 0 1px 2px rgba(28, 26, 24, 0.04)',
    },
    default: {
      shadowColor: '#1C1A18',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
  }),
  3: Platform.select({
    web: {
      boxShadow: '0 4px 12px rgba(28, 26, 24, 0.08), 0 1px 3px rgba(28, 26, 24, 0.05)',
    },
    default: {
      shadowColor: '#1C1A18',
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
  }),
  4: Platform.select({
    web: {
      boxShadow: '0 16px 40px rgba(28, 26, 24, 0.14), 0 4px 12px rgba(28, 26, 24, 0.08)',
    },
    default: {
      shadowColor: '#1C1A18',
      shadowOpacity: 0.2,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 12,
    },
  }),
} as const;

export type ElevationToken = keyof typeof elevation;

/* ------------------------------------------------------------------- layout */

export const layout = {
  sidebarWidth: 244,
  sidebarCollapsedWidth: 68,
  topBarHeight: 64,
  contentMaxWidth: 1360,
  pageGutter: space[8],
  pageGutterCompact: space[4],
  /** Grid used by dashboard pages: 12 columns with a 24px gap. */
  grid: { columns: 12, gap: space[6] },
  controlHeight: { sm: 32, md: 38, lg: 44 },
  breakpoints: { sm: 640, md: 900, lg: 1180, xl: 1440 },
} as const;

/* ------------------------------------------------------------------- motion */

export const motion = {
  duration: { instant: 80, fast: 140, normal: 200, slow: 320 },
  easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)', decelerate: 'cubic-bezier(0, 0, 0, 1)' },
} as const;

export const zIndex = {
  base: 0,
  sticky: 100,
  dropdown: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
} as const;

export const opacity = {
  disabled: 0.45,
  muted: 0.65,
  overlay: 0.45,
} as const;
