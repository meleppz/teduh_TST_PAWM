import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  getDailyAverages,
  getRecentEntries,
  type MoodEntry,
} from '@/services/moodService';
import { listAssessments, type Assessment } from '@/services/who5Service';
import { addDays, localDay } from '@/utils/date';

export type HistoryData = {
  loading: boolean;
  /** Latest two check-ins, newest first. */
  recent: MoodEntry[];
  /** Average mood per local day (`YYYY-MM-DD`). Covers at least the current week and month. */
  averages: Record<string, number>;
  /** WHO-5 results, oldest first. */
  assessments: Assessment[];
};

const INITIAL: HistoryData = { loading: true, recent: [], averages: {}, assessments: [] };

/** Loads what the Riwayat tab needs; refreshes whenever the tab regains focus. */
export function useHistoryData(): HistoryData {
  const [data, setData] = useState<HistoryData>(INITIAL);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          // 37 days always reaches back to the start of both the current week and month.
          const fromDay = localDay(addDays(new Date(), -37));
          const [recent, averageRows, assessments] = await Promise.all([
            getRecentEntries(2),
            getDailyAverages(fromDay),
            listAssessments(6),
          ]);
          const averages = Object.fromEntries(averageRows.map((r) => [r.day, r.average]));
          if (active) setData({ loading: false, recent, averages, assessments });
        } catch (error) {
          console.warn('Gagal memuat riwayat', error);
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
