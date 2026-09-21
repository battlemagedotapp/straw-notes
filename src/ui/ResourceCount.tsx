import { HStack, Image, Text } from '@expo/ui/swift-ui';
import {
  accessibilityElement,
  accessibilityLabel,
  fixedSize,
  font,
  foregroundColor,
} from '@expo/ui/swift-ui/modifiers';
import { colors } from './tokens';

/** Inline metadata suffix: separator, resource symbol, and count only when plural. */
export function ResourceCount({ resource, count }: { resource: 'audio' | 'notes'; count: number }) {
  if (count <= 0) return null;
  const spoken =
    resource === 'audio'
      ? `${count} audio ${count === 1 ? 'item' : 'items'} attached`
      : `Used in ${count} ${count === 1 ? 'note' : 'notes'}`;
  return (
    <HStack
      spacing={4}
      modifiers={[
        font({ textStyle: 'caption' }),
        foregroundColor(colors.secondary),
        fixedSize({ horizontal: true, vertical: false }),
        accessibilityElement('ignore'),
        accessibilityLabel(spoken),
      ]}
    >
      <Text>·</Text>
      <HStack spacing={3}>
        <Image
          systemName={resource === 'audio' ? 'waveform' : 'doc.text'}
          modifiers={[font({ textStyle: 'caption' })]}
        />
        {count > 1 ? <Text>{String(count)}</Text> : null}
      </HStack>
    </HStack>
  );
}
