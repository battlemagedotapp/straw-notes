import type { TextFieldRef } from '@expo/ui/swift-ui';
import { Form, Host, Section, TextField, useNativeState } from '@expo/ui/swift-ui';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { usePreventRemove } from 'expo-router/react-navigation';
import { Alert } from 'react-native';
import { useAppDispatch, useAudio } from '../notes/NotesProvider';

export function MomentScreen() {
  const { captureId, momentId } = useLocalSearchParams<{ captureId: string; momentId: string }>();
  const audio = useAudio();
  const moment = [audio.capture, ...audio.pending]
    .find((c) => c?.id === captureId)
    ?.moments.find((m) => m.id === momentId);
  const initial = moment?.name ?? 'Moment';
  const name = useNativeState(initial);
  const [value, setValue] = useState(initial);
  const [allowClose, setAllowClose] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const field = useRef<TextFieldRef>(null);
  const cancel = async () => {
    await field.current?.blur();
    router.back();
  };
  const dirty = value !== initial;
  const save = async () => {
    await field.current?.blur();
    dispatch({ type: 'audio', action: { type: 'nameMoment', captureId, momentId, name: value } });
    setAllowClose(true);
  };
  usePreventRemove(dirty && !allowClose, () => {
    void field.current?.blur();
    Alert.alert('Save changes?', 'Keep the name for this moment?', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => setAllowClose(true) },
      ...(value.trim() ? [{ text: 'Save', onPress: save }] : []),
    ]);
  });
  // Removing only after the guard has re-rendered also covers native swipe dismissal.
  useEffect(() => {
    if (allowClose) router.back();
  }, [allowClose, router]);
  return (
    <>
      <Stack.Screen options={{ title: 'Name moment' }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={cancel}>Cancel</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button variant="done" disabled={!moment || !value.trim()} onPress={save}>
          Save
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <Form>
          <Section title="Name">
            <TextField ref={field} text={name} autoFocus onTextChange={setValue} />
          </Section>
        </Form>
      </Host>
    </>
  );
}
