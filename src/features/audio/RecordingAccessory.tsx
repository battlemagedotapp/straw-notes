import { AccessoryCloseButton } from './AccessoryCloseButton';
import { Button, HStack, Text, VStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  buttonStyle,
  buttonBorderShape,
  controlSize,
  labelStyle,
  font,
  foregroundColor,
  frame,
  lineLimit,
  monospacedDigit,
} from '@expo/ui/swift-ui/modifiers';
import { Waveform } from '@/ui/Waveform';
import { colors } from '@/ui/tokens';
import { type Capture, formatTime } from './model';
import { recordingSamples } from './simulation';

export function RecordingAccessory({
  capture,
  compact,
  largeText,
  reduceMotion,
  onOpen,
  onDiscard,
  onToggle,
}: {
  capture: Capture;
  compact: boolean;
  largeText: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
  onDiscard?: () => void;
  onToggle: () => void;
}) {
  const recording = capture.status === 'recording';
  const status = recording
    ? 'Recording'
    : capture.status === 'interrupted'
      ? 'Interrupted'
      : 'Paused';
  const wave = (
    <VStack modifiers={[frame({ width: compact ? 28 : 52 })]}>
      <Waveform
        samples={recordingSamples(capture.elapsedMs, recording && !reduceMotion)}
        height={24}
        live
        paused={!recording}
      />
    </VStack>
  );
  return (
    <HStack spacing={compact ? 0 : 8}>
      <Button
        onPress={onOpen}
        modifiers={[
          buttonStyle('plain'),
          accessibilityLabel(`Open recording, ${status}, ${formatTime(capture.elapsedMs)}`),
        ]}
      >
        <VStack
          alignment="leading"
          spacing={2}
          modifiers={[frame({ maxWidth: Infinity, alignment: 'leading' })]}
        >
          <Text modifiers={[font({ textStyle: 'subheadline', weight: 'semibold' }), lineLimit(1)]}>
            {compact ? status : capture.title}
          </Text>
          <Text
            modifiers={[
              font({ textStyle: 'caption' }),
              foregroundColor(recording && !compact ? colors.recording : colors.secondary),
              monospacedDigit(),
              lineLimit(1),
            ]}
          >
            {compact
              ? formatTime(capture.elapsedMs)
              : `${status} · ${formatTime(capture.elapsedMs)}`}
          </Text>
        </VStack>
      </Button>
      {!compact && !largeText ? wave : null}
      <Button
        label={recording ? 'Pause recording' : 'Resume recording'}
        systemImage={recording ? 'pause.fill' : 'play.fill'}
        onPress={onToggle}
        modifiers={[
          labelStyle('iconOnly'),
          buttonStyle(compact ? 'plain' : 'bordered'),
          buttonBorderShape('circle'),
          controlSize('regular'),
          frame({ minWidth: 44, minHeight: 44 }),
          foregroundColor(colors.primary),
        ]}
      />
      {onDiscard ? <AccessoryCloseButton label="Discard recording" onPress={onDiscard} /> : null}
    </HStack>
  );
}
