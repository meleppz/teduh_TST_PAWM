import type { Tabs } from 'expo-router';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Icon, type IconName } from '@/components/Icon';
import { Palette, Radius, Tones, Type } from '@/constants/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Beranda', icon: 'home' },
  riwayat: { label: 'Riwayat', icon: 'chart' },
  coping: { label: 'Coping', icon: 'heart' },
  profil: { label: 'Profil', icon: 'profile' },
};

/** Crisis-help button (FR-29) stacked above the main navigation. */
function HelpBar() {
  return (
    <View style={styles.help}>
      <Button
        variant="outline"
        label="Butuh bantuan?"
        onPress={() => router.push('/krisis')}
        style={styles.helpButton}
      />
    </View>
  );
}

export function TabBar({ state, emitter, navigateToTab }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View>
      <HelpBar />
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              style={[styles.item, focused && styles.itemActive]}>
              <Icon name={tab.icon} />
              <Text style={focused ? Type.captionBold : Type.caption}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  help: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: Palette.background,
  },
  helpButton: { alignSelf: 'auto', width: 160 },
  bar: {
    flexDirection: 'row',
    gap: 3,
    paddingTop: 7,
    paddingHorizontal: 11,
    backgroundColor: Palette.surface,
    borderTopWidth: 1,
    borderColor: Palette.border,
  },
  item: {
    flex: 1,
    height: 64,
    alignItems: 'center',
    paddingTop: 8,
    gap: 4,
    borderRadius: Radius.md,
  },
  itemActive: { backgroundColor: Tones.blue },
});
