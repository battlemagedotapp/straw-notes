import { useAudioNavigation } from '@/features/audio/useAudioNavigation';
import { Button, Host, List, Section, Text } from '@expo/ui/swift-ui';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  navigationPreviews,
  navigationPreviewActions,
  type NavigationPreview,
} from './navigationScenarios';
import { createSeedNotes, createSeedRecordings, folders, transcript } from '@/fixtures/notes';
import { createId, useAppDispatch, useAudio } from '@/features/notes/NotesProvider';
export function ScenariosScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const audioNavigation = useAudioNavigation();
  const { capture } = useAudio();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const applied = useRef<string | null>(null);
  useEffect(() => {
    if (
      !preview ||
      applied.current === preview ||
      !navigationPreviews.includes(preview as NavigationPreview)
    )
      return;
    applied.current = preview;
    navigationPreviewActions(preview as NavigationPreview).forEach(dispatch);
    router.replace('/(tabs)/notes');
  }, [preview, dispatch, router]);
  const reset = () =>
    dispatch({
      type: 'reset',
      notes: createSeedNotes(),
      folders,
      recordings: createSeedRecordings(),
    });
  const seed = (status: 'recording' | 'paused' | 'interrupted' | 'failed') => {
    reset();
    const id = createId();
    dispatch({ type: 'audio', action: { type: 'start', id, title: 'Demo audio' } });
    dispatch({ type: 'audio', action: { type: 'tick', deltaMs: 32000, segments: transcript } });
    if (status === 'paused')
      dispatch({ type: 'audio', action: { type: 'toggleCapture', captureId: id } });
    if (status === 'interrupted') dispatch({ type: 'audio', action: { type: 'interrupt' } });
    if (status === 'failed') {
      dispatch({ type: 'setFailure', operationId: 'save:' + id });
      dispatch({ type: 'finishCapture', captureId: id, now: new Date().toISOString() });
    }
    audioNavigation.openCapture(id);
  };
  return (
    <>
      <Stack.Screen options={{ title: 'Developer scenarios' }} />
      <Host style={{ flex: 1 }}>
        <List>
          <Section title="Session-only demo">
            <Text>
              Audio is simulated. Reload resets every change. Scenarios replace the session.
            </Text>
            <Button label="Reset rich demo" onPress={reset} />
            <Button
              label="Small libraries"
              onPress={() => {
                const now = new Date();
                dispatch({
                  type: 'reset',
                  notes: createSeedNotes(now).filter((note) =>
                    ['weekend', 'morning', 'studio'].includes(note.id),
                  ),
                  recordings: createSeedRecordings(now).filter(
                    (recording) => recording.id === 'morning-audio',
                  ),
                  folders: folders.filter((folder) =>
                    ['personal', 'work', 'ideas'].includes(folder.id),
                  ),
                });
                router.push('/(tabs)/notes');
              }}
            />
            <Button
              label="Empty libraries"
              onPress={() => dispatch({ type: 'reset', notes: [], recordings: [], folders })}
            />
          </Section>
          <Section title="Navigation review">
            <Text>
              Replace the session with realistic audio states, then scroll Notes to compare expanded
              and docked accessories.
            </Text>
            {navigationPreviews.map((preview) => (
              <Button
                key={preview}
                label={'Navigation · ' + preview}
                onPress={() => {
                  navigationPreviewActions(preview).forEach(dispatch);
                  router.replace('/(tabs)/notes');
                }}
              />
            ))}
          </Section>
          <Section title="Capture">
            {(['recording', 'paused', 'interrupted', 'failed'] as const).map((status) => (
              <Button key={status} label={'Capture · ' + status} onPress={() => seed(status)} />
            ))}
            {capture ? (
              <>
                <Button
                  label="Fail this capture save"
                  onPress={() =>
                    dispatch({ type: 'setFailure', operationId: 'save:' + capture.id })
                  }
                />
                <Button
                  label="Fail this capture attachment"
                  onPress={() =>
                    dispatch({ type: 'setFailure', operationId: 'capture-link:' + capture.id })
                  }
                />
              </>
            ) : null}
          </Section>
          <Section title="Resource flows">
            <Button label="Audio" onPress={() => router.push('/(tabs)/recordings')} />
            <Button label="Demo import" onPress={() => router.push('/import-audio')} />
            <Button
              label="Shared audio"
              onPress={() => {
                reset();
                dispatch({
                  type: 'linkRecordings',
                  operationId: createId(),
                  recordingIds: ['morning-audio'],
                  noteId: 'studio',
                  now: new Date().toISOString(),
                });
                router.push('/(tabs)/recordings');
              }}
            />
            <Button
              label="Missing note"
              onPress={() => router.push({ pathname: '/note/[id]', params: { id: 'missing' } })}
            />
            <Button
              label="Missing audio"
              onPress={() => audioNavigation.openRecording('missing')}
            />
          </Section>
        </List>
      </Host>
    </>
  );
}
