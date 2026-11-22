import { Image } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

/** Icons exported from the Figma "Icons" page (vuesax / linear). */
const ICONS = {
  home: require('@/assets/icons/home.svg'),
  chart: require('@/assets/icons/chart.svg'),
  heart: require('@/assets/icons/heart.svg'),
  profile: require('@/assets/icons/profile.svg'),
  'emoji-sad': require('@/assets/icons/emoji-sad.svg'),
  'emoji-normal': require('@/assets/icons/emoji-normal.svg'),
  happyemoji: require('@/assets/icons/happyemoji.svg'),
  'emoji-happy': require('@/assets/icons/emoji-happy.svg'),
  'tick-circle': require('@/assets/icons/tick-circle.svg'),
  'arrow-left': require('@/assets/icons/arrow-left.svg'),
  trash: require('@/assets/icons/trash.svg'),
  'note-text': require('@/assets/icons/note-text.svg'),
  lock: require('@/assets/icons/lock.svg'),
  add: require('@/assets/icons/add.svg'),
  'magic-star': require('@/assets/icons/magic-star.svg'),
  calendar: require('@/assets/icons/calendar.svg'),
  clock: require('@/assets/icons/clock.svg'),
  notification: require('@/assets/icons/notification.svg'),
  'toggle-on': require('@/assets/icons/toggle-on.svg'),
  'toggle-off': require('@/assets/icons/toggle-off.svg'),
  settings: require('@/assets/icons/settings.svg'),
  graph: require('@/assets/icons/graph.svg'),
  note: require('@/assets/icons/note.svg'),
  'arrow-right': require('@/assets/icons/arrow-right.svg'),
} as const;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function Icon({ name, size = 24, style }: Props) {
  return (
    <Image
      source={ICONS[name]}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      accessible={false}
    />
  );
}
