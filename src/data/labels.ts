import type { IconName } from '@/components/Icon';

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export const MOODS: { value: MoodValue; label: string; icon: IconName | null }[] = [
  { value: 1, label: 'Berat', icon: null }, // the design shows the number instead of an icon
  { value: 2, label: 'Sedih', icon: 'emoji-sad' },
  { value: 3, label: 'Biasa', icon: 'emoji-normal' },
  { value: 4, label: 'Baik', icon: 'happyemoji' },
  { value: 5, label: 'Senang', icon: 'emoji-happy' },
];

/**
 * Headline shown on Beranda for today's mood.
 * Only 2 ("Lagi berat") and 4 ("Merasa baik") come from the Figma frames;
 * 1, 3 and 5 are placeholders to be confirmed.
 */
export const MOOD_HEADLINES: Record<MoodValue, string> = {
  1: 'Lagi sangat berat',
  2: 'Lagi berat',
  3: 'Biasa saja',
  4: 'Merasa baik',
  5: 'Lagi senang',
};

export const ENERGY_LEVELS = [1, 2, 3, 4, 5] as const;

export const EMOTIONS = [
  'Senang',
  'Tenang',
  'Bersyukur',
  'Cemas',
  'Sedih',
  'Marah',
  'Lelah',
  'Kesepian',
  'Stres',
] as const;

export const CONTEXTS = [
  'Kuliah',
  'Tugas',
  'Keluarga',
  'Teman',
  'Tidur',
  'Kesehatan',
  'Keuangan',
] as const;

/**
 * Headline on the check-in detail screen. Only 2 ("Lagi terasa berat") comes from Figma;
 * the others are placeholders to be confirmed.
 */
export const MOOD_DETAIL_HEADLINES: Record<MoodValue, string> = {
  1: 'Lagi terasa sangat berat',
  2: 'Lagi terasa berat',
  3: 'Hari yang biasa saja',
  4: 'Lagi terasa baik',
  5: 'Lagi terasa senang',
};

/**
 * Wording of the context insights on the Wawasan screen. Only "bersama teman" (positive)
 * and "tugas terasa penuh" (negative) come from Figma; the rest follows the same pattern.
 */
export const INSIGHT_POSITIVE: Record<string, string> = {
  Kuliah: 'Lebih ringan saat kuliah',
  Tugas: 'Lebih ringan saat mengerjakan tugas',
  Keluarga: 'Lebih ringan bersama keluarga',
  Teman: 'Lebih ringan bersama teman',
  Tidur: 'Lebih ringan saat tidurmu cukup',
  Kesehatan: 'Lebih ringan saat kesehatan terasa baik',
  Keuangan: 'Lebih ringan saat urusan uang tenang',
};

export const INSIGHT_NEGATIVE: Record<string, string> = {
  Kuliah: 'Saat kuliah terasa penuh',
  Tugas: 'Saat tugas terasa penuh',
  Keluarga: 'Saat urusan keluarga terasa berat',
  Teman: 'Saat urusan teman terasa berat',
  Tidur: 'Saat tidurmu kurang',
  Kesehatan: 'Saat kesehatan terasa kurang baik',
  Keuangan: 'Saat urusan uang terasa berat',
};
