import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { StackHeader } from '@/components/ScreenHeader';
import { FontFamily, Palette, Radius, Tones, Type } from '@/constants/theme';
import {
  getReminderSettings,
  saveReminderSettings,
  timeZoneLabel,
} from '@/services/reminderService';

const MINUTE_STEP = 15;
const pad = (n: number) => String(n).padStart(2, '0');
const wrap = (value: number, size: number) => ((value % size) + size) % size;

/** One number of the picker. Tapping a dimmed neighbour moves the time by one step. */
function Step({
  text,
  big,
  label,
  onPress,
}: {
  text: string;
  big?: boolean;
  label?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.cell}>
      <Text style={big ? styles.big : styles.small}>{text}</Text>
    </Pressable>
  );
}

/** Picks the daily reminder time: hours step by 1, minutes by 15. */
export default function ReminderTimeScreen() {
  const [time, setTime] = useState<{ hour: number; minute: number } | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getReminderSettings()
      .then((saved) => active && setTime({ hour: saved.hour, minute: saved.minute }))
      .catch(() => active && setTime({ hour: 20, minute: 0 }));
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    if (!time || saving) return;
    setSaving(true);
    try {
      await saveReminderSettings(time);
      router.back();
    } catch (error) {
      console.warn('Gagal menyimpan waktu', error);
      Alert.alert('Belum tersimpan', 'Waktu pengingat belum bisa disimpan. Coba lagi.');
      setSaving(false);
    }
  };

  const shift = (hourBy: number, minuteBy: number) =>
    setTime((t) =>
      t && {
        hour: wrap(t.hour + hourBy, 24),
        minute: wrap(t.minute + minuteBy * MINUTE_STEP, 60),
      },
    );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="Pengingat" />
      {time === undefined ? null : (
        <>
          <View style={styles.content}>
            <Text accessibilityRole="header" style={Type.title}>
              Kapan enaknya jeda?
            </Text>
            <Text style={Type.bodyLg}>Pilih jam check-in harianmu.</Text>

            <View style={styles.picker}>
              <View style={styles.row}>
                <Step text={pad(wrap(time.hour - 1, 24))} label="Jam sebelumnya" onPress={() => shift(-1, 0)} />
                <Text style={styles.colon}>:</Text>
                <Step
                  text={pad(wrap(time.minute - MINUTE_STEP, 60))}
                  label="Menit sebelumnya"
                  onPress={() => shift(0, -1)}
                />
              </View>
              <View style={styles.row} accessibilityLiveRegion="polite">
                <Step big text={pad(time.hour)} />
                <Text style={[styles.colon, styles.colonBig]}>:</Text>
                <Step big text={pad(time.minute)} />
              </View>
              <View style={styles.row}>
                <Step text={pad(wrap(time.hour + 1, 24))} label="Jam berikutnya" onPress={() => shift(1, 0)} />
                <Text style={styles.colon}>:</Text>
                <Step
                  text={pad(wrap(time.minute + MINUTE_STEP, 60))}
                  label="Menit berikutnya"
                  onPress={() => shift(0, 1)}
                />
              </View>
            </View>

            <Text style={Type.body}>{timeZoneLabel().long}</Text>
          </View>
          <View style={styles.actionBar}>
            <Button label="Simpan waktu" onPress={save} disabled={saving} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { flex: 1, paddingHorizontal: 24, gap: 16 },
  picker: {
    gap: 16,
    paddingVertical: 24,
    borderRadius: Radius.lg,
    backgroundColor: Tones.yellow,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  cell: { minWidth: 96, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  small: { ...Type.heading, textAlign: 'center' },
  big: { ...Type.heading, fontSize: 48, lineHeight: 60, fontFamily: FontFamily.displayHeavy },
  colon: { ...Type.heading },
  colonBig: { fontSize: 48, lineHeight: 60, fontFamily: FontFamily.displayHeavy },
  actionBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Palette.background,
  },
});
