/** The five WHO-5 items (Indonesian wording used in the app). */
export const WHO5_QUESTIONS = [
  'Saya merasa ceria dan bersemangat.',
  'Saya merasa tenang dan santai.',
  'Saya merasa aktif dan bertenaga.',
  'Saya bangun tidur dengan perasaan segar dan sudah beristirahat.',
  'Keseharian saya terisi dengan hal-hal yang menarik bagi saya.',
] as const;

/** Answer scale, highest first (as in the design). */
export const WHO5_OPTIONS = [
  { value: 5, label: 'Sepanjang waktu' },
  { value: 4, label: 'Hampir sepanjang waktu' },
  { value: 3, label: 'Lebih dari separuh waktu' },
  { value: 2, label: 'Kurang dari separuh waktu' },
  { value: 1, label: 'Sesekali' },
  { value: 0, label: 'Tidak pernah' },
] as const;
