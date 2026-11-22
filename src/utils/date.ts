const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day as `YYYY-MM-DD` (used to group check-ins by day). */
export function localDay(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** "Minggu, 22 November" */
export function formatDateId(date: Date): string {
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "19 November" */
export function formatDayMonth(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** "22 Nov" */
export function formatShortDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
}

/** "November 2026" */
export function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "16.20" */
export function formatTimeId(date: Date): string {
  return `${pad(date.getHours())}.${pad(date.getMinutes())}`;
}

/** "pagi" | "siang" | "sore" | "malam" */
export function partOfDay(date: Date): 'pagi' | 'siang' | 'sore' | 'malam' {
  const hour = date.getHours();
  if (hour < 11) return 'pagi';
  if (hour < 15) return 'siang';
  if (hour < 18) return 'sore';
  return 'malam';
}

/** The seven days (Monday to Sunday) of the week that contains `date`. */
export function weekDays(date: Date): Date[] {
  const sinceMonday = (date.getDay() + 6) % 7;
  const monday = addDays(date, -sinceMonday);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** "16–22 November 2026", or "29 Oktober–4 November 2026" when the week spans two months. */
export function formatWeekRange(days: Date[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()}–${last.getDate()} ${formatMonthYear(last)}`;
  }
  return `${first.getDate()} ${MONTHS[first.getMonth()]}–${last.getDate()} ${formatMonthYear(last)}`;
}

/** "Hari ini", "Kemarin" or "Sabtu, 21 November". */
export function formatRelativeDay(date: Date, now: Date = new Date()): string {
  const day = localDay(date);
  if (day === localDay(now)) return 'Hari ini';
  if (day === localDay(addDays(now, -1))) return 'Kemarin';
  return formatDateId(date);
}

/** "Minggu, 22 November 2026" */
export function formatFullDate(date: Date): string {
  return `${formatDateId(date)} ${date.getFullYear()}`;
}

/** "22 November 2026" */
export function formatDayMonthYear(date: Date): string {
  return `${formatDayMonth(date)} ${date.getFullYear()}`;
}

/** Parses a `YYYY-MM-DD` local day. */
export function parseDay(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

/** "9–22 November", or "28 Oktober–22 November" across two months. */
export function formatDayRange(from: Date, to: Date): string {
  if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
    return `${from.getDate()}–${formatDayMonth(to)}`;
  }
  return `${formatDayMonth(from)}–${formatDayMonth(to)}`;
}
