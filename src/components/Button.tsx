import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Palette, Radius, Raised, Type } from '@/constants/theme';

type Variant = 'primary' | 'outline' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress?: () => void;
  /**
   * primary: full-width yellow call to action.
   * outline: full-width outlined button.
   * secondary: compact filled blue button (used inside cards).
   * danger: full-width red button for destructive confirmations.
   */
  variant?: Variant;
  /** Filled state of an outline button, used for a chosen answer. */
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Every button is lifted: it is something you press. */
export function Button({ label, onPress, variant = 'primary', selected, disabled, style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        selected && styles.selected,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.label, labelStyles[variant], selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    ...Raised,
  },
  primary: {
    alignSelf: 'stretch',
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Palette.secondary,
  },
  outline: {
    alignSelf: 'stretch',
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: Palette.primary,
    backgroundColor: Palette.surface,
  },
  secondary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Palette.primary,
  },
  danger: {
    alignSelf: 'stretch',
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Palette.danger,
  },
  selected: { backgroundColor: Palette.primary },
  // A pressed button sinks back toward the page.
  pressed: { transform: [{ translateY: 2 }], shadowOpacity: 0.08, elevation: 1 },
  disabled: { opacity: 0.5 },
  label: { textAlign: 'center' },
  labelSelected: { color: Palette.onPrimary },
});

const labelStyles = StyleSheet.create({
  primary: { ...Type.bodyLgBold, lineHeight: undefined, color: Palette.onSecondary },
  outline: { ...Type.bodyLgBold, lineHeight: undefined, color: Palette.primary },
  secondary: { ...Type.body, color: Palette.onPrimarySoft },
  danger: { ...Type.bodyLgBold, lineHeight: undefined, color: Palette.onPrimarySoft },
});
