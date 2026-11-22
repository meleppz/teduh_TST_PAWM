import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Radius, Raised, Tones, Type, type Tone } from '@/constants/theme';

type Props = {
  title: string;
  body: string;
  /** Soft fill that says what kind of card this is. */
  tone?: Tone;
  /** A fill that does not come from a tone, such as the colour of a mood. */
  fill?: string;
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Makes the whole card tappable. A tappable card is lifted and shows an arrow;
   * a card that only informs stays flat.
   */
  onPress?: () => void;
  /** Cuts the body after this many lines (used for note previews). */
  bodyLines?: number;
};

export function InfoCard({
  title,
  body,
  tone = 'blue',
  fill,
  actionLabel,
  onAction,
  onPress,
  bodyLines,
}: Props) {
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: fill ?? Tones[tone] },
        onPress && styles.lifted,
        pressed && styles.pressed,
      ]}>
      <Text style={styles.title}>{title}</Text>
      <Text numberOfLines={bodyLines} style={styles.body}>
        {body}
      </Text>
      {actionLabel ? <Button variant="secondary" label={actionLabel} onPress={onAction ?? onPress} /> : null}
      {onPress && !actionLabel ? (
        <View style={styles.arrow}>
          <Icon name="arrow-right" />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 22,
    borderRadius: Radius.lg,
  },
  lifted: { ...Raised },
  pressed: { transform: [{ translateY: 2 }], shadowOpacity: 0.08, elevation: 1 },
  title: { ...Type.subheading, alignSelf: 'stretch' },
  body: { ...Type.body, alignSelf: 'stretch' },
  arrow: { marginTop: -4 },
});
