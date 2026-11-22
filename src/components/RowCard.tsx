import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Palette, Radius, Raised, Tones, Type, type Tone } from '@/constants/theme';

type Props = {
  icon: IconName;
  title: string;
  subtitle: string;
  /** Colour of the bubble behind the icon. */
  tone?: Tone;
  /** Icon at the right edge: a chevron, or a toggle glyph. */
  trailing?: IconName;
  onPress?: () => void;
  /** Use "switch" with `checked` for the reminder toggles. */
  role?: 'button' | 'switch';
  checked?: boolean;
};

/** A list row: coloured icon bubble, title, a line of detail and an optional trailing icon. */
export function RowCard({
  icon,
  title,
  subtitle,
  tone = 'blue',
  trailing,
  onPress,
  role = 'button',
  checked,
}: Props) {
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={role}
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityState={role === 'switch' ? { checked } : undefined}
      onPress={onPress}
      style={({ pressed }) => [styles.card, onPress && styles.lifted, pressed && styles.pressed]}>
      <View style={[styles.bubble, { backgroundColor: Tones[tone] }]}>
        <Icon name={icon} />
      </View>
      <View style={styles.text}>
        <Text style={Type.bodyLgBold}>{title}</Text>
        <Text style={Type.body}>{subtitle}</Text>
      </View>
      {trailing ? <Icon name={trailing} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: Radius.lg,
    backgroundColor: Palette.surface,
  },
  lifted: { ...Raised },
  pressed: { transform: [{ translateY: 2 }], shadowOpacity: 0.08, elevation: 1 },
  bubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
});
