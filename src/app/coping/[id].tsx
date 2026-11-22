import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { MoodScale } from '@/components/checkin/MoodScale';
import { BreathingRun } from '@/components/coping/BreathingRun';
import { InfoCard } from '@/components/InfoCard';
import { Mascot } from '@/components/Mascot';
import { StackHeader } from '@/components/ScreenHeader';
import { Palette, Radius, Tones, Type } from '@/constants/theme';
import { findTechnique, type CopingTechnique } from '@/data/copingSeed';
import { MOODS, type MoodValue } from '@/data/labels';
import { recordCopingSession } from '@/services/copingService';

type Stage = 'before' | 'run' | 'paused' | 'after' | 'summary' | 'done';

const moodLabel = (value: number) => MOODS.find((m) => m.value === value)?.label ?? String(value);

export default function CopingSessionScreen() {
  const { id, emotion } = useLocalSearchParams<{ id: string; emotion?: string }>();
  const technique = findTechnique(id);
  const [stage, setStage] = useState<Stage>('before');
  const [before, setBefore] = useState<MoodValue | null>(null);
  const [after, setAfter] = useState<MoodValue | null>(null);
  const [saving, setSaving] = useState(false);

  const toCoping = useCallback(() => router.replace('/coping'), []);

  /** Leaving mid-session keeps a record that does not count towards effectiveness (UC-08). */
  const cancel = useCallback(async () => {
    if (technique && before !== null) {
      try {
        await recordCopingSession({
          techniqueId: technique.id,
          emotion: emotion ?? null,
          moodBefore: before,
          moodAfter: null,
          completed: false,
        });
      } catch (error) {
        console.warn('Gagal mencatat sesi yang dibatalkan', error);
      }
    }
    toCoping();
  }, [technique, before, emotion, toCoping]);

  const onFinishRun = useCallback(() => setStage('after'), []);
  const running = stage === 'run' || stage === 'paused';

  const saveAndSummarise = async () => {
    if (!technique || before === null || after === null || saving) return;
    setSaving(true);
    try {
      await recordCopingSession({
        techniqueId: technique.id,
        emotion: emotion ?? null,
        moodBefore: before,
        moodAfter: after,
        completed: true,
      });
      setStage('summary');
    } catch (error) {
      console.warn('Gagal menyimpan sesi', error);
      Alert.alert('Belum tersimpan', 'Sesi kamu belum bisa disimpan. Coba lagi sebentar lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (!technique || technique.kind !== 'guided') {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <StackHeader title="Sesi" />
        <View style={styles.content}>
          <Text style={Type.bodyLg}>Latihan ini tidak ditemukan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StackHeader
        title="Sesi"
        onBack={stage === 'done' ? toCoping : running ? cancel : undefined}
      />

      {stage === 'before' ? (
        <MoodStep
          heading="Sebelum kita mulai..."
          value={before}
          onChange={setBefore}
          actionLabel={technique.startLabel ?? 'Mulai latihan'}
          onAction={() => setStage('run')}
        />
      ) : null}

      {running ? (
        <ScrollView contentContainerStyle={styles.content}>
          {technique.breathing ? (
            <BreathingRun
              technique={{ ...technique, breathing: technique.breathing }}
              paused={stage === 'paused'}
              onPause={() => setStage('paused')}
              onResume={() => setStage('run')}
              onCancel={cancel}
              onFinish={onFinishRun}
            />
          ) : (
            <StepsRun technique={technique} onCancel={cancel} onFinish={onFinishRun} />
          )}
        </ScrollView>
      ) : null}

      {stage === 'after' ? (
        <MoodStep
          heading="Setelah jeda ini..."
          value={after}
          onChange={setAfter}
          actionLabel="Lihat ringkasan"
          onAction={saveAndSummarise}
          busy={saving}
        />
      ) : null}

      {stage === 'summary' && before !== null && after !== null ? (
        <Summary
          technique={technique}
          before={before}
          after={after}
          onDone={() => setStage('done')}
        />
      ) : null}

      {stage === 'done' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Mascot name="hug" width={150} pop />
          <Text style={Type.display}>{'Satu jeda\nuntuk dirimu.'}</Text>
          <Text style={Type.bodyLg}>
            Sesi kamu sudah tersimpan. Kamu bisa kembali kapan pun butuh ruang bernapas.
          </Text>
          <Button label="Kembali ke Coping" onPress={toCoping} />
          <Button variant="outline" label="Ke Beranda" onPress={() => router.replace('/')} />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

type MoodStepProps = {
  heading: string;
  value: MoodValue | null;
  onChange: (value: MoodValue) => void;
  actionLabel: string;
  onAction: () => void;
  busy?: boolean;
};

/** "Gimana mood kamu sekarang?" before and after a session. */
function MoodStep({ heading, value, onChange, actionLabel, onAction, busy }: MoodStepProps) {
  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={Type.title}>
          {heading}
        </Text>
        <Text style={Type.bodyLg}>Gimana mood kamu sekarang?</Text>
        <MoodScale value={value} onChange={onChange} />
        <InfoCard
          tone="yellow"
          title="Nggak harus langsung lebih baik"
          body="Cukup perhatikan apa yang terasa. Semua jawaban boleh."
        />
      </ScrollView>
      <View style={styles.actionBar}>
        <Button label={actionLabel} onPress={onAction} disabled={value === null || busy} />
      </View>
    </>
  );
}

function Summary({
  technique,
  before,
  after,
  onDone,
}: {
  technique: CopingTechnique;
  before: MoodValue;
  after: MoodValue;
  onDone: () => void;
}) {
  const delta = after - before;
  const points = Math.abs(delta);
  const headline =
    delta > 0 ? `Mood-mu naik\n${points} poin` : delta < 0 ? `Mood-mu turun\n${points} poin` : 'Mood-mu\ntetap sama';
  const closing =
    delta < 0
      ? 'Nggak apa-apa kalau belum terasa lebih ringan. Kamu sudah memberi ruang buat diri sendiri.'
      : 'Makasih sudah memberi ruang buat diri sendiri. Perubahan kecil juga berarti.';

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Mascot name={delta >= 0 ? 'shining' : 'hug'} width={120} pop />
        <Text accessibilityRole="header" style={Type.display}>
          {headline}
        </Text>
        <InfoCard
          tone="yellowSoft"
          title={`Dari ${before} menjadi ${after}`}
          body={`Sebelum: ${moodLabel(before)} · Sesudah: ${moodLabel(after)}\nLatihan ${technique.name.toLowerCase()} · ${technique.minutes} menit`}
        />
        <Text style={Type.bodyLg}>{closing}</Text>
      </ScrollView>
      <View style={styles.actionBar}>
        <Button label="Selesai" onPress={onDone} />
      </View>
    </>
  );
}

/** Untimed, one-step-at-a-time version for techniques without a breathing guide. */
function StepsRun({
  technique,
  onCancel,
  onFinish,
}: {
  technique: CopingTechnique;
  onCancel: () => void;
  onFinish: () => void;
}) {
  const steps = technique.steps ?? [];
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const last = index >= steps.length - 1;

  if (!step) {
    return <Button label="Lanjut" onPress={onFinish} />;
  }

  return (
    <>
      <Text style={Type.bodyBold}>{`${technique.name} · langkah ${index + 1} dari ${steps.length}`}</Text>
      <Text accessibilityRole="header" style={Type.title}>
        {step.title}
      </Text>
      <View style={styles.stepCard}>
        <Text style={[Type.subheading, styles.stepText]}>{step.text}</Text>
      </View>
      <Button
        label={last ? 'Selesai latihan' : 'Lanjut'}
        onPress={() => (last ? onFinish() : setIndex(index + 1))}
      />
      <Button variant="outline" label="Batalkan sesi" onPress={onCancel} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.background },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  actionBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: Palette.background,
  },
  stepCard: {
    alignSelf: 'stretch',
    paddingHorizontal: 16,
    paddingVertical: 32,
    borderRadius: Radius.lg,
    backgroundColor: Tones.yellowSoft,
  },
  stepText: { textAlign: 'center' },
});
