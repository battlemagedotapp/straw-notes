import { Button, HStack, Image, Text, VStack } from '@expo/ui/swift-ui';
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
import { type Capture, captureStatus, formatTime } from './model';
import { recordingSamples } from './simulation';

export function CaptureAccessory({
  capture,
  compact,
  reduceMotion,
  onOpen,
  onToggle,
}: {
  capture: Capture;
  compact: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
  onToggle: () => void;
}) {
  const recording = capture.status === 'recording';
  const status = captureStatus(capture);
  return (
    <HStack spacing={0} modifiers={[frame({ maxWidth: Infinity })]}>
      <Button
        onPress={onOpen}
        modifiers={[
          buttonStyle('plain'),
          frame({ maxWidth: Infinity, minHeight: 44, alignment: 'leading' }),
          accessibilityLabel(`Open recorder, ${status}, ${formatTime(capture.elapsedMs)}`),
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
              samples={recordingSamples(capture.elapsedMs, recording && !reduceMotion).slice(0, 8)}
              height={20}
              live
              paused={!recording}
              animate={recording && !reduceMotion}
            />
          </VStack>
          <Text
            modifiers={[
              font({ textStyle: 'subheadline', weight: 'semibold' }),
              foregroundColor(colors.primary),
              lineLimit(1),
            ]}
          >
            {status}
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
          {formatTime(capture.elapsedMs)}
        </Text>
      ) : null}
      <Button
        onPress={onToggle}
        modifiers={[
          accessibilityLabel(recording ? 'Pause recording' : 'Resume recording'),
          buttonStyle('plain'),
          frame({ minWidth: 44, minHeight: 44 }),
          foregroundColor(colors.primary),
        ]}
      >
        <Image
          systemName={recording ? 'pause.fill' : 'play.fill'}
          modifiers={[
            font({ textStyle: 'body' }),
            frame({ minWidth: 44, minHeight: 44 }),
            contentShape(shapes.rectangle()),
          ]}
        />
      </Button>
    </HStack>
  );
}
