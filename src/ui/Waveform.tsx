import { RNHostView, VStack } from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';
import { View } from 'react-native';
import { useMemo, useState } from 'react';
import Svg, { Line } from 'react-native-svg';
import { colors } from './tokens';

/** Parent-proposed width, explicit signal height. No intrinsic/percentage measurement cycle. */
export function Waveform({
  samples,
  progress = 0,
  live = false,
  paused = false,
  height = 64,
}: {
  samples: readonly number[];
  progress?: number;
  live?: boolean;
  paused?: boolean;
  height?: number;
}) {
  const [width, setWidth] = useState(0);
  // Only the signal density changes; the SwiftUI parent still owns layout.
  const bars = useMemo(() => {
    const count = Math.min(samples.length, Math.max(1, Math.floor(width / 6)));
    return Array.from({ length: count }, (_, i) => {
      const start = Math.floor((i * samples.length) / count);
      const end = Math.max(start + 1, Math.floor(((i + 1) * samples.length) / count));
      const slice = samples.slice(start, end);
      return slice.reduce((sum, sample) => sum + sample, 0) / slice.length;
    });
  }, [samples, width]);
  return (
    <VStack modifiers={[frame({ height })]}>
      <RNHostView>
        <View
          style={{ flex: 1 }}
          onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
          accessible={false}
          accessibilityElementsHidden
        >
          <Svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${Math.max(1, bars.length) * 6} 64`}
            preserveAspectRatio="none"
          >
            {bars.map((value, i) => (
              <Line
                key={i}
                x1={i * 6 + 3}
                x2={i * 6 + 3}
                y1={32 - Math.max(0, Math.min(1, value)) * 29}
                y2={32 + Math.max(0, Math.min(1, value)) * 29}
                stroke={
                  paused
                    ? colors.inactiveSignal
                    : live
                      ? colors.recording
                      : i / bars.length < progress
                        ? colors.signal
                        : colors.inactiveSignal
                }
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            ))}
          </Svg>
        </View>
      </RNHostView>
    </VStack>
  );
}
