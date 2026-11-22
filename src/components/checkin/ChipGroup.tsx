import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/checkin/Chip';

type Props = {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
};

/** Wrapping multi-select chips. */
export function ChipGroup({ options, selected, onChange }: Props) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <Chip
            key={option}
            label={option}
            selected={isSelected}
            onPress={() =>
              onChange(isSelected ? selected.filter((x) => x !== option) : [...selected, option])
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
