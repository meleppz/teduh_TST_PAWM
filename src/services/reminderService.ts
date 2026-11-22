import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { getLatestAssessment, nextAvailableAt } from './who5Service';
import { getSetting, setSetting } from './settingsService';

export type ReminderSettings = {
  dailyEnabled: boolean;
  hour: number;
  minute: number;
  who5Enabled: boolean;
};

// Reminders are off until the user turns them on, so nothing asks for permission by surprise.
export const DEFAULT_REMINDERS: ReminderSettings = {
  dailyEnabled: false,
  hour: 20,
  minute: 0,
  who5Enabled: false,
};

const SETTINGS_KEY = 'reminders';
const CHANNEL_ID = 'reminders';

export async function getReminderSettings(): Promise<ReminderSettings> {
  const saved = await getSetting<Partial<ReminderSettings>>(SETTINGS_KEY, {});
  return { ...DEFAULT_REMINDERS, ...saved };
}

/** Saves the change, then brings the scheduled notifications in line with it. */
export async function saveReminderSettings(
  change: Partial<ReminderSettings>,
): Promise<ReminderSettings> {
  const next = { ...(await getReminderSettings()), ...change };
  await setSetting(SETTINGS_KEY, next);
  await syncReminders(next);
  return next;
}

/** Call once at startup: foreground behaviour and the Android channel. */
export async function configureNotifications(): Promise<void> {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Pengingat',
        importance: AndroidImportance.DEFAULT,
      });
    }
  } catch (error) {
    console.warn('Notifikasi belum bisa disiapkan', error);
  }
}

/** Asks for permission when needed. Returns whether notifications may be shown. */
export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch (error) {
    console.warn('Gagal meminta izin notifikasi', error);
    return false;
  }
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Gagal membatalkan pengingat', error);
  }
}

/** The moment of the next WHO-5 reminder: the day it opens again, at the reminder time. */
async function nextWho5ReminderAt(settings: ReminderSettings, now: Date): Promise<Date> {
  const latest = await getLatestAssessment();
  const opens = latest ? nextAvailableAt(latest) : now;
  const at = new Date(Math.max(opens.getTime(), now.getTime()));
  at.setHours(settings.hour, settings.minute, 0, 0);
  if (at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);
  return at;
}

/**
 * Re-creates the scheduled notifications from the saved settings (FR-33, FR-34):
 * a daily check-in reminder and a WHO-5 reminder for the day it opens again.
 * Call it again after a WHO-5 is saved so the next reminder moves 14 days ahead.
 */
export async function syncReminders(settings?: ReminderSettings): Promise<void> {
  try {
    const current = settings ?? (await getReminderSettings());
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (current.dailyEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Teduh',
          body: 'Ada ruang buat perasaanmu hari ini. Mau check-in sebentar?',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: current.hour,
          minute: current.minute,
          channelId: CHANNEL_ID,
        },
      });
    }

    if (current.who5Enabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Waktunya menyapa diri',
          body: 'WHO-5 sudah bisa diisi lagi. Luangkan sekitar 2 menit.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: await nextWho5ReminderAt(current, new Date()),
          channelId: CHANNEL_ID,
        },
      });
    }
  } catch (error) {
    console.warn('Gagal menjadwalkan pengingat', error);
  }
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "20.00" */
export function formatReminderTime(hour: number, minute: number): string {
  return `${pad(hour)}.${pad(minute)}`;
}

/** WIB / WITA / WIT from the phone's UTC offset; empty for other time zones. */
export function timeZoneLabel(date: Date = new Date()): { short: string; long: string } {
  const offsetHours = -date.getTimezoneOffset() / 60;
  if (offsetHours === 7) return { short: 'WIB', long: 'Waktu Indonesia Barat (WIB)' };
  if (offsetHours === 8) return { short: 'WITA', long: 'Waktu Indonesia Tengah (WITA)' };
  if (offsetHours === 9) return { short: 'WIT', long: 'Waktu Indonesia Timur (WIT)' };
  return { short: '', long: 'Waktu di ponselmu' };
}
