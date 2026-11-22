import { COPING_TECHNIQUES, type CopingTechnique } from '@/data/copingSeed';

import { getDb } from './db';

export type CopingRecommendation = {
  /** Techniques, best first. */
  techniques: CopingTechnique[];
  /** Completed sessions the user has for the chosen emotion. */
  sessionCount: number;
};

/**
 * Orders the catalog for an emotion (FR-28): techniques with completed sessions come first,
 * ranked by the average mood gain (after - before); the rest keep the catalog order.
 * Cancelled sessions do not count (UC-08).
 */
export async function getRecommendation(emotion: string | null): Promise<CopingRecommendation> {
  if (!emotion) return { techniques: COPING_TECHNIQUES, sessionCount: 0 };

  const db = await getDb();
  const rows = await db.getAllAsync<{ technique_id: string; total: number; gain: number }>(
    `SELECT technique_id, COUNT(*) AS total, AVG(mood_after - mood_before) AS gain
       FROM coping_sessions
      WHERE emotion = ? AND completed = 1 AND mood_after IS NOT NULL
      GROUP BY technique_id`,
    emotion,
  );

  const stats = new Map(rows.map((row) => [row.technique_id, row]));
  const catalogIndex = (t: CopingTechnique) => COPING_TECHNIQUES.indexOf(t);

  const techniques = [...COPING_TECHNIQUES].sort((a, b) => {
    const sa = stats.get(a.id);
    const sb = stats.get(b.id);
    if (sa && sb) return sb.gain - sa.gain || sb.total - sa.total || catalogIndex(a) - catalogIndex(b);
    if (sa) return -1;
    if (sb) return 1;
    return catalogIndex(a) - catalogIndex(b);
  });

  const sessionCount = rows.reduce((sum, row) => sum + row.total, 0);
  return { techniques, sessionCount };
}

export type NewCopingSession = {
  techniqueId: string;
  /** The emotion chosen on the Coping tab, if any. */
  emotion: string | null;
  moodBefore: number;
  /** Null when the session was cancelled. */
  moodAfter: number | null;
  completed: boolean;
};

/**
 * Stores a session (FR-26). Cancelled sessions are kept as not completed and
 * are ignored by the effectiveness ranking (UC-08).
 */
export async function recordCopingSession(
  input: NewCopingSession,
  now: Date = new Date(),
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO coping_sessions (technique_id, emotion, mood_before, mood_after, completed, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    input.techniqueId,
    input.emotion ?? '',
    input.moodBefore,
    input.moodAfter,
    input.completed ? 1 : 0,
    now.toISOString(),
  );
}
