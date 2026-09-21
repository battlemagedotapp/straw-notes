import type { ReactNode } from 'react';
import { HStack, Slider, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  accessibilityValue,
  disabled,
  font,
  foregroundColor,
  frame,
  monospacedDigit,
  opacity,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { Waveform } from '@/ui/Waveform';
import { colors } from '@/ui/tokens';
import { formatTime } from './model';

/** One parent-proposed signal width; SwiftUI owns the slider and transport geometry. */
export function AudioReel({
  samples,
  positionMs,
  durationMs,
  live = false,
  paused = false,
  animate = false,
  onSeek,
  seekingDisabled = false,
  control,
  status,
}: {
  samples: readonly number[];
  positionMs: number;
  durationMs?: number;
  live?: boolean;
  paused?: boolean;
  animate?: boolean;
  onSeek?: (value: number) => void;
  seekingDisabled?: boolean;
  control: ReactNode;
  status?: ReactNode;
}) {
  return (
    <HStack alignment="top" spacing={20} modifiers={[frame({ maxWidth: Infinity })]}>
      <VStack spacing={8} modifiers={[frame({ maxWidth: Infinity })]}>
        <ZStack modifiers={[frame({ height: 56 })]}>
          <VStack modifiers={[opacity(live ? 1 : 0.35)]}>
            <Waveform
              samples={samples}
              live={live}
              paused={paused}
              animate={animate}
              height={56}
              progress={durationMs ? positionMs / durationMs : 0}
            />
          </VStack>
          {onSeek ? (
            <Slider
              value={positionMs}
              min={0}
              max={Math.max(1, durationMs ?? 0)}
              onValueChange={onSeek}
              modifiers={[
                accessibilityLabel('Playback position'),
                accessibilityValue(`${formatTime(positionMs)} of ${formatTime(durationMs ?? 0)}`),
                disabled(seekingDisabled),
              ]}
            />
          ) : null}
        </ZStack>
        <HStack modifiers={[font({ textStyle: 'caption' }), monospacedDigit()]}>
          <Text>{formatTime(positionMs)}</Text>
          <Spacer />
          {live ? (
            status
          ) : (
            <Text modifiers={[foregroundColor(colors.secondary)]}>
              {`−${formatTime(Math.max(0, (durationMs ?? 0) - positionMs))}`}
            </Text>
          )}
        </HStack>
      </VStack>
      <VStack modifiers={[padding({ top: 4 })]}>{control}</VStack>
    </HStack>
  );
}
