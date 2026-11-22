import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';

/** The Teduh cloud mascot, exported from Figma. Sizes are the original artboards. */
const MASCOTS = {
  shining: { source: require('@/assets/mascot/shining.svg'), width: 208, height: 217 },
  hug: { source: require('@/assets/mascot/hug.svg'), width: 175, height: 165 },
  sad: { source: require('@/assets/mascot/sad.svg'), width: 208, height: 217 },
  confused: { source: require('@/assets/mascot/confused.svg'), width: 208, height: 217 },
  angry: { source: require('@/assets/mascot/angry.svg'), width: 176, height: 165 },
} as const;

export type MascotName = keyof typeof MASCOTS;

type Props = {
  name: MascotName;
  /** Rendered width; the height follows the artwork's proportions. */
  width?: number;
  /** Bounce a little whenever the expression changes. */
  pop?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Mascot({ name, width = 120, pop, style }: Props) {
  const art = MASCOTS[name];
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!pop) return;
    scale.setValue(0.86);
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }).start();
  }, [name, pop, scale]);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Image
        source={art.source}
        style={{ width, height: (width * art.height) / art.width }}
        contentFit="contain"
        accessible={false}
      />
    </Animated.View>
  );
}
