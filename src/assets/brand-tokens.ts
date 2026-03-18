/**
 * MK-// Brand Tokens for Web — CII Dashboard
 * Adapted from mk2_brand_constants.js for TypeScript/React.
 * Single source of truth for all brand values in the CII dashboard.
 */

// ── Logo SVG Paths ──
export const LOGO_PATHS = {
  M: 'M0.5 421V0.5H109L238.5 347L365 0.5H470V420.5L404 421V75.5L279 421H197.5L66.5 75.5L67 421H0.5Z',
  K: 'M508.5 0.5V421H573.5V265L606 233L764 421H856L652.5 185L831.5 0.5H744.5L573.5 177.5V0.5H508.5Z',
  DASH: 'M832.5 244.5L856 185H1014L990.5 244.5H832.5Z',
  SLASH_1: 'M1219.5 0.5H1155L994.5 421H1056.5L1219.5 0.5Z',
  SLASH_2: 'M1332.5 0.5H1268.5L1107.5 421H1172L1332.5 0.5Z',
  VIEWBOX_W: 1334,
  VIEWBOX_H: 422,
} as const;

// ── Color Palette ──
export const colors = {
  navy: {
    900: '#060A12',
    800: '#0A0E1A',
    700: '#0D1117',
    600: '#131A24',
    500: '#1A2332',
    400: '#243044',
    300: '#3A4A62',
    200: '#5A6A82',
    100: '#8899AA',
  },
  cyan: {
    700: '#007A8A',
    600: '#00ACC1',
    500: '#00E5FF',
    400: '#00D4FF',
    300: '#33E8FF',
    200: '#80F0FF',
    100: '#B3F5FF',
  },
  amber: {
    500: '#C9A84C',
    400: '#D4B86A',
    300: '#E0C888',
    200: '#ECD8A6',
    100: '#F5ECCC',
  },
  status: {
    nominal: '#00E5FF',
    caution: '#FFB800',
    warning: '#FF6B35',
    critical: '#E24B4A',
    offline: '#3A4A62',
    active: '#00FF88',
    anomalous: '#FF00FF',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

// ── Classification Levels ──
export const classification = {
  external: colors.cyan[500],
  investor: colors.amber[500],
  internal: '#5A6A7A',
  classified: '#E24B4A',
} as const;

export type ClassificationLevel = keyof typeof classification;

// ── Typography ──
export const typography = {
  fontFamily: {
    display: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    body: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    mono: "'JetBrains Mono', Consolas, 'Courier New', monospace",
  },
} as const;

// ── Company Info ──
export const company = {
  name: 'MK-//',
  legalName: 'MK-// Defence Technologies Pvt Ltd',
  pronunciation: 'Mark Two',
  tagline: 'Autonomous Unmanned Combat Platforms',
  dashboardName: 'CII',
  dashboardFullName: 'CII Autonomy Dashboard',
} as const;

// ── Confidence → Color ──
export function confidenceToColor(confidence: number): string {
  if (confidence > 1.2) return colors.status.anomalous;
  if (confidence >= 0.8) return colors.cyan[500];
  if (confidence >= 0.5) return colors.amber[500];
  if (confidence >= 0.3) return colors.status.warning;
  return colors.status.critical;
}

export function confidenceToRGB(confidence: number): [number, number, number] {
  const hex = confidenceToColor(confidence).replace('#', '');
  return [
    parseInt(hex.substring(0, 2), 16) / 255,
    parseInt(hex.substring(2, 4), 16) / 255,
    parseInt(hex.substring(4, 6), 16) / 255,
  ];
}

// ── Nav Source Labels ──
export const NAV_SOURCE_LABELS: Record<string, string> = {
  GNSS: 'Hardened GNSS',
  TERCOM: 'TERCOM/TAN',
  MAGNAV: 'MagNav',
  SCENE_MATCH: 'Scene Match/DSMAC',
  INS_ONLY: 'INS Pure Inertial',
  RF_HOMING: 'RF Homing/SoOP',
  FUSED: 'Multi-Source Fusion',
};

// ── Parameter Group Colors ──
export const PARAMETER_GROUP_COLORS: Record<string, string> = {
  GNSS: '#00E5FF',
  INS_IMU: '#00FF88',
  TERCOM: '#FFB800',
  MAGNAV: '#D4B86A',
  SCENE_MATCH: '#80F0FF',
  EW_DETECT: '#E24B4A',
  PLATFORM: '#8899AA',
  COMMS: '#5B9BD5',
  RF_HOMING: '#FF6B35',
};
