import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ProgressBar } from '@/components/ProgressBar';
import { Mascot } from '@/components/Mascot';
import { StackHeader } from '@/components/ScreenHeader';
import { FontFamily, Palette, Radius, Tones, Type } from '@/constants/theme';
import {
  getAssessmentById,
  getLatestAssessment,
  isLowScore,
  type Assessment,
} from '@/services/who5Service';
import { formatDayMonth } from '@/utils/date';
import { openHealing } from '@/utils/healing';

export default function Who5ResultScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  // undefined = loading, null = nothing to show
  const [assessment, setAssessment] = useState<Assessment | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    (id ? getAssessmentById(Number(id)) : getLatestAssessment())
      .then((found) => active && setAssessment(found))
      .catch((error) => {
        console.warn('Gagal memuat hasil WHO-5', error);
        if (active) setAssessment(null);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="WHO-5" />
      {assessment === undefined ? null : assessment === null ? (
        <View style={styles.content}>
          <Text style={Type.bodyLg}>Belum ada hasil WHO-5.</Text>
          <Button label="Mulai WHO-5" onPress={() => router.replace('/who5')} />
        </View>
      ) : (
        <Result assessment={assessment} />
      )}
    </SafeAreaView>
  );
}

function Result({ assessment }: { assessment: Assessment }) {
  const low = isLowScore(assessment.score);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={Type.body}>{`Hasil WHO-5 · ${formatDayMonth(new Date(assessment.createdAt))}`}</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.score}>{assessment.score}</Text>
        <Text style={[Type.bodyLg, styles.center]}>dari 100</Text>
        <ProgressBar value={assessment.score} max={100} accessibilityLabel={`${assessment.score} dari 100`} />
      </View>

      <View style={styles.headline}>
        <Text accessibilityRole="header" style={[Type.title, styles.headlineText]}>
          {low ? 'Kamu layak dapat dukungan.' : 'Ada ruang untuk hal baik.'}
        </Text>
        <Mascot name={low ? 'hug' : 'shining'} width={84} />
      </View>
      <Text style={Type.bodyLg}>
        {low
          ? 'Belakangan mungkin terasa menguras energi. Ngobrol dengan profesional bisa jadi langkah kecil yang membantu.'
          : 'Belakangan kamu cukup sering merasa nyaman dalam keseharianmu. Tetap beri ruang untuk istirahat dan hal yang kamu suka.'}
      </Text>
      <Text style={Type.body}>
        Skor lebih tinggi menunjukkan kesejahteraan yang kamu rasakan lebih baik. Ini bukan diagnosis.
      </Text>

      {low ? (
        <Button label="Hubungi Healing119.id" onPress={openHealing} />
      ) : null}
      <Button variant="outline" label="Kembali ke Beranda" onPress={() => router.replace('/')} />
      <Button variant="outline" label="Kapan bisa isi lagi?" onPress={() => router.push('/who5')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  scoreCard: {
    alignSelf: 'stretch',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderRadius: Radius.lg,
    backgroundColor: Tones.blueSoft,
  },
  headline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headlineText: { flex: 1 },
  // The 48 px score from the design.
  score: {
    fontSize: 48,
    lineHeight: 60,
    fontFamily: FontFamily.displayHeavy,
    color: Palette.text,
    textAlign: 'center',
  },
  center: { textAlign: 'center' },
});
