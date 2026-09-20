import { Button, ContextMenu, HStack, Image, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  backgroundOverlay,
  buttonStyle,
  cornerRadius,
  fixedSize,
  font,
  foregroundColor,
  frame,
  monospacedDigit,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { colors } from '@/ui/tokens';
import type { TranscriptSegment } from '../notes/types';
import { formatTime } from './model';

/** A passage owns its typography and actions; the surrounding scroll view owns following. */
export function TranscriptPassage({
  segment,
  live,
  largeText,
  selected,
  marked,
  onSeek,
  onBookmark,
}: {
  segment: TranscriptSegment;
  live: boolean;
  largeText: boolean;
  selected: boolean;
  marked: boolean;
  onSeek?: (timeMs: number) => void;
  onBookmark?: (segment: TranscriptSegment) => void;
}) {
  const timestamp = (
    <Text
      modifiers={[
        font({ textStyle: 'caption' }),
        monospacedDigit(),
        foregroundColor(selected ? colors.signal : colors.secondary),
      ]}
    >
      {formatTime(segment.startMs)}
    </Text>
  );
  const text = (
    <Text
      modifiers={[
        font({ textStyle: live ? 'title3' : 'body' }),
        fixedSize({ horizontal: false, vertical: true }),
      ]}
    >
      {segment.text}
    </Text>
  );
  if (live)
    return (
      <VStack alignment="leading" spacing={8} modifiers={[padding({ horizontal: 8 })]}>
        {largeText ? (
          <>
            {timestamp}
            {text}
          </>
        ) : (
          <HStack alignment="top" spacing={16}>
            <VStack alignment="leading" modifiers={[frame({ minWidth: 44, alignment: 'leading' })]}>
              {timestamp}
            </VStack>
            {text}
          </HStack>
        )}
      </VStack>
    );
  return (
    <ContextMenu>
      <ContextMenu.Trigger>
        <ZStack
          alignment="topTrailing"
          modifiers={[
            padding({ horizontal: selected ? 16 : 8, vertical: selected ? 12 : 0 }),
            ...(selected ? [backgroundOverlay({ color: colors.selection }), cornerRadius(12)] : []),
          ]}
        >
          <VStack
            alignment="leading"
            spacing={8}
            modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}
          >
            {timestamp}
            <Button
              onPress={() => onSeek?.(segment.startMs)}
              modifiers={[
                buttonStyle('plain'),
                accessibilityLabel(`Seek to ${formatTime(segment.startMs)}: ${segment.text}`),
              ]}
            >
              {text}
            </Button>
          </VStack>
          {onBookmark && (selected || marked) ? (
            <Button
              onPress={() => onBookmark(segment)}
              modifiers={[
                buttonStyle('plain'),
                accessibilityLabel(marked ? 'Remove bookmark' : 'Bookmark passage'),
              ]}
            >
              <Image
                systemName={marked ? 'bookmark.fill' : 'bookmark'}
                modifiers={[
                  font({ textStyle: 'body' }),
                  foregroundColor(colors.signal),
                  frame({ minWidth: 44, minHeight: 44, alignment: 'top' }),
                ]}
              />
            </Button>
          ) : null}
        </ZStack>
      </ContextMenu.Trigger>
      <ContextMenu.Items>
        {onBookmark ? (
          <Button
            label={marked ? 'Remove bookmark' : 'Bookmark passage'}
            systemImage={marked ? 'bookmark.slash' : 'bookmark'}
            onPress={() => onBookmark(segment)}
          />
        ) : null}
        {onSeek ? (
          <Button
            label="Go to this moment"
            systemImage="waveform"
            onPress={() => onSeek(segment.startMs)}
          />
        ) : null}
      </ContextMenu.Items>
    </ContextMenu>
  );
}
