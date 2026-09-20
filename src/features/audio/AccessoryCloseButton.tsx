import { Button } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  buttonStyle,
  foregroundColor,
  frame,
  labelStyle,
} from '@expo/ui/swift-ui/modifiers';
import { colors } from '@/ui/tokens';

/** Dismissal is explicit; the caller decides whether confirmation is necessary. */
export function AccessoryCloseButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Button
      label={label}
      systemImage="xmark"
      onPress={onPress}
      modifiers={[
        buttonStyle('plain'),
        labelStyle('iconOnly'),
        foregroundColor(colors.secondary),
        frame({ minWidth: 44, minHeight: 44 }),
        accessibilityLabel(label),
      ]}
    />
  );
}
