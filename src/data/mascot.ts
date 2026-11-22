import type { MascotName } from '@/components/Mascot';

import type { MoodValue } from './labels';

/** The mascot's face for a mood score: it keeps you company, it never cheers at a low mood. */
export function mascotForMood(mood: number): MascotName {
  const value = Math.round(mood) as MoodValue;
  if (value <= 1) return 'sad';
  if (value <= 3) return 'hug';
  return 'shining';
}

/** The mascot's face for the emotion chosen on the Coping tab. */
export function mascotForEmotion(emotion: string | null): MascotName {
  switch (emotion) {
    case 'Cemas':
    case 'Stres':
      return 'confused';
    case 'Sedih':
      return 'sad';
    case 'Marah':
      return 'angry';
    case 'Lelah':
    case 'Kesepian':
      return 'hug';
    default:
      return 'shining';
  }
}
