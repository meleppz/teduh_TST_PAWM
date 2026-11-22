import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { Icon } from '@/components/Icon';
import { InfoCard } from '@/components/InfoCard';
import { Mascot } from '@/components/Mascot';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Radius, Tones, Type, type Tone } from '@/constants/theme';
import { loadInsights, type InsightState } from '@/services/insightService';
import { formatDayRange, parseDay } from '@/utils/date';

/** Good news is soft yellow, a heavier pattern is yellow, anything else is blue. */
function toneOf(key: string): Tone {
  if (key.startsWith('lighter-')) return 'yellowSoft';
  if (key.startsWith('heavier-')) return 'yellow';
  return 'blue';
}

/** Patterns from the user's own check-ins, shown after 14 of them (FR-22 to FR-24). */
export default function InsightsScreen() {
  const [state, setState] = useState<InsightState | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadInsights()
        .then((result) => active && setState(result))
        .catch((error) => {
          console.warn('Gagal memuat wawasan', error);
          if (active) setState({ status: 'locked', count: 0, needed: 14 });
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader
        title="Wawasan"
        right={
          state?.status === 'ready' ? (
            <View style={styles.headerIcon}>
              <Icon name="magic-star" />
            </View>
          ) : undefined
        }
      />
      {state === undefined ? null : state.status === 'locked' ? (
        <Locked count={state.count} needed={state.needed} />
      ) : (
        <Ready state={state} />
      )}
    </SafeAreaView>
  );
}

function Locked({ count, needed }: { count: number; needed: number }) {
  const remaining = Math.max(0, needed - count);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Mascot name="confused" width={110} />
      <Text accessibilityRole="header" style={Type.title}>
        {'Pola kecil,\nmakin terlihat.'}
      </Text>
      <View style={styles.ringCard}>
        <ProgressRing value={count} max={needed} accessibilityLabel={`${count} dari ${needed} check-in`} />
        <Text style={[Type.subheading, styles.center]}>{`${count} / ${needed} check-in`}</Text>
      </View>
      <Text style={Type.heading}>{`Butuh ${remaining} check-in lagi`}</Text>
      <Text style={Type.bodyLg}>
        {`Setelah ${needed} check-in, Teduh bisa merangkum pola yang teramati dari catatanmu.`}
      </Text>
      <Button label="Check-in hari ini" onPress={() => router.push('/checkin')} />
    </ScrollView>
  );
}

function Ready({ state }: { state: Extract<InsightState, { status: 'ready' }> }) {
  const range = formatDayRange(parseDay(state.firstDay), parseDay(state.lastDay));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headline}>
        <View style={styles.headlineText}>
          <Text accessibilityRole="header" style={Type.title}>
            Kenali ritmemu.
          </Text>
          <Text style={Type.body}>{`Dari ${state.count} check-in · ${range}`}</Text>
        </View>
        <Mascot name="shining" width={84} />
      </View>

      {state.cards.length === 0 ? (
        <InfoCard
          title="Belum ada pola yang menonjol"
          body="Terus catat konteks di check-in-mu. Pola akan terlihat seiring waktu."
        />
      ) : (
        state.cards.map((card) => (
          <InfoCard key={card.key} tone={toneOf(card.key)} title={card.title} body={card.body} />
        ))
      )}

      {/* Sleep and weather come from other groups' services, which are not linked yet. */}
      <InfoCard
        tone="white"
        title="Tidur · Belum tertaut"
        body="Data tidur belum terhubung. Belum ada pola yang bisa ditampilkan."
      />
      <InfoCard
        tone="white"
        title="Cuaca · Belum tertaut"
        body="Data cuaca belum terhubung. Belum ada pola yang bisa ditampilkan."
      />
      <Text style={Type.caption}>Ini pola yang teramati, bukan diagnosis.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  ringCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
    borderRadius: Radius.lg,
    backgroundColor: Tones.blue,
  },
  headline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headlineText: { flex: 1, gap: 2 },
  center: { textAlign: 'center' },
  headerIcon: { marginRight: 8 },
});
