import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { Palette, Radius, Type } from '@/constants/theme';

export type ChartPoint = {
  key: string;
  /** Horizontal position, 0 (left) to 1 (right). */
  t: number;
  value: number;
  /** Dot colour, for example the colour of the mood. Defaults to the brand blue. */
  color?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export type ChartLabel = { t: number; text: string };

type Props = {
  /** Height of the plot area (144 for the mood chart, 72 for WHO-5). */
  height: number;
  min: number;
  max: number;
  /** y of the `max` gridline and of the `min` gridline, in px from the top of the plot. */
  plotTop?: number;
  plotBottom: number;
  /** Gridlines, with an optional label drawn at the left. */
  grid: { value: number; label?: string }[];
  points: ChartPoint[];
  dotRadius?: number;
  /** Width of the tap target around each dot. */
  hitSize?: number;
  xLabels?: ChartLabel[];
};

// Geometry taken from the Figma chart (345 px wide): gridlines run 32 -> 329, data 40 -> 320.
const GRID_LEFT = 32;
const GRID_RIGHT_INSET = 16;
const DATA_LEFT = 40;
const DATA_RIGHT_INSET = 25;
const DEFAULT_WIDTH = 345;

/** Simple line chart with gridlines, tappable dots and an optional row of x labels. */
export function LineChart({
  height,
  min,
  max,
  plotTop = 12,
  plotBottom,
  grid,
  points,
  dotRadius = 4,
  hitSize = 48,
  xLabels = [],
}: Props) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const xOf = (t: number) => DATA_LEFT + t * (width - DATA_LEFT - DATA_RIGHT_INSET);
  const yOf = (value: number) => plotTop + ((max - value) / (max - min)) * (plotBottom - plotTop);

  const coords = points.map((p) => ({ ...p, x: xOf(p.t), y: yOf(p.value) }));
  const line = coords.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View onLayout={onLayout} style={styles.wrapper}>
      <View style={{ height }}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {grid.map((g) => (
            <Line
              key={g.value}
              x1={GRID_LEFT}
              x2={width - GRID_RIGHT_INSET}
              y1={yOf(g.value)}
              y2={yOf(g.value)}
              stroke={Palette.border}
              strokeWidth={1}
            />
          ))}
          {coords.length > 1 ? (
            <Polyline
              points={line}
              fill="none"
              stroke={Palette.primary}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}
          {coords.map((p) => (
            <Circle
              key={p.key}
              cx={p.x}
              cy={p.y}
              r={dotRadius + 1.5}
              fill={p.color ?? Palette.primary}
              stroke={Palette.surface}
              strokeWidth={2}
            />
          ))}
        </Svg>

        {grid.map((g) =>
          g.label ? (
            <Text key={g.value} style={[styles.yLabel, { top: yOf(g.value) - 4 }]}>
              {g.label}
            </Text>
          ) : null,
        )}

        {coords.map((p) =>
          p.onPress ? (
            <Pressable
              key={p.key}
              accessibilityRole="button"
              accessibilityLabel={p.accessibilityLabel}
              onPress={p.onPress}
              style={{
                position: 'absolute',
                left: p.x - hitSize / 2,
                top: p.y - 24,
                width: hitSize,
                height: 48,
              }}
            />
          ) : null,
        )}
      </View>

      {xLabels.length > 0 ? (
        <View style={styles.xRow}>
          {xLabels.map((label) => (
            <Text key={label.text} style={[styles.xLabel, { left: xOf(label.t) - 24 }]}>
              {label.text}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** White card that wraps a chart, with a small title. */
export function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'stretch', gap: 8 },
  card: {
    alignSelf: 'stretch',
    gap: 8,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    backgroundColor: Palette.surface,
  },
  title: { ...Type.bodyBold, paddingHorizontal: 16 },
  yLabel: { ...Type.caption, position: 'absolute', left: 8, width: 20 },
  xRow: { height: 18 },
  xLabel: { ...Type.caption, position: 'absolute', width: 48, textAlign: 'center' },
});
