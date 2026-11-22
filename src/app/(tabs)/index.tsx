import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { InfoCard } from '@/components/InfoCard';
import { Mascot } from '@/components/Mascot';
import { TabHeader } from '@/components/ScreenHeader';
import { MoodColors, Palette, Radius, Tones, Type } from '@/constants/theme';
import { MOOD_HEADLINES, MOODS } from '@/data/labels';
import { mascotForMood } from '@/data/mascot';
import { useHomeData } from '@/hooks/use-home-data';
import { formatDateId, formatTimeId, partOfDay } from '@/utils/date';

// No account yet in the offline version; replace with the profile name later.
const DISPLAY_NAME = 'Nara';

export default function BerandaScreen() {
  const { loading, todayEntry, activeDays, who5Due, showSupport } = useHomeData();
  const now = new Date();

  const moodMeta = todayEntry ? MOODS.find((m) => m.value === todayEntry.mood) : undefined;
  const detail = todayEntry
    ? [...todayEntry.emotions, ...todayEntry.contexts, formatTimeId(new Date(todayEntry.createdAt))].join(
        ' · ',
      )
    : '';

  // The mascot is bright until today's mood says otherwise; then it keeps you company.
  const face = todayEntry && todayEntry.mood <= 3 ? mascotForMood(todayEntry.mood) : 'shining';

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TabHeader title="Beranda" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.heroRow}>
            <View style={styles.heroText}>
              <Text style={Type.body}>{formatDateId(now)}</Text>
              <Text accessibilityRole="header" style={Type.title}>
                {`Selamat ${partOfDay(now)}, ${DISPLAY_NAME}`}
              </Text>
            </View>
            <Mascot name={face} width={92} />
          </View>
          <Text style={Type.bodyLg}>Ada ruang buat perasaanmu hari ini.</Text>
          <Button label="Check-in hari ini" onPress={() => router.push('/checkin')} />
        </View>

        {!loading && todayEntry ? (
          <View style={[styles.moodCard, { backgroundColor: MoodColors[todayEntry.mood].tint }]}>
            <View style={styles.moodBubble}>
              <Icon name={moodMeta?.icon ?? 'emoji-sad'} />
            </View>
            <View style={styles.moodText}>
              <Text style={Type.subheading}>
                {`${todayEntry.mood} / 5 · ${MOOD_HEADLINES[todayEntry.mood]}`}
              </Text>
              {detail ? <Text style={Type.body}>{detail}</Text> : null}
            </View>
          </View>
        ) : null}

        {!loading && !todayEntry ? (
          <InfoCard
            tone="yellow"
            title="Belum check-in hari ini"
            body="Nggak perlu menunggu hari yang sempurna."
          />
        ) : null}

        {activeDays > 0 ? (
          <InfoCard
            tone="yellowSoft"
            title={`${activeDays} hari memberi ruang`}
            body="Kamu sempat hadir untuk dirimu. Terlewat sehari juga nggak apa-apa."
          />
        ) : null}

        {who5Due ? (
          <InfoCard
            tone="blueSoft"
            title="Waktunya menyapa diri"
            body="WHO-5 sudah bisa diisi lagi. Luangkan sekitar 2 menit."
            actionLabel="Isi WHO-5"
            onAction={() => router.push('/who5')}
          />
        ) : null}

        {showSupport ? (
          <InfoCard
            tone="yellow"
            title="Minggu ini terasa berat?"
            body="Mau ngobrol dengan profesional? Kamu nggak harus menghadapi semuanya sendiri."
            actionLabel="Cari dukungan"
            onAction={() => router.push('/krisis')}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  hero: {
    alignSelf: 'stretch',
    gap: 12,
    padding: 18,
    borderRadius: Radius.lg,
    backgroundColor: Tones.blue,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroText: { flex: 1 },
  moodCard: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: Radius.lg,
  },
  moodBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
  },
  moodText: { flex: 1, gap: 2 },
});
