import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { MoodColors, Radius, Raised, Type } from '@/constants/theme';
import { MOODS, type MoodValue } from '@/data/labels';

type Props = {
  value: MoodValue | null;
  /** Omit for the read-only variant, which is flat. */
  onChange?: (value: MoodValue) => void;
  /** Fill the chosen tile with its mood colour. Defaults to true when the scale is interactive. */
  highlight?: boolean;
};

/** The five mood tiles. Each mood has its own colour, so the scale reads at a glance. */
export function MoodScale({ value, onChange, highlight = !!onChange }: Props) {
  return (
    <View style={styles.row} accessibilityRole={onChange ? 'radiogroup' : undefined}>
      {MOODS.map((mood) => {
        const selected = value === mood.value;
        const colors = MoodColors[mood.value];
        return (
          <Pressable
            key={mood.value}
            disabled={!onChange}
            accessibilityRole={onChange ? 'radio' : undefined}
            accessibilityLabel={`${mood.value}, ${mood.label}`}
            accessibilityState={{ selected }}
            onPress={() => onChange?.(mood.value)}
            style={({ pressed }) => [
              styles.tile,
              { backgroundColor: colors.tint },
              !!onChange && styles.lifted,
              selected && highlight && { backgroundColor: colors.solid, borderColor: colors.strong },
              pressed && styles.pressed,
            ]}>
            {mood.icon ? (
              <Icon name={mood.icon} />
            ) : (
              <Text style={Type.bodyLgBold}>{mood.value}</Text>
            )}
            <Text style={selected ? Type.captionBold : Type.caption}>{mood.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, alignSelf: 'stretch' },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lifted: { ...Raised },
  pressed: { transform: [{ translateY: 2 }], shadowOpacity: 0.08, elevation: 1 },
});
