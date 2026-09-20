import { Button, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  backgroundOverlay,
  buttonStyle,
  controlSize,
  fixedSize,
  buttonBorderShape,
  labelStyle,
  cornerRadius,
  font,
  foregroundColor,
  monospacedDigit,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { useAccessibility } from '@/ui/useAccessibility';
import { colors } from '@/ui/tokens';
import { recordingSamples } from './simulation';
import { Waveform } from '@/ui/Waveform';
import type { Capture } from './model';
import { formatTime } from './model';

export function RecordingPanel({
  capture,
  onMark,
  onToggle,
  onFinish,
  reduceMotion,
}: {
  capture: Capture;
  onMark: () => void;
  onToggle: () => void;
  onFinish: () => void;
  reduceMotion: boolean;
}) {
  const { largeText } = useAccessibility();
  const Controls = largeText ? VStack : HStack;
  const recording = capture.status === 'recording';
  return (
    <VStack
      alignment="leading"
      spacing={16}
      modifiers={[
        padding({ all: 20 }),
        backgroundOverlay({ color: colors.surface }),
        cornerRadius(20),
      ]}
    >
      <Text
        modifiers={[
          font({ textStyle: 'subheadline' }),
          foregroundColor(recording ? colors.recording : colors.secondary),
        ]}
      >
        {recording
          ? 'Recording'
          : capture.status === 'interrupted'
            ? 'Recording interrupted'
            : 'Paused'}
      </Text>
      <Text modifiers={[font({ textStyle: 'largeTitle' }), monospacedDigit()]}>
        {formatTime(capture.elapsedMs)}
      </Text>
      <Waveform
        live
        paused={!recording}
        samples={recordingSamples(capture.elapsedMs, recording && !reduceMotion)}
      />
      <Controls spacing={8}>
        <Button
          label="Mark moment"
          systemImage="bookmark"
          onPress={onMark}
          modifiers={[
            buttonStyle('bordered'),
            controlSize('large'),
            buttonBorderShape('circle'),
            labelStyle('iconOnly'),
            accessibilityLabel('Mark moment'),
          ]}
        />
        {!largeText ? <Spacer /> : null}
        <Button
          label={recording ? 'Pause' : 'Resume'}
          systemImage={recording ? 'pause.fill' : 'play.fill'}
          onPress={onToggle}
          modifiers={[
            buttonStyle('bordered'),
            controlSize('large'),
            font({ textStyle: 'subheadline' }),
            fixedSize({ horizontal: true, vertical: false }),
          ]}
        />
        <Button
          label="Finish"
          systemImage="stop.fill"
          onPress={onFinish}
          modifiers={[
            buttonStyle('borderedProminent'),
            controlSize('large'),
            font({ textStyle: 'subheadline' }),
            fixedSize({ horizontal: true, vertical: false }),
          ]}
        />
      </Controls>
    </VStack>
  );
}
