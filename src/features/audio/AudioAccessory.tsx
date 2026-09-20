import { AccessoryCloseButton } from './AccessoryCloseButton';
import { Button, HStack, Text, VStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  buttonStyle,
  font,
  foregroundColor,
  frame,
  lineLimit,
  monospacedDigit,
} from '@expo/ui/swift-ui/modifiers';
import { Waveform } from '@/ui/Waveform';
import { colors } from '@/ui/tokens';
import { PlaybackButton } from './PlaybackButton';
import { formatTime } from './model';
import { playbackSamples } from './simulation';
import type { PlaybackControls } from './usePlayback';

export function AudioAccessory({
  compact,
  largeText,
  onOpen,
  onClose,
  ...playback
}: PlaybackControls & {
  compact: boolean;
  largeText: boolean;
  onOpen: () => void;
  onClose?: () => void;
}) {
  const wave = (
    <VStack modifiers={[frame({ width: compact ? 28 : 52 })]}>
      <Waveform
        samples={playbackSamples}
        height={24}
        progress={playback.positionMs / Math.max(1, playback.durationMs)}
      />
    </VStack>
  );
  return (
    <HStack spacing={compact ? 0 : 8}>
      <Button
        onPress={onOpen}
        modifiers={[buttonStyle('plain'), accessibilityLabel(`Open transcript, ${playback.title}`)]}
      >
        <VStack
          alignment="leading"
          spacing={2}
          modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}
        >
          <Text modifiers={[font({ textStyle: 'subheadline', weight: 'semibold' }), lineLimit(1)]}>
            {compact
              ? playback.playing
                ? 'Playing'
                : playback.positionMs >= playback.durationMs
                  ? 'Finished'
                  : 'Paused'
              : playback.title}
          </Text>
          <Text
            modifiers={[
              font({ textStyle: 'caption' }),
              foregroundColor(colors.secondary),
              monospacedDigit(),
              lineLimit(1),
            ]}
          >
            {compact
              ? formatTime(playback.positionMs)
              : `${playback.playing ? 'Playing' : playback.positionMs >= playback.durationMs ? 'Finished' : 'Paused'} · ${formatTime(playback.positionMs)}`}
          </Text>
        </VStack>
      </Button>
      {!compact && !largeText ? wave : null}
      <PlaybackButton {...playback} size="regular" plain={compact} />
      {onClose ? <AccessoryCloseButton label="Close player" onPress={onClose} /> : null}
    </HStack>
  );
}
