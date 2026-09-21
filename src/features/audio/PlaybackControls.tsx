import { Button, HStack, Menu, Spacer, VStack } from '@expo/ui/swift-ui';
import { accessibilityLabel, buttonStyle, labelStyle, disabled } from '@expo/ui/swift-ui/modifiers';
import { useAudio, useAppDispatch } from '../notes/NotesProvider';
import { PlaybackButton } from './PlaybackButton';
import type { PlaybackBindings } from './usePlayback';
import { AudioReel } from './AudioReel';
import { playbackSamples } from './simulation';

export function PlaybackControls({ controls }: { controls: PlaybackBindings }) {
  const { playbackRate } = useAudio();
  const dispatch = useAppDispatch();
  return (
    <VStack alignment="leading" spacing={20}>
      <AudioReel
        samples={playbackSamples}
        positionMs={controls.positionMs}
        durationMs={controls.durationMs}
        onSeek={controls.onSeek}
        seekingDisabled={controls.seekingDisabled}
        control={<PlaybackButton {...controls} />}
      />
      <HStack spacing={24} modifiers={[buttonStyle('borderless')]}>
        <Button
          label="Back 15 seconds"
          systemImage="gobackward.15"
          onPress={() => controls.onSeek(controls.positionMs - 15000)}
          modifiers={[
            labelStyle('iconOnly'),
            accessibilityLabel('Back 15 seconds'),
            disabled(controls.seekingDisabled),
          ]}
        />
        <Button
          label="Forward 15 seconds"
          systemImage="goforward.15"
          onPress={() => controls.onSeek(controls.positionMs + 15000)}
          modifiers={[
            labelStyle('iconOnly'),
            accessibilityLabel('Forward 15 seconds'),
            disabled(controls.seekingDisabled),
          ]}
        />
        <Spacer />
        <Menu label={`${playbackRate}×`} modifiers={[accessibilityLabel('Playback speed')]}>
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <Button
              key={rate}
              label={`${rate}×`}
              systemImage={rate === playbackRate ? 'checkmark' : undefined}
              onPress={() => dispatch({ type: 'audio', action: { type: 'rate', rate } })}
            />
          ))}
        </Menu>
      </HStack>
    </VStack>
  );
}
