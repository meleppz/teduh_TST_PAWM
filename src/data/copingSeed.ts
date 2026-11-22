/** Emotions offered on the Coping tab (a subset of the check-in emotions). */
export const COPING_EMOTIONS = ['Cemas', 'Sedih', 'Marah', 'Lelah', 'Kesepian', 'Stres'] as const;
export type CopingEmotion = (typeof COPING_EMOTIONS)[number];

export type BreathingPhase = { key: 'inhale' | 'hold' | 'exhale'; seconds: number };

export type CopingStep = { title: string; text: string };

export type CopingTechnique = {
  id: string;
  name: string;
  minutes: number;
  description: string;
  /** "guided" opens the step-by-step session; "journal" opens the private journal. */
  kind: 'guided' | 'journal';
  /** Label of the button that starts the session. */
  startLabel?: string;
  /** Timed breathing guide (the Figma designs cover this one). */
  breathing?: { rounds: number; phases: BreathingPhase[] };
  /** Untimed steps, shown one at a time. Not designed in Figma yet. */
  steps?: CopingStep[];
};

/** Default order of the catalog (FR-25, FR-28). Becomes admin-managed once there is a backend. */
export const COPING_TECHNIQUES: CopingTechnique[] = [
  {
    id: 'napas-478',
    name: 'Napas 4–7–8',
    minutes: 2,
    description: 'Memberi ruang untuk melambat. Ikuti senyamannya.',
    kind: 'guided',
    startLabel: 'Mulai napas 4–7–8',
    breathing: {
      rounds: 4,
      phases: [
        { key: 'inhale', seconds: 4 },
        { key: 'hold', seconds: 7 },
        { key: 'exhale', seconds: 8 },
      ],
    },
  },
  {
    id: 'kembali-ke-sekitar',
    name: 'Kembali ke sekitar',
    minutes: 3,
    description: 'Perhatikan hal-hal yang bisa kamu lihat dan rasakan.',
    kind: 'guided',
    startLabel: 'Mulai latihan',
    steps: [
      { title: 'Lihat', text: 'Sebutkan 5 hal yang bisa kamu lihat di sekitarmu.' },
      { title: 'Sentuh', text: 'Rasakan 4 hal yang bisa kamu sentuh. Tekstur kain, meja, atau udara.' },
      { title: 'Dengar', text: 'Dengarkan 3 suara yang ada di sekitarmu.' },
      { title: 'Cium', text: 'Cari 2 aroma yang bisa kamu cium.' },
      { title: 'Rasakan', text: 'Perhatikan 1 rasa di mulutmu. Lalu tarik napas pelan.' },
    ],
  },
  {
    id: 'tulis-lalu-lepaskan',
    name: 'Tulis, lalu lepaskan',
    minutes: 5,
    description: 'Tuang isi kepala ke catatan pribadi.',
    kind: 'journal',
  },
];

export function findTechnique(id: string | undefined): CopingTechnique | undefined {
  return COPING_TECHNIQUES.find((t) => t.id === id);
}
