import { Button, HStack, Text, VStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  contentShape,
  shapes,
  buttonStyle,
  font,
  foregroundColor,
  frame,
  lineLimit,
  monospacedDigit,
  padding,
  fixedSize,
} from '@expo/ui/swift-ui/modifiers';
import { Waveform } from '@/ui/Waveform';
import { colors } from '@/ui/tokens';
import { PlaybackButton } from './PlaybackButton';
import { formatTime } from './model';
import { playbackSamples } from './simulation';
import type { PlaybackBindings } from './usePlayback';

const accessorySamples = playbackSamples.slice(0, 8);

export function PlaybackAccessory({
  compact,
  onOpen,
  ...playback
}: PlaybackBindings & {
  compact: boolean;
  onOpen: () => void;
}) {
  const status = playback.playing
    ? 'Playing'
    : playback.positionMs >= playback.durationMs
      ? 'Finished'
      : 'Paused';
  return (
    <HStack spacing={0} modifiers={[frame({ maxWidth: Infinity })]}>
      <Button
        onPress={onOpen}
        modifiers={[
          buttonStyle('plain'),
          frame({ maxWidth: Infinity, minHeight: 44, alignment: 'leading' }),
          accessibilityLabel(
            `Open audio controls, ${playback.title}, ${status}, ${formatTime(playback.positionMs)}`,
          ),
        ]}
      >
        <HStack
          spacing={8}
          modifiers={[
            frame({ maxWidth: Infinity, minHeight: 44, alignment: 'leading' }),
            contentShape(shapes.rectangle()),
          ]}
        >
          <VStack modifiers={[frame({ width: compact ? 24 : 32 })]}>
            <Waveform
              samples={accessorySamples}
              height={20}
              progress={playback.positionMs / Math.max(1, playback.durationMs)}
            />
          </VStack>

          <Text modifiers={[font({ textStyle: 'subheadline', weight: 'semibold' }), lineLimit(1)]}>
            {playback.title}
          </Text>
        </HStack>
      </Button>
      {!compact ? (
        <Text
          modifiers={[
            font({ textStyle: 'subheadline' }),
            padding({ leading: 8 }),
            foregroundColor(colors.secondary),
            monospacedDigit(),
            lineLimit(1),
            fixedSize({ horizontal: true, vertical: false }),
          ]}
        >
          {formatTime(playback.positionMs)}
        </Text>
      ) : null}
      <PlaybackButton {...playback} size="regular" plain />
    </HStack>
  );
}
