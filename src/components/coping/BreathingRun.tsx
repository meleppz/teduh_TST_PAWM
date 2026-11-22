import { Image } from 'expo-image';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Radius, Tones, Type } from '@/constants/theme';
import type { BreathingPhase, CopingTechnique } from '@/data/copingSeed';

const CIRCLE = require('@/assets/icons/breath-circle.svg');

/** The circle is 144 px at rest and 176 px when full (Figma). */
const CIRCLE_SIZE = 144;
const FULL_SCALE = 176 / 144;

const PHASE_COPY: Record<BreathingPhase['key'], { title: string; caption: string }> = {
  inhale: { title: 'Tarik napas', caption: 'Tarik napas perlahan lewat hidung.' },
  hold: { title: 'Tahan sebentar', caption: 'Tahan senyamannya. Nggak perlu dipaksakan.' },
  exhale: { title: 'Embuskan pelan', caption: 'Lepaskan napas perlahan lewat mulut.' },
};

type State = { round: number; phase: number; remaining: number; finished: boolean };

type Breathing = NonNullable<CopingTechnique['breathing']>;

function reducer(breathing: Breathing) {
  return (state: State): State => {
    if (state.finished) return state;
    if (state.remaining > 1) return { ...state, remaining: state.remaining - 1 };
    const nextPhase = state.phase + 1;
    if (nextPhase < breathing.phases.length) {
      return { ...state, phase: nextPhase, remaining: breathing.phases[nextPhase].seconds };
    }
    const nextRound = state.round + 1;
    if (nextRound < breathing.rounds) {
      return { round: nextRound, phase: 0, remaining: breathing.phases[0].seconds, finished: false };
    }
    return { ...state, remaining: 0, finished: true };
  };
}

type Props = {
  technique: CopingTechnique & { breathing: Breathing };
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onFinish: () => void;
};

/** Timed 4-7-8 breathing guide: a circle that grows, holds and shrinks (Figma "Sesi" frames). */
export function BreathingRun({ technique, paused, onPause, onResume, onCancel, onFinish }: Props) {
  const { breathing } = technique;
  const [state, tick] = useReducer(reducer(breathing), {
    round: 0,
    phase: 0,
    remaining: breathing.phases[0].seconds,
    finished: false,
  });
  const [scale] = useState(() => new Animated.Value(1));
  const remainingRef = useRef(state.remaining);

  useEffect(() => {
    remainingRef.current = state.remaining;
  });

  // One tick per second while running.
  useEffect(() => {
    if (paused || state.finished) return;
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [paused, state.finished]);

  useEffect(() => {
    if (state.finished) onFinish();
  }, [state.finished, onFinish]);

  // Grow while inhaling, stay while holding, shrink while exhaling.
  const phase = breathing.phases[state.phase];
  useEffect(() => {
    if (paused || state.finished) {
      scale.stopAnimation();
      return;
    }
    if (phase.key === 'hold') {
      scale.setValue(FULL_SCALE);
      return;
    }
    Animated.timing(scale, {
      toValue: phase.key === 'inhale' ? FULL_SCALE : 1,
      duration: remainingRef.current * 1000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
    return () => scale.stopAnimation();
  }, [state.round, state.phase, paused, state.finished, phase.key, scale]);

  const copy = PHASE_COPY[phase.key];

  return (
    <>
      <Text style={Type.bodyBold}>
        {paused ? 'Sesi dijeda' : `${technique.name} · putaran ${state.round + 1} dari ${breathing.rounds}`}
      </Text>
      <Text accessibilityRole="header" style={Type.title}>
        {paused ? 'Ambil waktumu' : copy.title}
      </Text>

      <View style={styles.card}>
        <View style={styles.circleBox}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Image source={CIRCLE} style={styles.circle} contentFit="contain" accessible={false} />
          </Animated.View>
        </View>
        <Text
          accessibilityLiveRegion={paused ? 'polite' : 'none'}
          style={[Type.display, styles.count]}>
          {paused ? 'Timer berhenti' : `${state.remaining} detik`}
        </Text>
      </View>

      <Text style={Type.bodyLg}>{paused ? 'Lanjut saat kamu siap.' : copy.caption}</Text>

      {paused ? (
        <Button label="Lanjutkan sesi" onPress={onResume} />
      ) : (
        <Button variant="outline" label="Jeda" onPress={onPause} />
      )}
      <Button variant="outline" label="Batalkan sesi" onPress={onCancel} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 32,
    borderRadius: Radius.lg,
    backgroundColor: Tones.blue,
  },
  // Fixed box so the card does not jump while the circle grows and shrinks.
  circleBox: { width: 176, height: 176, alignItems: 'center', justifyContent: 'center' },
  circle: { width: CIRCLE_SIZE, height: CIRCLE_SIZE },
  count: { textAlign: 'center' },
});
