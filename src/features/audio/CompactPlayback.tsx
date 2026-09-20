import { Button, HStack, Text, VStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  backgroundOverlay,
  buttonStyle,
  cornerRadius,
  font,
  foregroundColor,
  monospacedDigit,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { Waveform } from '@/ui/Waveform';
import { playbackSamples } from './simulation';
import { colors } from '@/ui/tokens';
import { PlaybackButton } from './PlaybackButton';
import type { PlaybackControls } from './usePlayback';
import { formatTime } from './model';

export function CompactPlayback(props: PlaybackControls & { onControls: () => void }) {
  return (
    <VStack
      alignment="leading"
      spacing={8}
      modifiers={[
        padding({ vertical: 12, horizontal: 16 }),
        backgroundOverlay({ color: colors.attachment }),
        cornerRadius(16),
      ]}
    >
      <HStack spacing={8}>
        <Button
          onPress={props.onControls}
          modifiers={[buttonStyle('plain'), accessibilityLabel(`Seek in ${props.title}`)]}
        >
          <VStack alignment="leading" spacing={8}>
            <Text modifiers={[font({ textStyle: 'subheadline', weight: 'semibold' })]}>
              {props.title}
            </Text>

            <Waveform
              samples={playbackSamples}
              height={20}
              progress={props.positionMs / Math.max(1, props.durationMs)}
            />

            <Text
              modifiers={[
                font({ textStyle: 'caption2' }),
                foregroundColor(colors.secondary),
                monospacedDigit(),
              ]}
            >
              {formatTime(props.positionMs)} / {formatTime(props.durationMs)}
            </Text>
          </VStack>
        </Button>
        <PlaybackButton {...props} />
      </HStack>
    </VStack>
  );
}
