import type { MoodValue } from '@/data/labels';
import { localDay } from '@/utils/date';

import { getDb } from './db';

export type MoodEntry = {
  id: number;
  mood: MoodValue;
  energy: number | null;
  emotions: string[];
  contexts: string[];
  /** Local calendar day, `YYYY-MM-DD`. */
  day: string;
  /** ISO timestamp. */
  createdAt: string;
};

export type NewMoodEntry = {
  mood: number;
  energy: number | null;
  emotions: string[];
  contexts: string[];
};

type Row = {
  id: number;
  mood: number;
  energy: number | null;
  emotions: string;
  contexts: string;
  day: string;
  created_at: string;
};

function toEntry(row: Row): MoodEntry {
  return {
    id: row.id,
    mood: row.mood as MoodValue,
    energy: row.energy,
    emotions: JSON.parse(row.emotions) as string[],
    contexts: JSON.parse(row.contexts) as string[],
    day: row.day,
    createdAt: row.created_at,
  };
}

const inRange = (value: number) => Number.isInteger(value) && value >= 1 && value <= 5;

/** Validates and stores a check-in (FR-08, FR-09). */
export async function addMoodEntry(input: NewMoodEntry, now: Date = new Date()): Promise<MoodEntry> {
  if (!inRange(input.mood)) throw new Error('Skor mood harus 1 sampai 5.');
  if (input.energy !== null && !inRange(input.energy)) {
    throw new Error('Skor energi harus 1 sampai 5.');
  }

  const db = await getDb();
  const day = localDay(now);
  const createdAt = now.toISOString();
  const result = await db.runAsync(
    'INSERT INTO mood_entries (mood, energy, emotions, contexts, day, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    input.mood,
    input.energy,
    JSON.stringify(input.emotions),
    JSON.stringify(input.contexts),
    day,
    createdAt,
  );

  return {
    id: result.lastInsertRowId,
    mood: input.mood as MoodValue,
    energy: input.energy,
    emotions: input.emotions,
    contexts: input.contexts,
    day,
    createdAt,
  };
}

/** Most recent check-in of a given local day, or null. */
export async function getLatestEntryForDay(day: string): Promise<MoodEntry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>(
    'SELECT * FROM mood_entries WHERE day = ? ORDER BY created_at DESC LIMIT 1',
    day,
  );
  return row ? toEntry(row) : null;
}

/** Number of distinct days with at least one check-in, from `fromDay` onwards. */
export async function countActiveDays(fromDay: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(DISTINCT day) AS total FROM mood_entries WHERE day >= ?',
    fromDay,
  );
  return row?.total ?? 0;
}

/** Average mood per day from `fromDay` onwards (FR-12). */
export async function getDailyAverages(fromDay: string): Promise<{ day: string; average: number }[]> {
  const db = await getDb();
  return db.getAllAsync<{ day: string; average: number }>(
    'SELECT day, AVG(mood) AS average FROM mood_entries WHERE day >= ? GROUP BY day ORDER BY day',
    fromDay,
  );
}

/** Most recent check-in overall, or null. */
export async function getLatestEntry(): Promise<MoodEntry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM mood_entries ORDER BY created_at DESC LIMIT 1');
  return row ? toEntry(row) : null;
}

/** Latest check-ins, newest first. */
export async function getRecentEntries(limit: number): Promise<MoodEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT * FROM mood_entries ORDER BY created_at DESC LIMIT ?',
    limit,
  );
  return rows.map(toEntry);
}

export async function getEntryById(id: number): Promise<MoodEntry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM mood_entries WHERE id = ?', id);
  return row ? toEntry(row) : null;
}

async function requireEditableEntry(id: number, now: Date): Promise<MoodEntry> {
  const entry = await getEntryById(id);
  if (!entry) throw new Error('Check-in tidak ditemukan.');
  // FR-10: only check-ins of the same day can be changed or deleted.
  if (entry.day !== localDay(now)) {
    throw new Error('Check-in hanya bisa diubah atau dihapus pada hari yang sama.');
  }
  return entry;
}

/** Updates a check-in of today (FR-10). The recorded time stays the same. */
export async function updateMoodEntry(
  id: number,
  input: NewMoodEntry,
  now: Date = new Date(),
): Promise<void> {
  if (!inRange(input.mood)) throw new Error('Skor mood harus 1 sampai 5.');
  if (input.energy !== null && !inRange(input.energy)) {
    throw new Error('Skor energi harus 1 sampai 5.');
  }
  await requireEditableEntry(id, now);

  const db = await getDb();
  await db.runAsync(
    'UPDATE mood_entries SET mood = ?, energy = ?, emotions = ?, contexts = ? WHERE id = ?',
    input.mood,
    input.energy,
    JSON.stringify(input.emotions),
    JSON.stringify(input.contexts),
    id,
  );
}

/** Deletes a check-in of today (FR-10). */
export async function deleteMoodEntry(id: number, now: Date = new Date()): Promise<void> {
  await requireEditableEntry(id, now);
  const db = await getDb();
  await db.runAsync('DELETE FROM mood_entries WHERE id = ?', id);
}
