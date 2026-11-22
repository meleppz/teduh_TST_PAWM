import { Figtree_400Regular, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Palette } from '@/constants/theme';
import { configureNotifications } from '@/services/reminderService';

SplashScreen.preventAutoHideAsync();
void configureNotifications();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Body text
    Figtree_400Regular,
    Figtree_600SemiBold,
    // Headings
    QanelasSoft_SemiBold: require('@/assets/fonts/QanelasSoft-SemiBold.otf'),
    QanelasSoft_Bold: require('@/assets/fonts/QanelasSoft-Bold.otf'),
    QanelasSoft_ExtraBold: require('@/assets/fonts/QanelasSoft-ExtraBold.otf'),
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Palette.background },
        }}
      />
    </>
  );
}
