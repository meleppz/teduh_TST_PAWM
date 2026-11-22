import { getDb } from './db';

export type JournalNote = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type Row = { id: number; title: string; body: string; created_at: string; updated_at: string };

const toNote = (row: Row): JournalNote => ({
  id: row.id,
  title: row.title,
  body: row.body,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Journal notes stay on the phone only (FR-13): they are never sent to a server.
 * They live in the app's private database; nothing here talks to the network.
 */
export async function listNotes(): Promise<JournalNote[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Row>('SELECT * FROM journal_notes ORDER BY created_at DESC');
  return rows.map(toNote);
}

export async function getNote(id: number): Promise<JournalNote | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Row>('SELECT * FROM journal_notes WHERE id = ?', id);
  return row ? toNote(row) : null;
}

export async function createNote(
  input: { title: string; body: string },
  now: Date = new Date(),
): Promise<JournalNote> {
  const db = await getDb();
  const stamp = now.toISOString();
  const result = await db.runAsync(
    'INSERT INTO journal_notes (title, body, created_at, updated_at) VALUES (?, ?, ?, ?)',
    input.title,
    input.body,
    stamp,
    stamp,
  );
  return { id: result.lastInsertRowId, ...input, createdAt: stamp, updatedAt: stamp };
}

export async function updateNote(
  id: number,
  input: { title: string; body: string },
  now: Date = new Date(),
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE journal_notes SET title = ?, body = ?, updated_at = ? WHERE id = ?',
    input.title,
    input.body,
    now.toISOString(),
    id,
  );
}
