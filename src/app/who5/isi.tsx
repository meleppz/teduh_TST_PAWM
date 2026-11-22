import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Type } from '@/constants/theme';
import { WHO5_OPTIONS, WHO5_QUESTIONS } from '@/data/who5Items';
import { syncReminders } from '@/services/reminderService';
import { saveAssessment } from '@/services/who5Service';

/** The five WHO-5 questions, one per screen. Tapping an answer moves on. */
export default function Who5QuestionsScreen() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>([]);
  const [saving, setSaving] = useState(false);

  const total = WHO5_QUESTIONS.length;

  const finish = async (final: number[]) => {
    setSaving(true);
    try {
      await saveAssessment(final);
      // The next WHO-5 reminder moves 14 days ahead.
      void syncReminders();
      router.replace('/who5/hasil');
    } catch (error) {
      console.warn('Gagal menyimpan WHO-5', error);
      Alert.alert('Belum tersimpan', 'Jawabanmu belum bisa disimpan. Coba lagi sebentar lagi.');
      setSaving(false);
    }
  };

  const choose = (value: number) => {
    if (saving) return;
    const next = [...answers];
    next[index] = value;
    setAnswers(next);

    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      finish(next as number[]);
    }
  };

  const goBack = () => {
    if (index > 0) setIndex(index - 1);
    else router.back();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="WHO-5" onBack={goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={Type.bodyBold}>{`Pertanyaan ${index + 1} dari ${total}`}</Text>
        <ProgressBar
          value={index + 1}
          max={total}
          accessibilityLabel={`Pertanyaan ${index + 1} dari ${total}`}
        />
        <Text style={Type.body}>Dalam 2 minggu terakhir…</Text>
        <Text accessibilityRole="header" style={Type.heading}>
          {WHO5_QUESTIONS[index]}
        </Text>
        <Text style={Type.body}>Pilih jawaban yang paling sesuai.</Text>
        {WHO5_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            label={`${option.value} · ${option.label}`}
            selected={answers[index] === option.value}
            disabled={saving}
            onPress={() => choose(option.value)}
          />
        ))}
        <Text style={Type.caption}>Jawabanmu hanya tersimpan di ponselmu.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
});
