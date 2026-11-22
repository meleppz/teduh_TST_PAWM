import { INSIGHT_NEGATIVE, INSIGHT_POSITIVE } from '@/data/labels';
import { formatAverage, formatPoints } from '@/utils/format';

import { getDb } from './db';

/** Insights need at least 14 check-ins (FR-22). */
export const MIN_CHECKINS = 14;

/** A context needs this many check-ins before it is mentioned. */
const MIN_PER_CONTEXT = 3;
/** Smallest difference from the overall average worth mentioning. */
const MIN_DIFFERENCE = 0.3;

export type InsightCard = { key: string; title: string; body: string };

export type InsightState =
  | { status: 'locked'; count: number; needed: number }
  | { status: 'ready'; count: number; firstDay: string; lastDay: string; cards: InsightCard[] };

/**
 * Patterns that were observed in the user's own notes. They describe what happened and never
 * claim a cause or a diagnosis (FR-24). Sleep and weather need other services and are added
 * by the screen as "not linked yet" cards.
 */
export async function loadInsights(): Promise<InsightState> {
  const db = await getDb();

  const summary = await db.getFirstAsync<{ total: number; first: string | null; last: string | null }>(
    'SELECT COUNT(*) AS total, MIN(day) AS first, MAX(day) AS last FROM mood_entries',
  );
  const count = summary?.total ?? 0;
  if (count < MIN_CHECKINS || !summary?.first || !summary.last) {
    return { status: 'locked', count, needed: MIN_CHECKINS };
  }

  const rows = await db.getAllAsync<{ mood: number; contexts: string }>(
    'SELECT mood, contexts FROM mood_entries',
  );
  const overall = rows.reduce((sum, r) => sum + r.mood, 0) / rows.length;

  const byContext = new Map<string, number[]>();
  for (const row of rows) {
    for (const context of JSON.parse(row.contexts) as string[]) {
      byContext.set(context, [...(byContext.get(context) ?? []), row.mood]);
    }
  }

  const stats = [...byContext.entries()]
    .filter(([, moods]) => moods.length >= MIN_PER_CONTEXT)
    .map(([context, moods]) => {
      const average = moods.reduce((a, b) => a + b, 0) / moods.length;
      return { context, n: moods.length, average, difference: average - overall };
    });

  const cards: InsightCard[] = [];

  const best = [...stats].sort((a, b) => b.difference - a.difference)[0];
  if (best && best.difference >= MIN_DIFFERENCE) {
    cards.push({
      key: `lighter-${best.context}`,
      title: INSIGHT_POSITIVE[best.context] ?? `Lebih ringan saat ${best.context.toLowerCase()}`,
      body: `Pada ${best.n} check-in dengan konteks ${best.context}, rata-rata mood-mu ${formatAverage(best.average)}; keseluruhan ${formatAverage(overall)}.`,
    });
  }

  const hardest = [...stats].sort((a, b) => a.difference - b.difference)[0];
  if (hardest && hardest.difference <= -MIN_DIFFERENCE) {
    cards.push({
      key: `heavier-${hardest.context}`,
      title: INSIGHT_NEGATIVE[hardest.context] ?? `Saat ${hardest.context.toLowerCase()} terasa berat`,
      body: `Pada ${hardest.n} check-in dengan konteks ${hardest.context}, rata-rata mood-mu ${formatAverage(hardest.average)}. Ini pengamatan, bukan penyebab.`,
    });
  }

  const coping = await db.getFirstAsync<{ total: number; gain: number | null }>(
    `SELECT COUNT(*) AS total, AVG(mood_after - mood_before) AS gain
       FROM coping_sessions WHERE completed = 1 AND mood_after IS NOT NULL`,
  );
  if (coping && coping.total >= 2 && coping.gain !== null) {
    const change =
      coping.gain > 0
        ? `naik ${formatPoints(coping.gain)} poin`
        : coping.gain < 0
          ? `turun ${formatPoints(-coping.gain)} poin`
          : 'tetap sama';
    cards.push({
      key: 'coping',
      title: 'Jeda yang kamu pilih',
      body: `Di ${coping.total} sesi, mood sesudahnya rata-rata ${change}. Pengalamanmu bisa berbeda tiap hari.`,
    });
  }

  return { status: 'ready', count, firstDay: summary.first, lastDay: summary.last, cards };
}
