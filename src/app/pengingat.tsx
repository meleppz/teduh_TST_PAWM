import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { InfoCard } from '@/components/InfoCard';
import { RowCard } from '@/components/RowCard';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Type } from '@/constants/theme';
import {
  DEFAULT_REMINDERS,
  ensureNotificationPermission,
  formatReminderTime,
  getReminderSettings,
  saveReminderSettings,
  timeZoneLabel,
  type ReminderSettings,
} from '@/services/reminderService';

/** Daily check-in reminder and WHO-5 reminder (FR-33, FR-34). Both are off until chosen. */
export default function ReminderScreen() {
  const [settings, setSettings] = useState<ReminderSettings | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getReminderSettings()
        .then((saved) => active && setSettings(saved))
        .catch((error) => {
          console.warn('Gagal memuat pengingat', error);
          if (active) setSettings(DEFAULT_REMINDERS);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const toggle = async (key: 'dailyEnabled' | 'who5Enabled') => {
    if (!settings) return;
    const turningOn = !settings[key];

    if (turningOn && !(await ensureNotificationPermission())) {
      Alert.alert(
        'Notifikasi belum diizinkan',
        'Supaya pengingat bisa muncul, izinkan notifikasi untuk Teduh di pengaturan ponselmu.',
      );
      return;
    }

    try {
      setSettings(await saveReminderSettings({ [key]: turningOn }));
    } catch (error) {
      console.warn('Gagal menyimpan pengingat', error);
      Alert.alert('Belum tersimpan', 'Pengaturan pengingat belum bisa disimpan. Coba lagi.');
    }
  };

  const zone = timeZoneLabel().short;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="Pengingat" />
      {settings === undefined ? null : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Text accessibilityRole="header" style={Type.title}>
              Jeda yang kamu pilih.
            </Text>
            <Text style={Type.bodyLg}>Pengingat lembut, sesuai ritmemu.</Text>

            <RowCard
              icon="notification"
              tone="yellow"
              title="Check-in harian"
              subtitle={settings.dailyEnabled ? 'Aktif · Setiap hari' : 'Nonaktif'}
              trailing={settings.dailyEnabled ? 'toggle-on' : 'toggle-off'}
              role="switch"
              checked={settings.dailyEnabled}
              onPress={() => toggle('dailyEnabled')}
            />
            <RowCard
              icon="clock"
              tone="blue"
              title="Waktu pengingat"
              subtitle={`${formatReminderTime(settings.hour, settings.minute)}${zone ? ` ${zone}` : ''}`}
              onPress={() => router.push('/pengingat/waktu')}
            />
            <RowCard
              icon="calendar"
              tone="blueSoft"
              title="Pengingat WHO-5"
              subtitle={settings.who5Enabled ? 'Aktif · Setiap 14 hari' : 'Nonaktif · Setiap 14 hari'}
              trailing={settings.who5Enabled ? 'toggle-on' : 'toggle-off'}
              role="switch"
              checked={settings.who5Enabled}
              onPress={() => toggle('who5Enabled')}
            />

            <InfoCard
              tone="yellowSoft"
              title="Boleh terlewat"
              body="Pengingat bukan kewajiban. Kamu bisa mematikannya kapan saja."
            />
          </ScrollView>
          <View style={styles.actionBar}>
            <Button label="Selesai" onPress={() => router.back()} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  actionBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Palette.background,
  },
});
