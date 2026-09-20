import { Button } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  buttonStyle,
  buttonBorderShape,
  controlSize,
  labelStyle,
  foregroundColor,
  frame,
} from '@expo/ui/swift-ui/modifiers';
import { colors } from '@/ui/tokens';
import type { PlaybackControls } from './usePlayback';

export function PlaybackButton({
  title,
  playing,
  onToggle,
  size = 'large',
  plain = false,
  positionMs = 0,
  durationMs = Infinity,
}: Pick<PlaybackControls, 'title' | 'playing' | 'onToggle'> & {
  size?: 'regular' | 'large';
  plain?: boolean;
  positionMs?: number;
  durationMs?: number;
}) {
  const ended = !playing && positionMs >= durationMs;
  const action = playing ? 'Pause' : ended ? 'Replay' : 'Play';
  return (
    <Button
      label={action}
      systemImage={playing ? 'pause.fill' : ended ? 'arrow.counterclockwise' : 'play.fill'}
      onPress={onToggle}
      modifiers={[
        buttonStyle(plain ? 'plain' : 'glass'),
        buttonBorderShape('circle'),
        controlSize(size),
        frame({ minWidth: 44, minHeight: 44 }),
        labelStyle('iconOnly'),
        foregroundColor(colors.primary),
        accessibilityLabel(`${action} ${title}`),
      ]}
    />
  );
}
