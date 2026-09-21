import { useWindowDimensions } from 'react-native';
import { Button, ContextMenu, HStack, Image, Text, VStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  padding,
  backgroundOverlay,
  contentShape,
  shapes,
  lineLimit,
  fixedSize,
  font,
  foregroundColor,
  frame,
  monospacedDigit,
} from '@expo/ui/swift-ui/modifiers';
import { colors } from '@/ui/tokens';
import type { TranscriptSegment } from '../notes/types';
import { formatTime } from './model';

type PassageProps = { segment: TranscriptSegment; selected: boolean; marked: boolean };

/** Shared typography for the reading surface and native context-menu preview. */
function PassageContent({
  segment,
  selected,
  marked,
  preview = false,
}: PassageProps & { preview?: boolean }) {
  return (
    <VStack
      alignment="leading"
      spacing={8}
      modifiers={[
        frame({ maxWidth: Infinity, alignment: 'leading' }),
        contentShape(shapes.rectangle()),
      ]}
    >
      <HStack spacing={8} modifiers={[font({ textStyle: 'caption' })]}>
        <Text
          modifiers={[
            monospacedDigit(),
            foregroundColor(selected ? colors.signal : colors.secondary),
          ]}
        >
          {formatTime(segment.startMs)}
        </Text>
        {marked ? (
          <Image
            systemName="bookmark.fill"
            modifiers={[
              font({ textStyle: 'caption' }),
              foregroundColor(colors.signal),
              accessibilityLabel('Marked moment'),
            ]}
          />
        ) : null}
      </HStack>
      <Text
        modifiers={[
          font({ textStyle: 'body', weight: selected ? 'medium' : 'regular' }),
          ...(preview ? [lineLimit(8)] : [fixedSize({ horizontal: false, vertical: true })]),
          frame({ maxWidth: Infinity, alignment: 'leading' }),
        ]}
      >
        {segment.text}
      </Text>
    </VStack>
  );
}

export function TranscriptPassage({
  segment,
  selected,
  marked,
  onSeek,
  onToggleMoment,
}: PassageProps & {
  onSeek?: (timeMs: number) => void;
  onToggleMoment?: () => void;
}) {
  const { width } = useWindowDimensions();
  const passage = <PassageContent segment={segment} selected={selected} marked={marked} />;
  if (!onSeek && !onToggleMoment) return passage;
  return (
    <ContextMenu>
      <ContextMenu.Trigger>{passage}</ContextMenu.Trigger>
      <ContextMenu.Preview>
        <VStack
          modifiers={[
            padding({ all: 16 }),
            frame({ width: Math.min(width - 48, 400) }),
            backgroundOverlay({ color: colors.background }),
          ]}
        >
          <PassageContent segment={segment} selected={selected} marked={marked} preview />
        </VStack>
      </ContextMenu.Preview>
      <ContextMenu.Items>
        {onToggleMoment ? (
          <Button
            label={marked ? 'Remove moment' : 'Mark moment'}
            systemImage={marked ? 'bookmark.slash' : 'bookmark'}
            onPress={onToggleMoment}
          />
        ) : null}
        {onSeek ? (
          <Button
            label="Seek to this passage"
            systemImage="play"
            onPress={() => onSeek(segment.startMs)}
          />
        ) : null}
      </ContextMenu.Items>
    </ContextMenu>
  );
}
