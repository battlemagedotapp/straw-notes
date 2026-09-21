import type { TextFieldRef } from '@expo/ui/swift-ui';
import { Form, Host, Section, TextField, useNativeState } from '@expo/ui/swift-ui';
import { accessibilityLabel } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useRecordings } from '../notes/NotesProvider';

export function RenameRecordingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recording = useRecordings().find((n) => n.id === id && !n.deletedAt);
  const initial = recording?.title ?? '';
  const input = useNativeState(initial);
  const [name, setName] = useState(initial);
  const [closing, setClosing] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const field = useRef<TextFieldRef>(null);
  const cancel = async () => {
    await field.current?.blur();
    router.back();
  };
  const valid = Boolean(recording && name.trim());
  const save = async () => {
    if (!recording || !valid) return;
    await field.current?.blur();
    dispatch({
      type: 'renameRecording',
      id,
      title: name.trim(),
      now: new Date().toISOString(),
    });
    setClosing(true);
  };
  usePreventRemove(name !== initial && !closing, () => {
    void field.current?.blur();
    Alert.alert('Save changes?', 'Keep this audio title?', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => setClosing(true) },
      ...(valid ? [{ text: 'Save', onPress: save }] : []),
    ]);
  });
  useEffect(() => {
    if (closing) router.back();
  }, [closing, router]);
  return (
    <>
      <Stack.Screen options={{ title: 'Rename Audio' }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={cancel}>Cancel</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button variant="done" disabled={!valid} onPress={save}>
          Save
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <Form>
          <Section title="Name">
            <TextField
              ref={field}
              text={input}
              autoFocus
              onTextChange={setName}
              modifiers={[accessibilityLabel('Audio title')]}
            />
          </Section>
        </Form>
      </Host>
    </>
  );
}
