import { Button, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  buttonStyle,
  controlSize,
  buttonBorderShape,
  labelStyle,
  font,
  foregroundColor,
  disabled,
} from '@expo/ui/swift-ui/modifiers';
import { colors } from '@/ui/tokens';
import { recordingSamples } from './simulation';
import { captureStatus, type Capture } from './model';
import { AudioReel } from './AudioReel';

export function CaptureControls({
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
  const recording = capture.status === 'recording';
  return (
    <VStack alignment="leading" spacing={20}>
      <AudioReel
        live
        status={
          <Text
            modifiers={[
              font({ textStyle: 'caption' }),
              foregroundColor(recording ? colors.recording : colors.secondary),
            ]}
          >
            {captureStatus(capture)}
          </Text>
        }
        samples={recordingSamples(capture.elapsedMs, recording && !reduceMotion)}
        positionMs={capture.elapsedMs}
        paused={!recording}
        animate={recording && !reduceMotion}
        control={
          <Button
            label={recording ? 'Pause' : 'Resume'}
            systemImage={recording ? 'pause.fill' : 'play.fill'}
            onPress={onToggle}
            modifiers={[
              buttonStyle('glass'),
              controlSize('large'),
              buttonBorderShape('circle'),
              labelStyle('iconOnly'),
              accessibilityLabel(recording ? 'Pause recording' : 'Resume recording'),
            ]}
          />
        }
      />
      <HStack spacing={12}>
        <Button
          label="Mark moment"
          systemImage="bookmark"
          onPress={onMark}
          modifiers={[buttonStyle('borderless')]}
        />
        <Spacer />
        <Button
          label={capture.saveError ? 'Try again' : 'Finish'}
          systemImage={capture.saveError ? 'arrow.clockwise' : 'checkmark'}
          onPress={onFinish}
          modifiers={[disabled(capture.elapsedMs <= 0), buttonStyle('borderless')]}
        />
      </HStack>
    </VStack>
  );
}
