import Svg, { Circle } from 'react-native-svg';

import { Palette } from '@/constants/theme';

type Props = {
  value: number;
  max: number;
  /** Outer size; the Figma ring is 144 px wide with an 8 px stroke. */
  size?: number;
  stroke?: number;
  accessibilityLabel?: string;
};

/** Circular progress, starting at the top and running clockwise. */
export function ProgressRing({ value, max, size = 144, stroke = 8, accessibilityLabel }: Props) {
  const radius = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  return (
    <Svg
      width={size}
      height={size}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max, now: value }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={Palette.border}
        strokeWidth={stroke}
        fill="none"
      />
      {ratio > 0 ? (
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Palette.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * ratio} ${circumference}`}
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
          fill="none"
        />
      ) : null}
    </Svg>
  );
}
