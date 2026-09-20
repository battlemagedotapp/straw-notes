import { colors } from '@/ui/tokens';
import { Label, Text, VStack } from '@expo/ui/swift-ui';
import {
  accessibilityElement,
  fixedSize,
  font,
  foregroundColor,
} from '@expo/ui/swift-ui/modifiers';

export function Feedback({
  title,
  message,
  error = false,
}: {
  title: string;
  message?: string;
  error?: boolean;
}) {
  return (
    <VStack alignment="leading" spacing={8} modifiers={[accessibilityElement('combine')]}>
      <Label title={title} systemImage={error ? 'exclamationmark.circle' : 'checkmark.circle'} />
      {message ? (
        <Text
          modifiers={[
            font({ textStyle: 'subheadline' }),
            foregroundColor(colors.secondary),
            fixedSize({ horizontal: false, vertical: true }),
          ]}
        >
          {message}
        </Text>
      ) : null}
    </VStack>
  );
}
