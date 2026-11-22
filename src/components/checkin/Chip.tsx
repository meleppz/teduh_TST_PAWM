import { Pressable, StyleSheet, Text } from 'react-native';

import { Palette, Radius, Raised, Type } from '@/constants/theme';

type Props = {
  label: string;
  selected: boolean;
  /** Omit for a read-only chip, which is flat because it cannot be pressed. */
  onPress?: () => void;
  /** Stretch to share the row equally, used by the 1-5 energy buttons. */
  flex?: boolean;
};

export function Chip({ label, selected, onPress, flex }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        onPress && styles.lifted,
        selected && styles.selected,
        pressed && styles.pressed,
        flex && styles.flex,
      ]}>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Palette.primary,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
  },
  lifted: { ...Raised },
  selected: { backgroundColor: Palette.primary },
  pressed: { transform: [{ translateY: 2 }], shadowOpacity: 0.08, elevation: 1 },
  flex: { flex: 1, paddingHorizontal: 0 },
  label: { ...Type.bodyLg, lineHeight: undefined, color: Palette.primary },
  labelSelected: { color: Palette.onPrimary },
});
