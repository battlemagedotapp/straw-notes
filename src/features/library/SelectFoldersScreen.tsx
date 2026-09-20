import { Button, Host, HStack, Image, List, Section, Spacer, Text } from '@expo/ui/swift-ui';
import {
  accessibilityValue,
  buttonStyle,
  contentShape,
  disabled,
  foregroundColor,
  listStyle,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/ui/tokens';
import { useNotes } from '../notes/NotesProvider';
import { useFolderActions } from './useFolderActions';

export function SelectFoldersScreen() {
  const { folders } = useNotes();
  const [selected, setSelected] = useState<string[]>([]);
  const available = folders.filter((f) => f.id !== 'personal');
  const ids = selected.filter((id) => available.some((f) => f.id === id));
  const router = useRouter();
  const { remove } = useFolderActions();
  return (
    <>
      <Stack.Screen options={{ title: `${ids.length} Selected`, headerBackVisible: false }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          disabled={!available.length}
          onPress={() =>
            setSelected(ids.length === available.length ? [] : available.map((f) => f.id))
          }
        >
          {ids.length === available.length && ids.length ? 'Deselect All' : 'Select All'}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="trash"
          disabled={!ids.length}
          onPress={() => remove(ids, () => router.back())}
        >
          Delete
        </Stack.Toolbar.Button>

        <Stack.Toolbar.Button variant="done" onPress={() => router.back()}>
          Done
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section
            footer={
              <Text>
                {folders.find((f) => f.id === 'personal')?.name ?? 'Personal'} is the default folder
                and cannot be deleted.
              </Text>
            }
          >
            {folders.map((folder) => (
              <Button
                key={folder.id}
                modifiers={[
                  buttonStyle('plain'),
                  disabled(folder.id === 'personal'),
                  accessibilityValue(ids.includes(folder.id) ? 'Selected' : 'Not selected'),
                ]}
                onPress={() =>
                  setSelected((old) =>
                    old.includes(folder.id)
                      ? old.filter((id) => id !== folder.id)
                      : [...old, folder.id],
                  )
                }
              >
                <HStack modifiers={[contentShape(shapes.rectangle())]}>
                  <Image systemName="folder" modifiers={[foregroundColor(colors.signal)]} />
                  <Text>{folder.name}</Text>
                  <Spacer />
                  <Image
                    modifiers={[
                      foregroundColor(ids.includes(folder.id) ? colors.signal : colors.secondary),
                    ]}
                    systemName={ids.includes(folder.id) ? 'checkmark.circle.fill' : 'circle'}
                  />
                </HStack>
              </Button>
            ))}
          </Section>
        </List>
      </Host>
    </>
  );
}
