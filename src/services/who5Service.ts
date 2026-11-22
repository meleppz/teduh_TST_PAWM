import { WHO5_QUESTIONS } from '@/data/who5Items';

import { getDb } from './db';

export const WHO5_INTERVAL_DAYS = 14;
export const WHO5_LOW_THRESHOLD = 50;

const DAY_MS = 86_400_000;

export type Assessment = { id: number; score: number; createdAt: string };

type Row = { id: number; score: number; created_at: string };

const toAssessment = (row: Row): Assessment => ({
  id: row.id,
  score: row.score,
  createdAt: row.created_at,
});

export async function getLatestAssessment(): Promise<Assessment | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>(
    'SELECT id, score, created_at FROM wellbeing_assessments ORDER BY created_at DESC LIMIT 1',
  );
  return row ? toAssessment(row) : null;
}

export async function getAssessmentById(id: number): Promise<Assessment | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>(
    'SELECT id, score, created_at FROM wellbeing_assessments WHERE id = ?',
    id,
  );
  return row ? toAssessment(row) : null;
}

/** The moment the next WHO-5 opens, 14 days after the last one. */
export function nextAvailableAt(latest: Assessment): Date {
  return new Date(new Date(latest.createdAt).getTime() + WHO5_INTERVAL_DAYS * DAY_MS);
}

/** Whole days left until the next WHO-5 opens (0 when it is already open). */
export function daysUntilNext(latest: Assessment, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((nextAvailableAt(latest).getTime() - now.getTime()) / DAY_MS));
}

/** WHO-5 may be filled once every 14 days (FR-16). */
export async function isWho5Due(now: Date = new Date()): Promise<boolean> {
  const latest = await getLatestAssessment();
  return !latest || daysUntilNext(latest, now) === 0;
}

/** WHO-5 raw score (0-25) times 4 gives the 0-100 score (FR-15). */
export function computeWho5Score(answers: number[]): number {
  if (answers.length !== WHO5_QUESTIONS.length) throw new Error('Jawab kelima pertanyaan dulu.');
  if (answers.some((a) => !Number.isInteger(a) || a < 0 || a > 5)) {
    throw new Error('Jawaban WHO-5 harus 0 sampai 5.');
  }
  return answers.reduce((sum, a) => sum + a, 0) * 4;
}

export const isLowScore = (score: number) => score <= WHO5_LOW_THRESHOLD;

/** Validates and stores a completed WHO-5. Answers never leave the phone. */
export async function saveAssessment(answers: number[], now: Date = new Date()): Promise<Assessment> {
  const score = computeWho5Score(answers);
  if (!(await isWho5Due(now))) throw new Error('WHO-5 belum bisa diisi lagi.');

  const db = await getDb();
  const createdAt = now.toISOString();
  const result = await db.runAsync(
    'INSERT INTO wellbeing_assessments (score, answers, created_at) VALUES (?, ?, ?)',
    score,
    JSON.stringify(answers),
    createdAt,
  );
  return { id: result.lastInsertRowId, score, createdAt };
}

/** Assessments in chronological order (oldest first), limited to the latest `limit`. */
export async function listAssessments(limit: number): Promise<Assessment[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>(
    'SELECT id, score, created_at FROM wellbeing_assessments ORDER BY created_at DESC LIMIT ?',
    limit,
  );
  return rows.reverse().map(toAssessment);
}
