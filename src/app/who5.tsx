import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { InfoCard } from '@/components/InfoCard';
import { Mascot } from '@/components/Mascot';
import { ProgressBar } from '@/components/ProgressBar';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Type } from '@/constants/theme';
import {
  daysUntilNext,
  getLatestAssessment,
  nextAvailableAt,
  WHO5_INTERVAL_DAYS,
  type Assessment,
} from '@/services/who5Service';
import { formatDayMonth } from '@/utils/date';

type Gate = { loading: true } | { loading: false; latest: Assessment | null; daysLeft: number };

/** Entry of WHO-5: the introduction when it is open, the waiting screen when it is not. */
export default function Who5GateScreen() {
  const [gate, setGate] = useState<Gate>({ loading: true });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getLatestAssessment()
        .then((latest) => {
          if (active) setGate({ loading: false, latest, daysLeft: latest ? daysUntilNext(latest) : 0 });
        })
        .catch((error) => {
          console.warn('Gagal memuat WHO-5', error);
          if (active) setGate({ loading: false, latest: null, daysLeft: 0 });
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="WHO-5" />
      {gate.loading ? null : gate.latest && gate.daysLeft > 0 ? (
        <Locked latest={gate.latest} daysLeft={gate.daysLeft} />
      ) : (
        <Intro />
      )}
    </SafeAreaView>
  );
}

function Intro() {
  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Mascot name="hug" width={110} />
        <Text accessibilityRole="header" style={Type.title}>
          {'Dua minggu ini,\ngimana kabarmu?'}
        </Text>
        <Text style={Type.bodyLg}>
          WHO-5 berisi 5 pertanyaan singkat tentang keseharianmu dalam 2 minggu terakhir.
        </Text>
        <InfoCard
          tone="yellow"
          title="Sekitar 2 menit"
          body="Bisa diisi setiap 14 hari. Nggak ada jawaban benar atau salah."
        />
        <Text style={Type.body}>
          Hasilnya membantu kamu berefleksi, bukan pengganti penilaian profesional.
        </Text>
      </ScrollView>
      <View style={styles.actionBar}>
        <Button label="Mulai WHO-5" onPress={() => router.push('/who5/isi')} />
      </View>
    </>
  );
}

function Locked({ latest, daysLeft }: { latest: Assessment; daysLeft: number }) {
  const filledDays = WHO5_INTERVAL_DAYS - daysLeft;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Mascot name="hug" width={100} />
      <Text accessibilityRole="header" style={Type.title}>
        {`Sampai ketemu\n${daysLeft} hari lagi.`}
      </Text>
      <Text style={Type.bodyLg}>
        {`Terakhir diisi ${formatDayMonth(new Date(latest.createdAt))}. WHO-5 berikutnya terbuka ${formatDayMonth(nextAvailableAt(latest))}.`}
      </Text>
      <ProgressBar
        value={filledDays}
        max={WHO5_INTERVAL_DAYS}
        accessibilityLabel={`${filledDays} dari ${WHO5_INTERVAL_DAYS} hari`}
      />
      <InfoCard
        title="Nggak perlu buru-buru"
        body="Sambil menunggu, kamu tetap bisa mencatat mood harian."
      />
      <Button label="Lihat hasil terakhir" onPress={() => router.push('/who5/hasil')} />
      <Button variant="outline" label="Kembali ke Beranda" onPress={() => router.replace('/')} />
    </ScrollView>
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
