import { useUnsavedRecordingsAction } from '@/features/audio/toolbar';
import {
  Button,
  ContentUnavailableView,
  ContextMenu,
  Host,
  HStack,
  Image,
  List,
  Section,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  buttonStyle,
  font,
  foregroundColor,
  lineLimit,
  listStyle,
  contentShape,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/ui/tokens';
import { useAppDispatch, useAudio, useNotes } from '../notes/NotesProvider';
import { NoteRow } from '../notes/NoteRow';
import { useNoteActions } from '../notes/useNoteActions';
import type { Note } from '../notes/types';
import { useAudioActions } from '../audio/useAudioActions';
import { formatTime } from '../audio/model';
import { dateGroup, sortNotes, type NoteSort } from '../notes/presentation';

export function LibraryScreen({
  folderId,
  search = false,
}: {
  folderId?: string;
  search?: boolean;
}) {
  const { notes, folders } = useNotes();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<NoteSort>('recent');
  const router = useRouter();
  const unsavedAction = useUnsavedRecordingsAction({ menu: true });
  const dispatch = useAppDispatch();
  const actions = useNoteActions();
  const { write, startRecording } = useAudioActions();
  const audio = useAudio();
  const term = query.trim().toLocaleLowerCase();
  const available = notes.filter((n) => !folderId || n.folderId === folderId);
  const filtered = sortNotes(
    available.filter(
      (n) => !term || [n.title, n.body].some((t) => t.toLocaleLowerCase().includes(term)),
    ),
    sort,
  );
  const transcriptResults =
    search && term
      ? available.flatMap((note) =>
          note.audio.flatMap((item) =>
            item.segments
              .filter((segment) => segment.text.toLocaleLowerCase().includes(term))
              .map((segment) => ({ note, item, segment })),
          ),
        )
      : [];
  const title = search
    ? 'Search'
    : folderId
      ? (folders.find((f) => f.id === folderId)?.name ?? 'Folder')
      : 'All Notes';
  const open = (note: Note) => router.push({ pathname: '/note/[id]', params: { id: note.id } });
  const move = (note: Note) => router.push({ pathname: '/move-notes', params: { ids: note.id } });
  const row = (note: Note) => (
    <ContextMenu key={note.id}>
      <ContextMenu.Trigger>
        <Button onPress={() => open(note)} modifiers={[buttonStyle('plain')]}>
          <HStack modifiers={[contentShape(shapes.rectangle())]}>
            <NoteRow
              note={note}
              folderName={folders.find((f) => f.id === note.folderId)?.name ?? 'Notes'}
            />
            <Spacer />
            <Image
              systemName="chevron.right"
              modifiers={[
                font({ textStyle: 'caption', weight: 'semibold' }),
                foregroundColor(colors.secondary),
              ]}
            />
          </HStack>
        </Button>
      </ContextMenu.Trigger>
      <ContextMenu.Items>
        <Button
          label="Rename note"
          systemImage="pencil"
          onPress={() => router.push({ pathname: '/rename-note', params: { id: note.id } })}
        />
        <Button
          label={note.pinned ? 'Unpin' : 'Pin'}
          systemImage={note.pinned ? 'pin.slash' : 'pin'}
          onPress={() => dispatch({ type: 'pin', ids: [note.id], pinned: !note.pinned })}
        />
        <Button label="Move to folder" systemImage="folder" onPress={() => move(note)} />
        <Button
          label="Delete"
          systemImage="trash"
          role="destructive"
          onPress={() => actions.trash([note.id])}
        />
      </ContextMenu.Items>
    </ContextMenu>
  );
  const pinned = filtered.filter((n) => n.pinned);
  const other = filtered.filter((n) => !n.pinned);
  const groups =
    sort === 'title' ? ['Notes'] : [...new Set(other.map((n) => dateGroup(n.updatedAt)))];
  const sectionHeader = (group: string, first: boolean) => (
    <VStack alignment="leading" spacing={12}>
      {first ? (
        <Text modifiers={[font({ textStyle: 'subheadline' }), foregroundColor(colors.secondary)]}>
          {available.length} {available.length === 1 ? 'note' : 'notes'}
        </Text>
      ) : null}
      <Text>{group}</Text>
    </VStack>
  );
  const emptySearch = search && !term;
  const empty = !filtered.length && !transcriptResults.length;
  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerLargeTitleEnabled: true,
        }}
      />
      {search ? (
        <Stack.SearchBar
          placeholder="Notes and transcripts"
          onChangeText={(e) => setQuery(e.nativeEvent.text)}
        />
      ) : null}
      {!search ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            disabled={!available.length}
            onPress={() => router.push({ pathname: '/select-notes', params: { folderId } })}
          >
            Select
          </Stack.Toolbar.Button>
          {audio.capture || audio.pending.length || audio.playback.status !== 'idle' ? (
            <Stack.Toolbar.Button
              icon="square.and.pencil"
              accessibilityLabel="Write note"
              onPress={() => write(folderId)}
            >
              Write
            </Stack.Toolbar.Button>
          ) : null}
          <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Library actions">
            {unsavedAction}
            <Stack.Toolbar.Menu title="Sort by" icon="arrow.up.arrow.down">
              {(['recent', 'oldest', 'title'] as const).map((value) => (
                <Stack.Toolbar.MenuAction
                  key={value}
                  isOn={sort === value}
                  onPress={() => setSort(value)}
                >
                  {value === 'recent'
                    ? 'Date edited · Newest first'
                    : value === 'oldest'
                      ? 'Date edited · Oldest first'
                      : 'Title'}
                </Stack.Toolbar.MenuAction>
              ))}
            </Stack.Toolbar.Menu>
            <Stack.Toolbar.MenuAction icon="square.and.pencil" onPress={() => write(folderId)}>
              New note
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction icon="mic" onPress={startRecording}>
              Record
            </Stack.Toolbar.MenuAction>
            {folderId ? (
              <Stack.Toolbar.MenuAction
                icon="pencil"
                onPress={() =>
                  router.push({ pathname: '/folder-editor', params: { id: folderId } })
                }
              >
                Rename folder
              </Stack.Toolbar.MenuAction>
            ) : null}
          </Stack.Toolbar.Menu>
        </Stack.Toolbar>
      ) : null}
      <Host style={{ flex: 1, backgroundColor: colors.grouped }}>
        <ZStack>
          <List modifiers={[listStyle('insetGrouped')]}>
            {emptySearch || empty ? null : search ? (
              <>
                {filtered.length ? <Section title="Notes">{filtered.map(row)}</Section> : null}
                {transcriptResults.length ? (
                  <Section title="Transcripts">
                    {transcriptResults.map(({ item, segment }) => (
                      <Button
                        key={`${item.id}:${segment.id}`}
                        modifiers={[buttonStyle('plain')]}
                        onPress={() =>
                          router.push({
                            pathname: '/transcript/[id]',
                            params: { id: item.id, at: segment.startMs },
                          })
                        }
                      >
                        <VStack alignment="leading" spacing={4}>
                          <Text modifiers={[font({ textStyle: 'headline' })]}>{item.title}</Text>
                          <Text
                            modifiers={[
                              font({ textStyle: 'subheadline' }),
                              foregroundColor(colors.secondary),
                              lineLimit(3),
                            ]}
                          >
                            “{segment.text}”
                          </Text>
                          <Text
                            modifiers={[
                              font({ textStyle: 'caption' }),
                              foregroundColor(colors.secondary),
                            ]}
                          >
                            {formatTime(segment.startMs)} · Audio,{' '}
                            {Math.max(1, Math.round(item.durationMs / 60000))} min
                          </Text>
                        </VStack>
                      </Button>
                    ))}
                  </Section>
                ) : null}
              </>
            ) : (
              <>
                {pinned.length ? (
                  <Section header={sectionHeader('Pinned', true)}>{pinned.map(row)}</Section>
                ) : null}
                {groups.map((group, index) => (
                  <Section key={group} header={sectionHeader(group, !pinned.length && index === 0)}>
                    {other
                      .filter((n) => sort === 'title' || dateGroup(n.updatedAt) === group)
                      .map(row)}
                  </Section>
                ))}
              </>
            )}
          </List>
          {emptySearch || empty ? (
            <ContentUnavailableView
              title={
                emptySearch ? 'Search notes and transcripts' : term ? 'No results' : 'No notes yet'
              }
              systemImage={search ? 'magnifyingglass' : 'note.text'}
              description={
                emptySearch
                  ? 'Find a thought, phrase, or recording.'
                  : term
                    ? 'Try another word or phrase.'
                    : 'Record a thought or write something down.'
              }
            />
          ) : null}
        </ZStack>
      </Host>
    </>
  );
}
