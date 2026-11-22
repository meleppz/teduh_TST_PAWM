import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/checkin/Chip';
import { InfoCard } from '@/components/InfoCard';
import { Mascot } from '@/components/Mascot';
import { TabHeader } from '@/components/ScreenHeader';
import { Palette, Type, type Tone } from '@/constants/theme';
import { COPING_EMOTIONS, COPING_TECHNIQUES, type CopingTechnique } from '@/data/copingSeed';
import { mascotForEmotion } from '@/data/mascot';
import { getRecommendation, type CopingRecommendation } from '@/services/copingService';
import { getLatestEntry } from '@/services/moodService';

const DEFAULT_RECOMMENDATION: CopingRecommendation = {
  techniques: COPING_TECHNIQUES,
  sessionCount: 0,
};

/** Each technique keeps its own colour, so it is easy to spot when the order changes. */
const TECHNIQUE_TONES: Record<string, Tone> = {
  'napas-478': 'blue',
  'kembali-ke-sekitar': 'yellowSoft',
  'tulis-lalu-lepaskan': 'blueSoft',
};

function actionLabel(technique: CopingTechnique, rank: number): string {
  if (technique.kind === 'journal') return 'Buka jurnal';
  return rank === 0 ? 'Mulai latihan' : 'Coba latihan';
}

export default function CopingScreen() {
  const [emotion, setEmotion] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<CopingRecommendation>(DEFAULT_RECOMMENDATION);
  const userPicked = useRef(false);

  // Start from the emotion of the latest check-in, unless the user already chose one.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getLatestEntry()
        .then((entry) => {
          if (!active || userPicked.current || !entry) return;
          const match = entry.emotions.find((e) =>
            (COPING_EMOTIONS as readonly string[]).includes(e),
          );
          if (match) setEmotion(match);
        })
        .catch((error) => console.warn('Gagal memuat check-in terakhir', error));
      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    let active = true;
    getRecommendation(emotion)
      .then((result) => active && setRecommendation(result))
      .catch((error) => {
        console.warn('Gagal memuat rekomendasi coping', error);
        if (active) setRecommendation(DEFAULT_RECOMMENDATION);
      });
    return () => {
      active = false;
    };
  }, [emotion]);

  const open = (technique: CopingTechnique) => {
    if (technique.kind === 'journal') {
      router.push('/jurnal');
      return;
    }
    router.push({
      pathname: '/coping/[id]',
      params: { id: technique.id, ...(emotion ? { emotion } : {}) },
    });
  };

  const personalised = recommendation.sessionCount > 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TabHeader title="Coping" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <View style={styles.headingText}>
            <Text accessibilityRole="header" style={Type.title}>
              Lagi ngerasa apa?
            </Text>
            <Text style={Type.bodyLg}>Pilih yang paling dekat dengan perasaanmu.</Text>
          </View>
          <Mascot name={mascotForEmotion(emotion)} width={88} pop />
        </View>

        <View style={styles.chips}>
          {COPING_EMOTIONS.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={emotion === item}
              onPress={() => {
                userPicked.current = true;
                setEmotion(emotion === item ? null : item);
              }}
            />
          ))}
        </View>

        <Text style={Type.bodyBold}>
          {personalised
            ? `Paling membantumu · dari ${recommendation.sessionCount} sesi`
            : 'Baru mulai? Coba dari sini.'}
        </Text>

        {recommendation.techniques.map((technique, index) => (
          <InfoCard
            key={technique.id}
            tone={TECHNIQUE_TONES[technique.id] ?? 'blue'}
            title={technique.name}
            body={`${technique.minutes} menit · ${technique.description}`}
            actionLabel={actionLabel(technique, index)}
            onAction={() => open(technique)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headingText: { flex: 1, gap: 4 },
});
