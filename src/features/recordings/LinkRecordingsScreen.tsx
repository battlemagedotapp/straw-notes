import type { SearchBarCommands } from 'react-native-screens';
import {
  Button,
  VStack,
  ContentUnavailableView,
  Host,
  List,
  Label,
  Section,
  Text,
  TextField,
  Picker,
  useNativeState,
} from '@expo/ui/swift-ui';
import {
  listStyle,
  tag,
  environment,
  disabled,
  accessibilityElement,
  fixedSize,
  font,
  foregroundColor,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { TextFieldRef } from '@expo/ui/swift-ui';
import {
  createId,
  useAppDispatch,
  useNotes,
  useOperations,
  useRecordings,
} from '../notes/NotesProvider';
import { newNote, noteTitle } from '../notes/model';
import { useRecordingFlowDraft } from './RecordingFlowDrafts';
import { RecordingRow } from './RecordingRow';
import { colors } from '@/ui/tokens';

/** Both entry directions share one atomic linking form, not nested screens. */
export function LinkRecordingsScreen({ choose = false }: { choose?: boolean }) {
  const params = useLocalSearchParams<{ ids?: string; noteId?: string; operationId?: string }>();
  const sourceIds = (params.ids ?? '').split(',').filter(Boolean);
  const key = choose ? 'note:' + params.noteId : 'recordings:' + sourceIds.join(',');
  const { draft, update, clear } = useRecordingFlowDraft(key);
  const { notes, folders } = useNotes();
  const recordings = useRecordings();
  const operations = useOperations();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const title = useNativeState(
    draft.title ??
      (sourceIds.length === 1
        ? (recordings.find((r) => r.id === sourceIds[0])?.title ?? 'New note')
        : 'New note'),
  );
  const field = useRef<TextFieldRef>(null);
  const search = useRef<SearchBarCommands>(null);
  const retainedQuery = useRef(draft.query);
  const submitted = useRef(false);
  const [newId] = useState(() => draft.newNoteId || createId());
  const [op] = useState(() => params.operationId || draft.operationId || createId());
  const ids = choose ? draft.selected : sourceIds;
  const destination = choose ? params.noteId : draft.destination;
  const target = notes.find((n) => n.id === destination);
  const result = operations[op];
  useEffect(() => {
    retainedQuery.current = draft.query;
  }, [draft.query]);
  useEffect(() => {
    if (destination !== 'new') search.current?.setText(retainedQuery.current);
  }, [destination]);
  const sourceMissing = choose
    ? !notes.some((n) => n.id === params.noteId)
    : sourceIds.some((id) => !recordings.some((r) => r.id === id && !r.deletedAt));
  useEffect(() => {
    update({ operationId: op, newNoteId: newId });
  }, [update, op, newId]); // session draft identity
  useEffect(() => {
    if (submitted.current && result?.status === 'success') {
      submitted.current = false;
      clear();
      router.back();
    }
    if (result?.status === 'error') submitted.current = false;
  }, [result, clear, router]);
  useEffect(() => {
    if (sourceMissing) clear();
  }, [sourceMissing, clear]);
  const add = async () => {
    if (submitted.current) return;
    submitted.current = true;
    await field.current?.blur();
    const now = new Date().toISOString();
    dispatch({
      type: 'linkRecordings',
      operationId: op,
      recordingIds: ids,
      noteId: destination === 'new' ? newId : (destination ?? ''),
      newNote:
        destination === 'new'
          ? newNote(newId, draft.folder, now, title.value.trim() || 'New note')
          : undefined,
      now,
    });
  };
  const term = draft.query.toLocaleLowerCase().trim();
  return (
    <>
      <Stack.Screen
        options={{
          title: choose ? 'Add Audio' : 'Add to Note',
          headerSearchBarOptions:
            destination === 'new'
              ? undefined
              : {
                  ref: search,
                  placeholder: choose ? 'Search audio' : 'Search notes',
                  hideWhenScrolling: false,
                  onChangeText: (e) => update({ query: e.nativeEvent.text }),
                },
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel={choose ? 'Close audio selection' : 'Close Add to Note'}
          onPress={async () => {
            await field.current?.blur();
            router.back();
          }}
        >
          Close
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          variant="done"
          disabled={
            sourceMissing ||
            !ids.length ||
            !destination ||
            (destination === 'new' ? !folders.some((f) => f.id === draft.folder) : !target)
          }
          onPress={add}
        >
          {result?.status === 'error' ? 'Try again' : 'Add'}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List
          selection={choose ? draft.selected : undefined}
          onSelectionChange={(values) => {
            const allowed = values
              .map(String)
              .filter(
                (id) =>
                  recordings.some((r) => r.id === id && !r.deletedAt) &&
                  !target?.recordingIds.includes(id),
              );
            update({
              selected: [
                ...draft.selected.filter((id) => allowed.includes(id)),
                ...allowed.filter((id) => !draft.selected.includes(id)),
              ],
            });
          }}
          modifiers={[
            listStyle('insetGrouped'),
            ...(choose ? [environment('editMode', 'active')] : []),
          ]}
        >
          {sourceMissing ? (
            <ContentUnavailableView
              title="Source unavailable"
              description="The note or audio was deleted. Close this sheet and choose an available item."
              systemImage="exclamationmark.triangle"
            />
          ) : (
            <>
              {result?.status === 'error' ? (
                <Section>
                  <VStack
                    alignment="leading"
                    spacing={8}
                    modifiers={[accessibilityElement('combine')]}
                  >
                    <Label title="Couldn’t add audio" systemImage="exclamationmark.circle" />
                    {result.message ? (
                      <Text
                        modifiers={[
                          font({ textStyle: 'subheadline' }),
                          foregroundColor(colors.secondary),
                          fixedSize({ horizontal: false, vertical: true }),
                        ]}
                      >
                        {result.message}
                      </Text>
                    ) : null}
                  </VStack>
                </Section>
              ) : null}
              {choose ? (
                <Section title="Choose audio">
                  {recordings
                    .filter((r) => !r.deletedAt && r.title.toLocaleLowerCase().includes(term))
                    .map((r) => {
                      const added = target?.recordingIds.includes(r.id);
                      return (
                        <VStack
                          key={r.id}
                          alignment="leading"
                          spacing={4}
                          modifiers={[tag(r.id), disabled(Boolean(added))]}
                        >
                          <RecordingRow item={r} />
                          {added ? <Text>Added</Text> : null}
                        </VStack>
                      );
                    })}
                  {!recordings.some((r) => !r.deletedAt) ? <Text>No saved audio yet.</Text> : null}
                </Section>
              ) : destination === 'new' ? (
                <Section title="New note">
                  <TextField
                    ref={field}
                    text={title}
                    placeholder="Note title"
                    onTextChange={(value) => update({ title: value })}
                  />
                  <Picker
                    label="Folder"
                    selection={draft.folder}
                    onSelectionChange={(v) => update({ folder: String(v) })}
                  >
                    {folders.map((f) => (
                      <Text key={f.id} modifiers={[tag(f.id)]}>
                        {f.name}
                      </Text>
                    ))}
                  </Picker>
                  {!folders.some((f) => f.id === draft.folder) ? (
                    <Text>Choose an available folder.</Text>
                  ) : null}
                  <Button
                    label="Choose an existing note"
                    systemImage="note.text"
                    onPress={async () => {
                      await field.current?.blur();
                      update({ destination: '' });
                    }}
                  />
                </Section>
              ) : (
                <Section title="Choose a note">
                  <Button
                    label="New note"
                    systemImage="plus"
                    onPress={() => update({ destination: 'new' })}
                  />
                  {notes
                    .filter((n) =>
                      [n.title, n.body].some((t) => t.toLocaleLowerCase().includes(term)),
                    )
                    .map((n) => {
                      const added = ids.every((id) => n.recordingIds.includes(id));
                      return (
                        <Button
                          key={n.id}
                          label={
                            noteTitle(n) +
                            (added ? ' · Added' : draft.destination === n.id ? ' · Selected' : '')
                          }
                          onPress={() => {
                            if (!added) update({ destination: n.id });
                          }}
                        />
                      );
                    })}
                  {draft.destination && !target ? (
                    <Text>The selected note is no longer available. Choose another note.</Text>
                  ) : null}
                </Section>
              )}
              <Section>
                <Text>Audio stays in your library. Adding it to a note doesn’t make a copy.</Text>
              </Section>
            </>
          )}
        </List>
      </Host>
    </>
  );
}
