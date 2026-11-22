import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Type } from '@/constants/theme';

/** Large title used at the top of the four main tabs. */
export function TabHeader({ title }: { title: string }) {
  return (
    <View style={styles.tabHeader}>
      <Text accessibilityRole="header" style={Type.title}>
        {title}
      </Text>
    </View>
  );
}

type StackHeaderProps = {
  title: string;
  /** Replaces the default "go back" behaviour (for example to cancel a session). */
  onBack?: () => void;
  /** Something on the right, such as a "+" button or a decorative icon. */
  right?: ReactNode;
};

/** Back arrow + title used on pushed screens such as Check-in. */
export function StackHeader({ title, onBack, right }: StackHeaderProps) {
  return (
    <View style={styles.stackHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali"
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        style={styles.back}>
        <Icon name="arrow-left" />
      </Pressable>
      <Text accessibilityRole="header" style={[Type.subheading, styles.title]}>
        {title}
      </Text>
      {right}
    </View>
  );
}

/** 48 px tappable icon for the right side of a StackHeader. */
export function HeaderAction({
  icon,
  label,
  onPress,
}: {
  icon: 'add';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.action}>
      <Icon name={icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabHeader: { height: 64, paddingHorizontal: 24, paddingTop: 8 },
  stackHeader: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    gap: 8,
  },
  title: { flex: 1 },
  back: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  action: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
