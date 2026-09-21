import { Button, Image } from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  contentShape,
  shapes,
  font,
  buttonStyle,
  buttonBorderShape,
  controlSize,
  labelStyle,
  foregroundColor,
  frame,
} from '@expo/ui/swift-ui/modifiers';
import { colors } from '@/ui/tokens';
import type { PlaybackBindings } from './usePlayback';

export function PlaybackButton({
  title,
  playing,
  onToggle,
  size = 'large',
  plain = false,
  positionMs = 0,
  durationMs = Infinity,
}: Pick<PlaybackBindings, 'title' | 'playing' | 'onToggle'> & {
  size?: 'regular' | 'large';
  plain?: boolean;
  positionMs?: number;
  durationMs?: number;
}) {
  const ended = !playing && positionMs >= durationMs;
  const action = playing ? 'Pause' : ended ? 'Replay' : 'Play';
  return (
    <Button
      label={plain ? undefined : action}
      systemImage={
        plain ? undefined : playing ? 'pause.fill' : ended ? 'arrow.counterclockwise' : 'play.fill'
      }
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
    >
      {plain ? (
        <Image
          systemName={playing ? 'pause.fill' : ended ? 'arrow.counterclockwise' : 'play.fill'}
          modifiers={[
            font({ textStyle: 'body' }),
            frame({ minWidth: 44, minHeight: 44 }),
            contentShape(shapes.rectangle()),
          ]}
        />
      ) : undefined}
    </Button>
  );
}
