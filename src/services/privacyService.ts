import { getDb } from './db';
import { cancelAllReminders } from './reminderService';

/** Deletes everything Teduh keeps on this phone (UC-13): check-ins, WHO-5, coping, journal, settings. */
export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM mood_entries');
    await db.runAsync('DELETE FROM wellbeing_assessments');
    await db.runAsync('DELETE FROM coping_sessions');
    await db.runAsync('DELETE FROM journal_notes');
    await db.runAsync('DELETE FROM settings');
  });
  await cancelAllReminders();
}
