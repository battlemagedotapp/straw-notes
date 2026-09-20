import { Button, ContentUnavailableView, Host, List, Section } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppDispatch, useNotes } from '../notes/NotesProvider';
export function MoveNotesScreen() {
  const { ids = '' } = useLocalSearchParams<{ ids?: string }>();
  const { notes, folders } = useNotes();
  const selected = ids.split(',').filter((id) => notes.some((n) => n.id === id));
  const [query, setQuery] = useState('');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const results = folders.filter((f) =>
    f.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Move to folder',
          headerSearchBarOptions: {
            placeholder: 'Search folders',
            placement: 'stacked',
            hideWhenScrolling: false,
            onChangeText: (e) => setQuery(e.nativeEvent.text),
          },
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Cancel</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section title={`${selected.length} note${selected.length === 1 ? '' : 's'}`}>
            {results.length && selected.length ? (
              results.map((folder) => (
                <Button
                  key={folder.id}
                  label={folder.name}
                  systemImage="folder"
                  onPress={() => {
                    dispatch({
                      type: 'move',
                      ids: selected,
                      folderId: folder.id,
                      updatedAt: new Date().toISOString(),
                    });
                    router.back();
                  }}
                />
              ))
            ) : (
              <ContentUnavailableView
                title={selected.length ? 'No matching folders' : 'No notes to move'}
                systemImage="folder"
              />
            )}
          </Section>
        </List>
      </Host>
    </>
  );
}
