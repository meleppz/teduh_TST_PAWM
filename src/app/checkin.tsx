import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Chip } from '@/components/checkin/Chip';
import { MoodScale } from '@/components/checkin/MoodScale';
import { InfoCard } from '@/components/InfoCard';
import { Mascot } from '@/components/Mascot';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Type } from '@/constants/theme';
import { CONTEXTS, EMOTIONS, ENERGY_LEVELS, type MoodValue } from '@/data/labels';
import { mascotForMood } from '@/data/mascot';
import { addMoodEntry } from '@/services/moodService';

const toggle = (list: string[], item: string) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

export default function CheckInScreen() {
  const [mood, setMood] = useState<MoodValue | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [contexts, setContexts] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMood, setSavedMood] = useState<MoodValue | null>(null);

  const onSave = async () => {
    if (mood === null) {
      setShowError(true);
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await addMoodEntry({ mood, energy, emotions, contexts });
      setSavedMood(mood);
    } catch (error) {
      console.warn('Gagal menyimpan check-in', error);
      Alert.alert('Belum tersimpan', 'Check-in kamu belum bisa disimpan. Coba lagi sebentar lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (savedMood !== null) {
    return <SavedView mood={savedMood} />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="Check-in" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headingRow}>
          <View style={styles.headingText}>
            <Text accessibilityRole="header" style={Type.heading}>
              Gimana perasaanmu?
            </Text>
            <Text style={Type.body}>Nggak ada jawaban yang salah.</Text>
          </View>
          {/* The mascot answers your choice, one small moment of life on this screen. */}
          <Mascot name={mood === null ? 'shining' : mascotForMood(mood)} width={84} pop />
        </View>

        <MoodScale
          value={mood}
          onChange={(value) => {
            setMood(value);
            setShowError(false);
          }}
        />
        {showError ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            Pilih mood dulu, ya, sebelum menyimpan.
          </Text>
        ) : null}

        <Text style={Type.bodyLgBold}>Energi kamu</Text>
        <View style={styles.energyRow}>
          {ENERGY_LEVELS.map((level) => (
            <Chip
              key={level}
              flex
              label={String(level)}
              selected={energy === level}
              onPress={() => setEnergy(energy === level ? null : level)}
            />
          ))}
        </View>
        <View style={styles.energyHint}>
          <Text style={Type.caption}>1 · Habis tenaga</Text>
          <Text style={Type.caption}>5 · Penuh energi</Text>
        </View>

        <Text style={Type.bodyBold}>Emosi yang terasa · boleh lebih dari satu</Text>
        <View style={styles.chips}>
          {EMOTIONS.map((emotion) => (
            <Chip
              key={emotion}
              label={emotion}
              selected={emotions.includes(emotion)}
              onPress={() => setEmotions(toggle(emotions, emotion))}
            />
          ))}
        </View>

        <Text style={Type.bodyBold}>Lagi tentang apa? · Opsional</Text>
        <View style={styles.chips}>
          {CONTEXTS.map((context) => (
            <Chip
              key={context}
              label={context}
              selected={contexts.includes(context)}
              onPress={() => setContexts(toggle(contexts, context))}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <Button label="Simpan" onPress={onSave} />
      </View>
    </SafeAreaView>
  );
}

function SavedView({ mood }: { mood: MoodValue }) {
  const low = mood <= 2;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="Check-in" />
      <ScrollView contentContainerStyle={[styles.content, styles.savedContent]}>
        <Mascot name={mood >= 4 ? 'shining' : 'hug'} width={140} pop />
        <Text accessibilityRole="header" style={Type.display}>
          {'Makasih sudah\ncerita hari ini.'}
        </Text>
        <Text style={Type.bodyLg}>
          Check-in kamu tersimpan di ponselmu. Apa pun yang kamu rasakan, itu boleh.
        </Text>
        <MoodScale value={mood} />
        {low ? (
          <InfoCard
            tone="yellow"
            title="Mau coba teknik coping?"
            body="Ambil jeda sebentar. Coba satu latihan yang terasa nyaman."
            actionLabel="Lihat teknik coping"
            onAction={() => router.replace('/coping')}
          />
        ) : null}
        <Button variant="outline" label="Kembali ke Beranda" onPress={() => router.replace('/')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  savedContent: { gap: 20 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headingText: { flex: 1, gap: 2 },
  error: { ...Type.bodyBold, color: Palette.error },
  energyRow: { flexDirection: 'row', gap: 8 },
  energyHint: { flexDirection: 'row', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Palette.background,
  },
});
