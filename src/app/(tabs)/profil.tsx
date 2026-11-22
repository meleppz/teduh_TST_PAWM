import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Mascot } from '@/components/Mascot';
import { RowCard } from '@/components/RowCard';
import { TabHeader } from '@/components/ScreenHeader';
import { Palette, Radius, Tones, Type } from '@/constants/theme';

// There is no account in the offline version; replace with the saved name later.
const DISPLAY_NAME = 'Nara';

export default function ProfilScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <TabHeader title="Profil" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Mascot name="hug" width={96} />
          <Text style={[Type.title, styles.center]}>{DISPLAY_NAME}</Text>
          <Text style={[Type.body, styles.center]}>Ruang kecil untuk diriku.</Text>
        </View>

        <RowCard
          icon="note"
          tone="blueSoft"
          title="Jurnal"
          subtitle="Catatan pribadi kamu"
          trailing="arrow-right"
          onPress={() => router.push('/jurnal')}
        />
        <RowCard
          icon="notification"
          tone="yellow"
          title="Pengingat"
          subtitle="Atur jeda harianmu"
          trailing="arrow-right"
          onPress={() => router.push('/pengingat')}
        />
        <RowCard
          icon="graph"
          tone="yellowSoft"
          title="Wawasan Pola"
          subtitle="Kenali ritme perasaanmu"
          trailing="arrow-right"
          onPress={() => router.push('/wawasan')}
        />
        <RowCard
          icon="settings"
          tone="blue"
          title="Privasi & Tentang"
          subtitle="Datamu tetap milikmu"
          trailing="arrow-right"
          onPress={() => router.push('/privasi')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  card: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
    borderRadius: Radius.lg,
    backgroundColor: Tones.yellow,
  },
  center: { textAlign: 'center' },
});
