import { Button, Host, List, Section, Text } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { useRouter } from 'expo-router';
import { createSeedNotes, folders, transcript } from '@/fixtures/notes';
import { CompactPlayback } from '@/features/audio/CompactPlayback';
import { usePlayback } from '@/features/audio/usePlayback';
import { AudioAttachment } from '@/features/audio/AudioAttachment';
import { RecordingPanel } from '@/features/audio/RecordingPanel';
import { useAppDispatch, useSaveFailureEnabled } from '@/features/notes/NotesProvider';
import { Feedback } from '@/ui/Feedback';

export function ScenariosScreen() {
  const dispatch = useAppDispatch();
  const failure = useSaveFailureEnabled();
  const router = useRouter();
  const reset = (empty: boolean) => {
    dispatch({ type: 'reset', folders, notes: empty ? [] : createSeedNotes() });
    router.dismissAll();
    router.replace('/(tabs)/notes');
  };
  const capture = (state: 'recording' | 'paused' | 'interrupted' | 'finished') => {
    dispatch({ type: 'reset', folders, notes: createSeedNotes() });
    dispatch({
      type: 'audio',
      action: { type: 'start', id: 'scenario-capture', title: 'Morning walk idea' },
    });
    dispatch({ type: 'audio', action: { type: 'tick', deltaMs: 32000, segments: transcript } });
    if (state === 'paused') dispatch({ type: 'audio', action: { type: 'toggleCapture' } });
    if (state === 'interrupted') dispatch({ type: 'audio', action: { type: 'interrupt' } });
    if (state === 'finished') {
      dispatch({ type: 'audio', action: { type: 'finish' } });
      dispatch({ type: 'failNextSave' });
      router.push('/destination');
    } else router.push('/capture');
  };
  const sample = createSeedNotes().flatMap((n) => n.audio)[0]!;
  const playback = usePlayback(sample);
  return (
    <Host style={{ flex: 1 }}>
      <List modifiers={[listStyle('insetGrouped')]}>
        <Section
          title="Session fixtures"
          footer={
            <Text>
              All audio is simulated. Reloading resets every change. Scenarios replace the current
              demo session.
            </Text>
          }
        >
          <Button label="Populated library" onPress={() => reset(false)} />
          <Button
            label="Long library"
            onPress={() => {
              const notes = createSeedNotes();
              dispatch({
                type: 'reset',
                folders,
                notes: [
                  ...notes,
                  ...Array.from({ length: 8 }, (_, index) => ({
                    ...notes[2]!,
                    id: `long-${index}`,
                    title: [
                      'Autumn trip',
                      'Books to return',
                      'Saturday market',
                      'Dinner ideas',
                      'A quiet afternoon',
                      'Weekend plans',
                      'Places to visit',
                      'Thoughts for tomorrow',
                    ][index]!,
                    pinned: false,
                    audio: [],
                  })),
                ],
              });
              router.dismissAll();
              router.replace('/(tabs)/notes');
            }}
          />
          <Button
            label="Pending captures with playback"
            onPress={() => {
              dispatch({ type: 'reset', folders, notes: createSeedNotes() });
              for (const id of ['First recording', 'Second recording']) {
                dispatch({ type: 'audio', action: { type: 'start', id, title: id } });
                dispatch({
                  type: 'audio',
                  action: { type: 'tick', deltaMs: 18000, segments: transcript },
                });
                dispatch({ type: 'audio', action: { type: 'finish' } });
              }
              dispatch({
                type: 'audio',
                action: { type: 'play', audioId: sample.id, durationMs: sample.durationMs },
              });
              router.dismissAll();
              router.replace('/(tabs)/notes');
            }}
          />
          <Button label="Empty library" onPress={() => reset(true)} />
          <Button label="Recording" onPress={() => capture('recording')} />
          <Button label="Paused recording" onPress={() => capture('paused')} />
          <Button label="Interrupted recording" onPress={() => capture('interrupted')} />
          <Button label="Destination save fails once" onPress={() => capture('finished')} />
          <Button
            label={failure ? 'Next save will fail' : 'Fail next destination save'}
            onPress={() => dispatch({ type: 'failNextSave' })}
          />
        </Section>
        <Section title="Audio attachment">
          <AudioAttachment item={sample} />
        </Section>
        <Section title="Compact playback">
          <CompactPlayback
            {...playback}
            onControls={() =>
              router.push({ pathname: '/playback/[id]', params: { id: sample.id } })
            }
          />
        </Section>
        <Section title="Recording panel">
          <RecordingPanel
            capture={{
              id: 'preview',
              title: 'Preview',
              status: 'paused',
              elapsedMs: 32000,
              segments: transcript,
              moments: [],
            }}
            onMark={() => capture('paused')}
            onToggle={() => capture('recording')}
            onFinish={() => capture('finished')}
            reduceMotion
          />
        </Section>
        <Section title="Feedback">
          <Feedback title="Moment added" />
          <Feedback
            title="Couldn’t save"
            message="Your recording and destination are kept."
            error
          />
        </Section>
      </List>
    </Host>
  );
}
