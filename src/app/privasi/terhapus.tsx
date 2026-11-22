import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Mascot } from '@/components/Mascot';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Type } from '@/constants/theme';

const toStart = () => router.replace('/');

export default function DataDeletedScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader title="Data terhapus" onBack={toStart} />
      <ScrollView contentContainerStyle={styles.content}>
        <Mascot name="shining" width={130} pop />
        <Text accessibilityRole="header" style={Type.title}>
          {'Datamu sudah\ndihapus.'}
        </Text>
        <Text style={Type.bodyLg}>Halaman baru selalu terbuka. Kamu bisa mulai lagi kapan pun siap.</Text>
        <Button label="Kembali ke awal" onPress={toStart} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
});
