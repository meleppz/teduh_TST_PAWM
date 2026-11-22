import { addDays, localDay } from '@/utils/date';

import { getDailyAverages } from './moodService';
import { getLatestAssessment, WHO5_INTERVAL_DAYS, WHO5_LOW_THRESHOLD } from './who5Service';

const LOW_MOOD_AVERAGE = 2;
const LOW_MOOD_DAYS = 3;

/**
 * Whether Beranda should suggest contacting a professional (FR-30):
 * - the daily mood average is <= 2 for three consecutive days, or
 * - the latest WHO-5 score (within the last 14 days) is <= 50.
 *
 * Not yet handled: the "same prompt at most once per 24 hours" rule (FR-31).
 */
export async function shouldSuggestProfessional(now: Date = new Date()): Promise<boolean> {
  const days = Array.from({ length: LOW_MOOD_DAYS }, (_, i) => localDay(addDays(now, -i)));
  const averages = await getDailyAverages(days[days.length - 1]);
  const lowStreak = days.every((day) => {
    const found = averages.find((a) => a.day === day);
    return found !== undefined && found.average <= LOW_MOOD_AVERAGE;
  });
  if (lowStreak) return true;

  const latest = await getLatestAssessment();
  if (!latest) return false;
  const elapsedDays = (now.getTime() - new Date(latest.createdAt).getTime()) / 86_400_000;
  return elapsedDays < WHO5_INTERVAL_DAYS && latest.score <= WHO5_LOW_THRESHOLD;
}
