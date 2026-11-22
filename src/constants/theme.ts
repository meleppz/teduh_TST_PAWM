/** Teduh design tokens (Figma design system + the visual refresh). */

export const Palette = {
  background: '#F5FAFF', // Primary/50
  text: '#0A487A',
  primary: '#1A7FD1', // Primary/700
  onPrimary: '#F5FAFF',
  onPrimarySoft: '#FFFDF5',
  secondary: '#FBD471', // Secondary/300
  onSecondary: '#1C1917',
  surface: '#FFFFFF', // LoFi/0
  border: '#E4ECF2', // LoFi/300
  error: '#A0140F',
  danger: '#DE2C26', // Danger/600
} as const;

/**
 * The blue and yellow ramps and the neutrals of the Figma design system.
 * Everything colourful in the app is drawn from these, nothing else.
 */
export const Ramp = {
  primary: {
    50: '#F5FAFF',
    100: '#C6E5FF',
    200: '#98D0FE',
    300: '#71BDFB',
    400: '#51ACF7',
    500: '#399EF0',
    600: '#278FE4',
    700: '#1A7FD1',
    800: '#116AB2',
    900: '#0A487A',
  },
  secondary: {
    50: '#FFFCF5',
    100: '#FFEFC6',
    200: '#FEE198',
    300: '#FBD471',
    400: '#F7C851',
    500: '#F0BC39',
    600: '#E4AF27',
    700: '#D19E1A',
    800: '#B28411',
    900: '#7A5A0A',
  },
  neutral: {
    100: '#F7FAFD',
    200: '#EFF4F9',
    300: '#E4ECF2',
    400: '#CBD5DD',
    500: '#BAC4CD',
    600: '#A7B0B8',
    700: '#9099A0',
  },
} as const;

/**
 * Soft fills for cards that only inform (flat, no elevation): blue is calm information and
 * reflection, yellow is warmth, invitations and good news. Each hue comes in two strengths.
 * The two "soft" fills sit halfway between the ramp's 50 and 100 steps.
 */
export const Tones = {
  blue: Ramp.primary[100],
  blueSoft: '#E0F0FF',
  yellow: Ramp.secondary[100],
  yellowSoft: '#FFF7E0',
  white: '#FFFFFF',
} as const;
export type Tone = keyof typeof Tones;

/**
 * Mood runs from deep blue to bright yellow: the heavier the day, the deeper the blue;
 * the lighter the day, the warmer the yellow.
 * tint: resting tile and card fill. solid: the chosen tile. strong: dots on charts.
 */
export const MoodColors = {
  1: { tint: Ramp.primary[100], solid: Ramp.primary[300], strong: Ramp.primary[800] },
  2: { tint: Tones.blueSoft, solid: Ramp.primary[200], strong: Ramp.primary[500] },
  3: { tint: Ramp.secondary[50], solid: Ramp.secondary[100], strong: Ramp.neutral[600] },
  4: { tint: Ramp.secondary[100], solid: Ramp.secondary[300], strong: Ramp.secondary[500] },
  5: { tint: Ramp.secondary[200], solid: Ramp.secondary[400], strong: Ramp.secondary[700] },
} as const;

/** The mood colours for a score that may be an average, such as 3.4. */
export function moodColor(score: number) {
  const key = Math.min(5, Math.max(1, Math.round(score))) as 1 | 2 | 3 | 4 | 5;
  return MoodColors[key];
}

/** Corner radii: small for controls, large for cards and panels. */
export const Radius = { md: 12, lg: 20 } as const;

/**
 * Elevation, one rule for the whole app: if you can press it, it is lifted; if it only
 * informs, it is flat. Every lifted surface uses this same tinted shadow and has a solid fill.
 */
export const Raised = {
  shadowColor: Palette.text,
  shadowOpacity: 0.18,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 10,
  elevation: 4,
} as const;

export const FontFamily = {
  regular: 'Figtree_400Regular',
  semibold: 'Figtree_600SemiBold',
  /** Qanelas Soft, for headings. */
  displayMedium: 'QanelasSoft_SemiBold',
  display: 'QanelasSoft_Bold',
  displayHeavy: 'QanelasSoft_ExtraBold',
} as const;

const font = (family: keyof typeof FontFamily, size: number, lineHeight = 1.5) => ({
  fontFamily: FontFamily[family],
  fontSize: size,
  lineHeight: Math.round(size * lineHeight),
  color: Palette.text,
});

export const Type = {
  // Headings: Qanelas Soft, set tighter than body text.
  display: font('displayHeavy', 32, 1.25),
  title: font('displayHeavy', 28, 1.25),
  heading: font('display', 24, 1.3),
  subheading: font('displayMedium', 20, 1.3),
  // Body and controls: Figtree.
  bodyLg: font('regular', 16),
  bodyLgBold: font('semibold', 16),
  body: font('regular', 14),
  bodyBold: font('semibold', 14),
  caption: font('regular', 12),
  captionBold: font('semibold', 12),
} as const;
