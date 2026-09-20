import type { TextFieldRef } from '@expo/ui/swift-ui';
import { Form, Host, Section, Text, TextField, useNativeState } from '@expo/ui/swift-ui';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { createId, useAppDispatch, useNotes } from '../notes/NotesProvider';
export function FolderEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { folders } = useNotes();
  const folder = folders.find((f) => f.id === id);
  const initial = folder?.name ?? '';
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
  const duplicate = folders.some(
    (f) => f.id !== id && f.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
  );
  const valid = Boolean(name.trim()) && !duplicate && (!id || Boolean(folder));
  const save = async () => {
    if (!valid) return;
    await field.current?.blur();
    dispatch({ type: 'saveFolder', folder: { id: id ?? createId(), name } });
    setClosing(true);
  };
  usePreventRemove(name !== initial && !closing, () => {
    void field.current?.blur();
    Alert.alert('Save changes?', 'Keep this folder name?', [
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
      <Stack.Screen options={{ title: id ? 'Rename folder' : 'New folder' }} />
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
          <Section
            title="Name"
            footer={duplicate ? <Text>A folder with this name already exists.</Text> : undefined}
          >
            <TextField
              ref={field}
              text={input}
              onTextChange={setName}
              autoFocus
              placeholder="Folder name"
            />
          </Section>
        </Form>
      </Host>
    </>
  );
}
