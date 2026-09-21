import { HStack, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundColor, lineLimit } from '@expo/ui/swift-ui/modifiers';
import type { Recording } from '../notes/types';
import { formatTime } from '../audio/model';
import { colors } from '@/ui/tokens';
import { ResourceCount } from '@/ui/ResourceCount';

export function RecordingRow({ item, noteCount = 0 }: { item: Recording; noteCount?: number }) {
  return (
    <VStack alignment="leading" spacing={4}>
      <Text modifiers={[font({ textStyle: 'headline' }), lineLimit(2)]}>{item.title}</Text>
      <HStack spacing={4}>
        <Text
          modifiers={[
            font({ textStyle: 'caption' }),
            foregroundColor(colors.secondary),
            lineLimit(1),
          ]}
        >
          {formatTime(item.durationMs)} · {new Date(item.createdAt).toLocaleDateString()}
          {item.origin === 'import' ? ' · Imported' : ''}
        </Text>
        <ResourceCount resource="notes" count={noteCount} />
      </HStack>
    </VStack>
  );
}
