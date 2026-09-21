import { useUndoDeletion } from '../notes/useUndoDeletion';
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
  listStyle,
  contentShape,
  shapes,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/ui/tokens';
import { useAppDispatch, useAudio, useNotes, useRecordings } from '../notes/NotesProvider';
import { NoteRow } from '../notes/NoteRow';
import { useNoteActions } from '../notes/useNoteActions';
import type { Note } from '../notes/types';
import { useAudioActions } from '../audio/useAudioActions';
import { notePreview, dateGroup, sortNotes, type NoteSort } from '../notes/presentation';

export function LibraryScreen({ folderId }: { folderId?: string }) {
  const { notes, folders } = useNotes();
  const [sort, setSort] = useState<NoteSort>('recent');
  const recordings = useRecordings();
  const undoDeletion = useUndoDeletion('notes');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const actions = useNoteActions();
  const { write, startCapture } = useAudioActions();
  const audio = useAudio();
  const available = notes.filter((n) => !folderId || n.folderId === folderId);
  const filtered = sortNotes(available, sort);
  const title = folderId ? (folders.find((f) => f.id === folderId)?.name ?? 'Folder') : 'All Notes';
  const open = (note: Note) => router.push({ pathname: '/note/[id]', params: { id: note.id } });
  const move = (note: Note) => router.push({ pathname: '/move-notes', params: { ids: note.id } });
  const row = (note: Note) => (
    <ContextMenu key={note.id}>
      <ContextMenu.Trigger>
        <Button onPress={() => open(note)} modifiers={[buttonStyle('plain')]}>
          <HStack modifiers={[contentShape(shapes.rectangle())]}>
            <NoteRow
              note={note}
              folderName={
                folderId
                  ? undefined
                  : (folders.find((f) => f.id === note.folderId)?.name ?? 'Notes')
              }
              preview={folderId ? notePreview(note, recordings) : undefined}
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
  const empty = !filtered.length;
  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerLargeTitleEnabled: true,
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          disabled={!available.length}
          onPress={() => router.push({ pathname: '/select-notes', params: { folderId } })}
        >
          Select
        </Stack.Toolbar.Button>
        {audio.capture || audio.playback.status !== 'idle' ? (
          <Stack.Toolbar.Button
            icon="square.and.pencil"
            accessibilityLabel="Write note"
            onPress={() => write(folderId)}
          >
            Write
          </Stack.Toolbar.Button>
        ) : null}
        <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Library actions">
          {undoDeletion.available ? (
            <Stack.Toolbar.MenuAction icon="arrow.uturn.backward" onPress={undoDeletion.undo}>
              Undo Delete
            </Stack.Toolbar.MenuAction>
          ) : null}
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
          <Stack.Toolbar.MenuAction icon="mic" onPress={() => startCapture()}>
            {audio.capture ? 'Open recorder' : 'Record'}
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="trash" onPress={() => router.push('/recently-deleted')}>
            Recently Deleted
          </Stack.Toolbar.MenuAction>
          {folderId ? (
            <Stack.Toolbar.MenuAction
              icon="pencil"
              onPress={() => router.push({ pathname: '/folder-editor', params: { id: folderId } })}
            >
              Rename folder
            </Stack.Toolbar.MenuAction>
          ) : null}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <Host style={{ flex: 1, backgroundColor: colors.grouped }}>
        <ZStack>
          <List modifiers={[listStyle('insetGrouped')]}>
            {!empty ? (
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
            ) : null}
          </List>
          {empty ? (
            <ContentUnavailableView
              title="No notes yet"
              systemImage="note.text"
              description="Write something down, or add audio to a new note."
            />
          ) : null}
        </ZStack>
      </Host>
    </>
  );
}
