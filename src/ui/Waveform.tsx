import { RNHostView, VStack } from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';
import { View, type ColorValue } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { colors } from './tokens';

const AnimatedLine = Animated.createAnimatedComponent(Line);

/** Interpolate provider-driven samples; never create another audio clock. */
function SignalBar({
  value,
  x,
  stroke,
  animate,
}: {
  value: number;
  x: number;
  stroke: ColorValue;
  animate: boolean;
}) {
  const amplitude = useSharedValue(value);
  useEffect(() => {
    amplitude.value = animate ? withTiming(value, { duration: 450 }) : value;
  }, [value, animate, amplitude]);
  const animatedProps = useAnimatedProps(() => ({
    y1: 32 - Math.max(0, Math.min(1, amplitude.value)) * 29,
    y2: 32 + Math.max(0, Math.min(1, amplitude.value)) * 29,
  }));
  return (
    <AnimatedLine
      x1={x}
      x2={x}
      animatedProps={animatedProps}
      stroke={stroke}
      strokeWidth={2.5}
      strokeLinecap="round"
    />
  );
}

/** Parent-proposed width, explicit signal height. No intrinsic/percentage measurement cycle. */
export function Waveform({
  samples,
  progress = 0,
  live = false,
  paused = false,
  height = 64,
  animate = false,
}: {
  samples: readonly number[];
  progress?: number;
  live?: boolean;
  paused?: boolean;
  height?: number;
  animate?: boolean;
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
              <SignalBar
                key={i}
                x={i * 6 + 3}
                value={value}
                animate={animate}
                stroke={
                  paused
                    ? colors.inactiveSignal
                    : live
                      ? colors.recording
                      : i / bars.length < progress
                        ? colors.signal
                        : colors.inactiveSignal
                }
              />
            ))}
          </Svg>
        </View>
      </RNHostView>
    </VStack>
  );
}
