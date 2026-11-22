import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function init(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('teduh.db');
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS mood_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
      energy INTEGER CHECK (energy IS NULL OR energy BETWEEN 1 AND 5),
      emotions TEXT NOT NULL DEFAULT '[]',
      contexts TEXT NOT NULL DEFAULT '[]',
      day TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_mood_entries_day ON mood_entries (day);

    CREATE TABLE IF NOT EXISTS wellbeing_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
      answers TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS coping_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      technique_id TEXT NOT NULL,
      emotion TEXT NOT NULL,
      mood_before INTEGER NOT NULL CHECK (mood_before BETWEEN 1 AND 5),
      mood_after INTEGER CHECK (mood_after IS NULL OR mood_after BETWEEN 1 AND 5),
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_coping_sessions_emotion ON coping_sessions (emotion);

    CREATE TABLE IF NOT EXISTS journal_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  return db;
}

/** Opens (once) and returns the local Teduh database. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  dbPromise ??= init();
  return dbPromise;
}
