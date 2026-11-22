import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { shouldSuggestProfessional } from '@/services/crisisService';
import { countActiveDays, getLatestEntryForDay, type MoodEntry } from '@/services/moodService';
import { isWho5Due } from '@/services/who5Service';
import { addDays, localDay } from '@/utils/date';

export type HomeData = {
  loading: boolean;
  todayEntry: MoodEntry | null;
  /** Days with a check-in during the last 7 days (today included). */
  activeDays: number;
  who5Due: boolean;
  showSupport: boolean;
};

const INITIAL: HomeData = {
  loading: true,
  todayEntry: null,
  activeDays: 0,
  who5Due: false,
  showSupport: false,
};

/** Loads everything Beranda needs; refreshes whenever the screen regains focus. */
export function useHomeData(): HomeData {
  const [data, setData] = useState<HomeData>(INITIAL);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const now = new Date();
          const [todayEntry, activeDays, who5Due, showSupport] = await Promise.all([
            getLatestEntryForDay(localDay(now)),
            countActiveDays(localDay(addDays(now, -6))),
            isWho5Due(now),
            shouldSuggestProfessional(now),
          ]);
          if (active) setData({ loading: false, todayEntry, activeDays, who5Due, showSupport });
        } catch (error) {
          console.warn('Gagal memuat data Beranda', error);
          if (active) setData({ ...INITIAL, loading: false });
        }
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  return data;
}
