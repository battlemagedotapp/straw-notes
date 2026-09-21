import { useAudioNavigation } from '@/features/audio/useAudioNavigation';
import type { Recording } from '../notes/types';
import { usePlayback } from './usePlayback';
import { Button, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  buttonStyle,
  backgroundOverlay,
  cornerRadius,
  font,
  foregroundColor,
  monospacedDigit,
  frame,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { Waveform } from '@/ui/Waveform';
import { useAccessibility } from '@/ui/useAccessibility';
import { colors } from '@/ui/tokens';
import { formatTime } from './model';
import { PlaybackButton } from './PlaybackButton';
import { playbackSamples } from './simulation';
import type { PlaybackBindings } from './usePlayback';

function AttachmentContent(props: PlaybackBindings & { onOpen: () => void }) {
  const { largeText } = useAccessibility();
  const title = (
    <Text modifiers={[font({ textStyle: 'subheadline', weight: 'semibold' })]}>{props.title}</Text>
  );
  const duration = (
    <Text modifiers={[font({ textStyle: 'caption' }), foregroundColor(colors.secondary)]}>
      {formatTime(props.durationMs)}
    </Text>
  );
  const elapsed = (
    <Text
      modifiers={[
        font({ textStyle: 'caption' }),
        foregroundColor(colors.secondary),
        monospacedDigit(),
      ]}
    >
      {formatTime(props.positionMs)}
    </Text>
  );
  const transcript = (
    <Button
      label="View transcript"
      systemImage="text.alignleft"
      onPress={props.onOpen}
      modifiers={[font({ textStyle: 'footnote' }), frame({ minHeight: 44 })]}
    />
  );
  return (
    <VStack
      alignment="leading"
      spacing={16}
      modifiers={[
        padding({ all: 16 }),
        backgroundOverlay({ color: colors.attachment }),
        cornerRadius(16),
      ]}
    >
      {largeText ? (
        <VStack alignment="leading" spacing={8}>
          {title}
          {duration}
        </VStack>
      ) : (
        <HStack spacing={8}>
          {title}
          <Spacer />
          {duration}
        </HStack>
      )}
      <HStack alignment="top" spacing={16}>
        <PlaybackButton {...props} />
        <VStack alignment="leading" spacing={8}>
          <Button
            onPress={props.onOpen}
            modifiers={[
              buttonStyle('plain'),
              frame({ minHeight: 44 }),
              accessibilityLabel('Seek in audio'),
            ]}
          >
            <Waveform
              samples={playbackSamples}
              height={40}
              progress={props.positionMs / Math.max(1, props.durationMs)}
            />
          </Button>
          {!largeText ? (
            <HStack>
              {elapsed}
              <Spacer />
              {transcript}
            </HStack>
          ) : null}
        </VStack>
      </HStack>
      {largeText ? (
        <VStack alignment="leading" spacing={8}>
          {elapsed}
          {transcript}
        </VStack>
      ) : null}
    </VStack>
  );
}

/** Note placement controller; visual compositions have no navigation or session ownership. */
export function AudioAttachment({ item }: { item: Recording }) {
  const playback = usePlayback(item);
  const audioNavigation = useAudioNavigation();
  return <AttachmentContent {...playback} onOpen={() => audioNavigation.openRecording(item.id)} />;
}
