import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ChartCard, LineChart, type ChartPoint } from '@/components/charts/LineChart';
import { Chip } from '@/components/checkin/Chip';
import { InfoCard } from '@/components/InfoCard';
import { Mascot } from '@/components/Mascot';
import { TabHeader } from '@/components/ScreenHeader';
import { MoodColors, moodColor, Palette, Type } from '@/constants/theme';
import { useHistoryData } from '@/hooks/use-history-data';
import { getLatestEntryForDay, type MoodEntry } from '@/services/moodService';
import type { Assessment } from '@/services/who5Service';
import {
  formatMonthYear,
  formatRelativeDay,
  formatShortDate,
  formatTimeId,
  formatWeekRange,
  localDay,
  weekDays,
} from '@/utils/date';
import { entrySummary } from '@/utils/entry';

type Range = 'week' | 'month';

const WEEKDAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MOOD_GRID = [
  { value: 5, label: '5' },
  { value: 3, label: '3' },
  { value: 1, label: '1' },
];
const WHO5_GRID = [{ value: 100 }, { value: 50 }, { value: 0 }];

async function openCheckInOfDay(day: string) {
  const entry = await getLatestEntryForDay(day);
  if (entry) router.push({ pathname: '/checkin/[id]', params: { id: String(entry.id) } });
}

export default function RiwayatScreen() {
  const { loading, recent, averages, assessments } = useHistoryData();
  const [range, setRange] = useState<Range>('week');
  const now = new Date();

  const isEmpty = !loading && recent.length === 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TabHeader title="Riwayat" />
      <ScrollView contentContainerStyle={styles.content}>
        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <Text style={Type.heading}>Perasaan punya ritmenya.</Text>
            <View style={styles.chips}>
              <Chip label="Mingguan" selected={range === 'week'} onPress={() => setRange('week')} />
              <Chip label="Bulanan" selected={range === 'month'} onPress={() => setRange('month')} />
            </View>

            {range === 'week' ? (
              <WeekChart now={now} averages={averages} />
            ) : (
              <MonthChart now={now} averages={averages} />
            )}

            {recent.length > 0 ? <Text style={Type.subheading}>Check-in terbaru</Text> : null}
            {recent.map((entry) => (
              <RecentCard key={entry.id} entry={entry} />
            ))}
          </>
        )}

        {!loading ? <Who5Section assessments={assessments} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <>
      <Mascot name="hug" width={150} />
      <Text accessibilityRole="header" style={Type.title}>
        {'Cerita pertamamu\nbelum dimulai.'}
      </Text>
      <Text style={Type.bodyLg}>
        Setelah check-in, kamu bisa melihat perjalanan perasaanmu di sini.
      </Text>
      <Button label="Check-in pertama" onPress={() => router.push('/checkin')} />
    </>
  );
}

function WeekChart({ now, averages }: { now: Date; averages: Record<string, number> }) {
  const days = weekDays(now);
  const points: ChartPoint[] = [];
  days.forEach((date, index) => {
    const day = localDay(date);
    const value = averages[day];
    if (value === undefined) return;
    points.push({
      key: day,
      t: index / 6,
      value,
      color: moodColor(value).strong,
      accessibilityLabel: `Lihat check-in ${formatShortDate(date)}`,
      onPress: () => openCheckInOfDay(day),
    });
  });

  return (
    <>
      <Text style={Type.bodyLgBold}>{formatWeekRange(days)}</Text>
      <ChartCard title="Rata-rata mood harian">
        <LineChart
          height={144}
          min={1}
          max={5}
          plotBottom={112}
          grid={MOOD_GRID}
          points={points}
          xLabels={WEEKDAY_LABELS.map((text, index) => ({ t: index / 6, text }))}
        />
      </ChartCard>
    </>
  );
}

function MonthChart({ now, averages }: { now: Date; averages: Record<string, number> }) {
  const dayCount = now.getDate();
  const tOf = (dayOfMonth: number) => (dayCount > 1 ? (dayOfMonth - 1) / (dayCount - 1) : 0.5);

  const points: ChartPoint[] = [];
  for (let d = 1; d <= dayCount; d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), d);
    const day = localDay(date);
    const value = averages[day];
    if (value === undefined) continue;
    points.push({
      key: day,
      t: tOf(d),
      value,
      color: moodColor(value).strong,
      accessibilityLabel: `Lihat check-in ${formatShortDate(date)}`,
      onPress: () => openCheckInOfDay(day),
    });
  }

  const xLabels = [1, 8, 15, 22, 29]
    .filter((d) => d <= dayCount)
    .map((d) => ({
      t: tOf(d),
      text: formatShortDate(new Date(now.getFullYear(), now.getMonth(), d)),
    }));

  return (
    <>
      <Text style={Type.bodyLgBold}>{formatMonthYear(now)}</Text>
      <ChartCard title="Rata-rata mood harian">
        <LineChart
          height={144}
          min={1}
          max={5}
          plotBottom={112}
          grid={MOOD_GRID}
          points={points}
          dotRadius={2.5}
          hitSize={dayCount > 1 ? Math.min(48, 280 / (dayCount - 1)) : 48}
          xLabels={xLabels}
        />
      </ChartCard>
    </>
  );
}

function RecentCard({ entry }: { entry: MoodEntry }) {
  const date = new Date(entry.createdAt);
  const open = () => router.push({ pathname: '/checkin/[id]', params: { id: String(entry.id) } });

  // Tappable, so it is lifted; tinted with the colour of that check-in's mood.
  return (
    <InfoCard
      fill={MoodColors[entry.mood].tint}
      title={`${formatRelativeDay(date)} · ${formatTimeId(date)}`}
      body={entrySummary(entry)}
      onPress={open}
    />
  );
}

function Who5Section({ assessments }: { assessments: Assessment[] }) {
  if (assessments.length === 0) {
    return (
      <InfoCard
        tone="blueSoft"
        title="Skor WHO-5"
        body="Belum ada hasil. Kamu bisa mulai saat siap."
        actionLabel="Kenali WHO-5"
        onAction={() => router.push('/who5')}
      />
    );
  }

  const latest = assessments[assessments.length - 1];
  const times = assessments.map((a) => new Date(a.createdAt).getTime());
  const span = times[times.length - 1] - times[0];
  const tOf = (time: number) => (span > 0 ? (time - times[0]) / span : 0.5);

  const points: ChartPoint[] = assessments.map((a, index) => ({
    key: String(a.id),
    t: tOf(times[index]),
    value: a.score,
    accessibilityLabel: `Lihat hasil WHO-5 ${formatShortDate(new Date(a.createdAt))}`,
    onPress: () => router.push({ pathname: '/who5/hasil', params: { id: String(a.id) } }),
  }));

  const labelIndexes = Array.from(
    new Set([0, Math.floor((assessments.length - 1) / 2), assessments.length - 1]),
  );
  const xLabels = labelIndexes.map((i) => ({
    t: tOf(times[i]),
    text: formatShortDate(new Date(assessments[i].createdAt)),
  }));

  return (
    <>
      <Text style={Type.subheading}>Skor WHO-5</Text>
      <ChartCard title={`${latest.score} / 100 · ${formatShortDate(new Date(latest.createdAt))}`}>
        <LineChart
          height={72}
          min={0}
          max={100}
          plotBottom={52}
          grid={WHO5_GRID}
          points={points}
          xLabels={xLabels}
        />
      </ChartCard>
      <Button variant="outline" label="Lihat hasil WHO-5" onPress={() => router.push('/who5/hasil')} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
