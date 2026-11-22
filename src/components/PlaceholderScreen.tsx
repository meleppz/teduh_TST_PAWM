import { SafeAreaView } from 'react-native-safe-area-context';

import { StackHeader } from '@/components/ScreenHeader';
import { Palette } from '@/constants/theme';

/** Temporary body for screens that have no Figma design implemented yet. */
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.background }} edges={['top', 'bottom']}>
      <StackHeader title={title} />
    </SafeAreaView>
  );
}
