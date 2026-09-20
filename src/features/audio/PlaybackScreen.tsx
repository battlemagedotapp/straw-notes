import {
  Button,
  ContentUnavailableView,
  Form,
  Host,
  HStack,
  Image,
  Spacer,
  Picker,
  Section,
  Slider,
  Text,
} from '@expo/ui/swift-ui';
import {
  tag,
  font,
  monospacedDigit,
  accessibilityLabel,
  accessibilityValue,
  disabled,
  frame,
  buttonStyle,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useNotes, useAudio, useAppDispatch } from '../notes/NotesProvider';
import type { AudioAttachment } from '../notes/types';
import { PlaybackButton } from './PlaybackButton';
import { usePlayback } from './usePlayback';
import { formatTime } from './model';

function Controls({ item }: { item: AudioAttachment }) {
  const controls = usePlayback(item);
  const { playbackRate } = useAudio();
  const dispatch = useAppDispatch();
  return (
    <Form>
      <Section title={item.title}>
        <Text modifiers={[font({ textStyle: 'headline' }), monospacedDigit()]}>
          {formatTime(controls.positionMs)} / {formatTime(item.durationMs)}
        </Text>
        <Slider
          value={controls.positionMs}
          min={0}
          max={Math.max(1, controls.durationMs)}
          onValueChange={controls.onSeek}
          modifiers={[
            accessibilityLabel('Playback position'),
            accessibilityValue(
              `${formatTime(controls.positionMs)} of ${formatTime(controls.durationMs)}`,
            ),
            disabled(controls.seekingDisabled),
          ]}
        />
        <HStack modifiers={[buttonStyle('borderless')]}>
          <Spacer />
          <Button
            modifiers={[accessibilityLabel('Back 15 seconds')]}
            onPress={() => controls.onSeek(controls.positionMs - 15000)}
          >
            <Image
              systemName="gobackward.15"
              modifiers={[frame({ minWidth: 44, minHeight: 44 })]}
            />
          </Button>
          <Spacer />
          <PlaybackButton {...controls} />
          <Spacer />
          <Button
            modifiers={[accessibilityLabel('Forward 15 seconds')]}
            onPress={() => controls.onSeek(controls.positionMs + 15000)}
          >
            <Image systemName="goforward.15" modifiers={[frame({ minWidth: 44, minHeight: 44 })]} />
          </Button>
          <Spacer />
        </HStack>
      </Section>
      <Section>
        <Picker
          label="Playback speed"
          selection={playbackRate}
          onSelectionChange={(rate) =>
            dispatch({ type: 'audio', action: { type: 'rate', rate: Number(rate) } })
          }
        >
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <Text key={rate} modifiers={[tag(rate)]}>
              {rate}×
            </Text>
          ))}
        </Picker>
      </Section>
    </Form>
  );
}
export function PlaybackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useNotes()
    .notes.flatMap((n) => n.audio)
    .find((a) => a.id === id);
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ title: 'Playback' }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Close</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        {item ? (
          <Controls item={item} />
        ) : (
          <ContentUnavailableView title="Audio unavailable" systemImage="waveform" />
        )}
      </Host>
    </>
  );
}
