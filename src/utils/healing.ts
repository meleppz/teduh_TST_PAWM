import { Alert, Linking } from 'react-native';

// Healing119.id is the professional-help destination named in the requirements (FR-29, UC-10).
// The exact URL is an assumption: confirm it before release.
export const HEALING_URL = 'https://healing119.id';

/** Opens Healing119.id in the browser. */
export async function openHealing(): Promise<void> {
  try {
    await Linking.openURL(HEALING_URL);
  } catch (error) {
    console.warn('Gagal membuka Healing119.id', error);
    Alert.alert('Belum bisa dibuka', 'Coba buka healing119.id lewat peramban di ponselmu.');
  }
}
