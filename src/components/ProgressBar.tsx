import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/theme';

type Props = {
  value: number;
  max: number;
  accessibilityLabel?: string;
};

/** Thin rounded progress bar (WHO-5 steps, WHO-5 score, waiting time). */
export function ProgressBar({ value, max, accessibilityLabel }: Props) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max, now: value }}
      style={styles.track}>
      <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Palette.border,
  },
  fill: { height: 8, borderRadius: 8, backgroundColor: Palette.primary },
});
