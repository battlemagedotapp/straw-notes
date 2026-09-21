import { PlatformColor } from 'react-native';

// Only custom content needs tokens; native controls keep their system defaults.
export const colors = {
  primary: PlatformColor('label'),
  background: PlatformColor('systemBackground'),
  grouped: PlatformColor('systemGroupedBackground'),
  surface: PlatformColor('secondarySystemGroupedBackground'),
  attachment: PlatformColor('secondarySystemBackground'),
  secondary: PlatformColor('secondaryLabel'),
  selection: PlatformColor('tertiarySystemFill'),
  signal: PlatformColor('systemBlue'),
  recording: PlatformColor('systemRed'),
  destructive: PlatformColor('systemRed'),
  inactiveSignal: PlatformColor('tertiaryLabel'),
};
