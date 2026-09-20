import { useAudioActions } from './useAudioActions';
import {
  Button,
  ContentUnavailableView,
  Host,
  HStack,
  Image,
  Spacer,
  List,
  Picker,
  Section,
  Text,
  TextField,
  useNativeState,
  type TextFieldRef,
} from '@expo/ui/swift-ui';
import {
  accessibilityValue,
  buttonStyle,
  listStyle,
  tag,
  foregroundColor,
  font,
  contentShape,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import type { SearchBarCommands } from 'react-native-screens';
import { colors } from '@/ui/tokens';
import { useDestinationDraft } from './DestinationDrafts';
import { Feedback } from '@/ui/Feedback';
import { createId, useAppDispatch, useAudio, useNotes } from '../notes/NotesProvider';
import { newNote, noteTitle } from '../notes/model';

export function DestinationScreen() {
  const { captureId } = useLocalSearchParams<{ captureId?: string }>();
  const { pending, saveErrors } = useAudio();
  const { notes, folders } = useNotes();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { discardRecording } = useAudioActions();
  const capture = captureId ? pending.find((c) => c.id === captureId) : pending[0];
  const saveError = capture ? saveErrors[capture.id] : undefined;
  const { draft, update, clear } = useDestinationDraft(capture?.id ?? '');
  const { query, destination } = draft;
  const folder = draft.folder;
  const title = useNativeState(draft.title);
  const titleField = useRef<TextFieldRef>(null);
  const close = async () => {
    await titleField.current?.blur();
    router.back();
  };
  const searchBar = useRef<SearchBarCommands>(null);
  const choosingNew = destination === 'new';
  const retainedQuery = useRef(query);
  useEffect(() => {
    retainedQuery.current = query;
  }, [query]);
  useEffect(() => {
    if (!choosingNew) searchBar.current?.setText(retainedQuery.current);
  }, [choosingNew]);
  const results = notes.filter((note) =>
    [noteTitle(note), note.body].some((text) =>
      text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    ),
  );
  const submitted = useRef<{ captureId: string; noteId: string } | null>(null);
  useEffect(() => {
    const submission = submitted.current;
    if (!submission) return;
    if (!pending.some((c) => c.id === submission.captureId)) {
      submitted.current = null;
      clear(submission.captureId);
      router.dismissTo({ pathname: '/note/[id]', params: { id: submission.noteId } });
    } else if (saveError) {
      submitted.current = null;
    }
  }, [pending, saveError, router, clear]);
  const save = async () => {
    if (!capture || !destination || submitted.current) return;
    const noteId = destination === 'new' ? createId() : destination;
    const now = new Date().toISOString();
    submitted.current = { captureId: capture.id, noteId };
    await titleField.current?.blur();
    dispatch({
      type: 'attach',
      captureId: capture.id,
      noteId,
      updatedAt: now,
      newNote:
        destination === 'new'
          ? newNote(noteId, folder, now, title.value.trim() || 'New recording')
          : undefined,
    });
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Save recording',
          headerSearchBarOptions:
            destination === 'new'
              ? undefined
              : {
                  ref: searchBar,
                  placeholder: 'Search notes',
                  placement: 'stacked',
                  onChangeText: (e) => update({ query: e.nativeEvent.text }),
                  hideWhenScrolling: false,
                },
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="xmark" accessibilityLabel="Close" onPress={close}>
          Close
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        {capture ? (
          <Stack.Toolbar.Button
            icon="trash"
            accessibilityLabel="Discard recording"
            onPress={async () => {
              await titleField.current?.blur();
              discardRecording(capture.id, () => router.back());
            }}
          >
            Discard
          </Stack.Toolbar.Button>
        ) : null}

        <Stack.Toolbar.Button
          variant="done"
          disabled={
            !capture ||
            !destination ||
            (destination === 'new' && !folders.some((f) => f.id === folder)) ||
            (destination !== 'new' && !notes.some((n) => n.id === destination))
          }
          onPress={save}
        >
          {saveError ? 'Try again' : 'Save'}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          {!capture ? (
            <ContentUnavailableView title="No recording to save" systemImage="checkmark.circle" />
          ) : (
            <>
              {choosingNew && !folders.some((f) => f.id === folder) ? (
                <Section>
                  <Text>The selected folder is no longer available. Choose another folder.</Text>
                </Section>
              ) : null}
              {saveError ? (
                <Section>
                  <Feedback title="Couldn’t save" message={saveError} error />
                </Section>
              ) : null}
              {destination === 'new' ? (
                <>
                  <Section title="New note">
                    <TextField
                      ref={titleField}
                      text={title}
                      placeholder="Note title"
                      onTextChange={(value) => update({ title: value })}
                    />
                    <Picker
                      label="Folder"
                      selection={folder}
                      onSelectionChange={(value) => update({ folder: String(value) })}
                    >
                      {folders.map((f) => (
                        <Text key={f.id} modifiers={[tag(f.id)]}>
                          {f.name}
                        </Text>
                      ))}
                    </Picker>
                  </Section>
                  <Section>
                    <Button
                      label="Choose an existing note"
                      onPress={async () => {
                        await titleField.current?.blur();
                        update({ destination: '' });
                      }}
                    />
                  </Section>
                </>
              ) : (
                <>
                  <Section
                    header={
                      <Text
                        modifiers={[
                          font({ textStyle: 'title', weight: 'bold' }),
                          foregroundColor(colors.primary),
                        ]}
                      >
                        Choose a note
                      </Text>
                    }
                  >
                    <Button
                      label="New note"
                      systemImage="plus"
                      onPress={() => update({ destination: 'new' })}
                    />
                    {results.length ? (
                      results.map((note) => (
                        <Button
                          key={note.id}
                          onPress={() => update({ destination: note.id })}
                          modifiers={[
                            buttonStyle('plain'),
                            accessibilityValue(
                              destination === note.id ? 'Selected' : 'Not selected',
                            ),
                          ]}
                        >
                          <HStack modifiers={[contentShape(shapes.rectangle())]}>
                            <Text>{noteTitle(note)}</Text>
                            <Spacer />
                            {destination === note.id ? (
                              <Image
                                modifiers={[foregroundColor(colors.signal)]}
                                systemName="checkmark"
                              />
                            ) : null}
                          </HStack>
                        </Button>
                      ))
                    ) : (
                      <Text>{query ? 'No matching notes' : 'No existing notes'}</Text>
                    )}
                  </Section>
                </>
              )}
            </>
          )}
        </List>
      </Host>
    </>
  );
}
