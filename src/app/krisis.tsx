import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { InfoCard } from '@/components/InfoCard';
import { Mascot } from '@/components/Mascot';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Type } from '@/constants/theme';
import { openHealing } from '@/utils/healing';

/**
 * Crisis help (FR-29, FR-32): a calm pointer to Healing119.id. It gives no diagnosis and
 * no automated counselling.
 */
export default function CrisisScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="Bantuan krisis" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.greeting}>
          <Text accessibilityRole="header" style={[Type.display, styles.greetingText]}>
            {'Kamu nggak\nsendirian.'}
          </Text>
          <Mascot name="hug" width={112} />
        </View>
        <Text style={Type.bodyLg}>
          Saat semuanya terasa terlalu berat, kamu boleh mencari dukungan. Ada orang yang siap
          mendengarkan.
        </Text>
        <InfoCard
          title="Ambil satu langkah kecil"
          body="Kalau bisa, hubungi orang yang kamu percaya dan minta ditemani."
        />
        <Button label="Hubungi Healing119.id" onPress={openHealing} />
        <Text style={Type.body}>
          Tombol akan membuka situs Healing119.id untuk melihat pilihan dukungan yang tersedia.
        </Text>
        <Button
          variant="outline"
          label="Kembali"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 24 },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  greetingText: { flex: 1 },
});
