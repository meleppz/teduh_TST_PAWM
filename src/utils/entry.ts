import type { MoodEntry } from '@/services/moodService';

/** "2 / 5 · Cemas, Lelah" and, on a second line, "Tugas · Energi 2 / 5". */
export function entrySummary(entry: MoodEntry): string {
  const first = [`${entry.mood} / 5`, entry.emotions.join(', ')].filter(Boolean).join(' · ');
  const second = [entry.contexts.join(', '), entry.energy ? `Energi ${entry.energy} / 5` : '']
    .filter(Boolean)
    .join(' · ');
  return second ? `${first}\n${second}` : first;
}
