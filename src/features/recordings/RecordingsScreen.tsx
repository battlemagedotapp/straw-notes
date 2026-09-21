import { useUndoDeletion } from '../notes/useUndoDeletion';
import { useAudioNavigation } from '@/features/audio/useAudioNavigation';
import {
  Button,
  ContentUnavailableView,
  ContextMenu,
  Host,
  HStack,
  List,
  Section,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import { buttonStyle, listStyle, tag, environment } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppDispatch, useAudio, useNotes, useRecordings } from '../notes/NotesProvider';
import { useAudioActions } from '../audio/useAudioActions';
import { captureStatus, formatTime } from '../audio/model';
import { dateGroup } from '../notes/presentation';
import { RecordingRow } from './RecordingRow';
import { useRecordingActions } from './useRecordingActions';

export function RecordingsScreen({ deleted = false }: { deleted?: boolean }) {
  const recordings = useRecordings();
  const { notes } = useNotes();
  const { capture } = useAudio();
  const dispatch = useAppDispatch();
  const actions = useRecordingActions();
  const audio = useAudioActions();
  const undoDeletion = useUndoDeletion('recordings');
  const router = useRouter();
  const audioNavigation = useAudioNavigation();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<'recent' | 'oldest' | 'title'>('recent');
  const items = recordings
    .filter((r) => Boolean(r.deletedAt) === deleted)
    .sort((a, b) =>
      sort === 'title'
        ? a.title.localeCompare(b.title)
        : sort === 'oldest'
          ? (deleted ? a.deletedAt! : a.createdAt).localeCompare(
              deleted ? b.deletedAt! : b.createdAt,
            )
          : (deleted ? b.deletedAt! : b.createdAt).localeCompare(
              deleted ? a.deletedAt! : a.createdAt,
            ),
    );
  const valid = selected.filter((id) => items.some((r) => r.id === id));
  const finishSelection = () => {
    setSelected([]);
    setSelecting(false);
  };
  const groups =
    sort === 'title'
      ? ['Audio']
      : [...new Set(items.map((r) => dateGroup(deleted ? r.deletedAt! : r.createdAt)))];
  const open = (id: string) => audioNavigation.openRecording(id);
  const add = (ids: string[]) =>
    router.push({ pathname: '/link-recordings', params: { ids: ids.join(',') } });
  return (
    <>
      <Stack.Screen
        options={{
          title: selecting ? valid.length + ' Selected' : deleted ? 'Deleted Audio' : 'Audio',
          headerLargeTitleEnabled: !selecting,
        }}
      />
      {selecting ? (
        <Stack.Toolbar placement="left">
          <Stack.Toolbar.Button
            onPress={() => setSelected(valid.length === items.length ? [] : items.map((r) => r.id))}
          >
            {valid.length === items.length ? 'Deselect All' : 'Select All'}
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          variant={selecting ? 'done' : 'plain'}
          onPress={() => {
            setSelecting(!selecting);
            setSelected([]);
          }}
          disabled={!items.length && !selecting}
        >
          {selecting ? 'Done' : 'Select'}
        </Stack.Toolbar.Button>
        {selecting ? (
          <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Audio selection actions">
            {!deleted ? (
              <Stack.Toolbar.MenuAction
                icon="note.text"
                disabled={!valid.length}
                onPress={() => add(valid)}
              >
                Add to Note
              </Stack.Toolbar.MenuAction>
            ) : (
              <Stack.Toolbar.MenuAction
                icon="arrow.uturn.backward"
                disabled={!valid.length}
                onPress={() => {
                  dispatch({ type: 'restoreRecordings', ids: valid });
                  finishSelection();
                }}
              >
                Restore
              </Stack.Toolbar.MenuAction>
            )}
            <Stack.Toolbar.MenuAction
              icon="trash"
              destructive
              disabled={!valid.length}
              onPress={() =>
                deleted
                  ? actions.remove(valid, finishSelection)
                  : actions.trash(valid, finishSelection)
              }
            >
              {deleted ? 'Delete permanently' : 'Delete'}
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        ) : !deleted ? (
          <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Audio library actions">
            {undoDeletion.available ? (
              <Stack.Toolbar.MenuAction icon="arrow.uturn.backward" onPress={undoDeletion.undo}>
                Undo Delete
              </Stack.Toolbar.MenuAction>
            ) : null}
            <Stack.Toolbar.MenuAction icon="mic" onPress={() => audio.startCapture()}>
              {capture ? 'Open recorder' : 'Record'}
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.MenuAction
              icon="square.and.arrow.down"
              onPress={() => router.push('/import-audio')}
            >
              Import Audio
            </Stack.Toolbar.MenuAction>
            <Stack.Toolbar.Menu title="Sort by" icon="arrow.up.arrow.down">
              {(['recent', 'oldest', 'title'] as const).map((value) => (
                <Stack.Toolbar.MenuAction
                  key={value}
                  isOn={sort === value}
                  onPress={() => setSort(value)}
                >
                  {value === 'title'
                    ? 'Title'
                    : value === 'recent'
                      ? 'Newest first'
                      : 'Oldest first'}
                </Stack.Toolbar.MenuAction>
              ))}
            </Stack.Toolbar.Menu>
            <Stack.Toolbar.MenuAction
              icon="trash"
              onPress={() => router.push('/deleted-recordings')}
            >
              Recently Deleted
            </Stack.Toolbar.MenuAction>
          </Stack.Toolbar.Menu>
        ) : null}
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List
          selection={selecting ? valid : undefined}
          onSelectionChange={(values) => {
            const next = values.map(String);
            setSelected((old) => [
              ...old.filter((id) => next.includes(id)),
              ...next.filter((id) => !old.includes(id)),
            ]);
          }}
          modifiers={[
            listStyle('insetGrouped'),
            ...(selecting ? [environment('editMode', 'active')] : []),
          ]}
        >
          {!deleted ? (
            <Section>
              <Text>Demo · Audio and edits reset on reload.</Text>
            </Section>
          ) : null}
          {!deleted && capture ? (
            <Section title="In progress">
              <Button
                onPress={() => audioNavigation.openCapture(capture.id)}
                modifiers={[buttonStyle('plain')]}
              >
                <Text>
                  {capture.title} · {captureStatus(capture)} · {formatTime(capture.elapsedMs)}
                </Text>
              </Button>
            </Section>
          ) : null}
          {!items.length ? (
            <ContentUnavailableView
              title={deleted ? 'No deleted audio' : 'No audio yet'}
              systemImage="waveform"
              description={
                deleted
                  ? 'Deleted audio appears here until you restore or permanently delete it.'
                  : 'Record a thought or import demo audio. Add it to a note whenever you like.'
              }
            />
          ) : null}
          {groups.map((group) => (
            <Section key={group} title={group}>
              {items
                .filter(
                  (r) =>
                    sort === 'title' || dateGroup(deleted ? r.deletedAt! : r.createdAt) === group,
                )
                .map((item) =>
                  selecting ? (
                    <VStack key={item.id} modifiers={[tag(item.id)]} alignment="leading">
                      <RecordingRow
                        item={item}
                        noteCount={notes.filter((n) => n.recordingIds.includes(item.id)).length}
                      />
                    </VStack>
                  ) : (
                    <ContextMenu key={item.id}>
                      <ContextMenu.Trigger>
                        <Button modifiers={[buttonStyle('plain')]} onPress={() => open(item.id)}>
                          <HStack>
                            <RecordingRow
                              item={item}
                              noteCount={
                                notes.filter((n) => n.recordingIds.includes(item.id)).length
                              }
                            />
                            <Spacer />
                          </HStack>
                        </Button>
                      </ContextMenu.Trigger>
                      <ContextMenu.Items>
                        {deleted ? (
                          <Button
                            label="Restore"
                            systemImage="arrow.uturn.backward"
                            onPress={() => dispatch({ type: 'restoreRecordings', ids: [item.id] })}
                          />
                        ) : (
                          <>
                            <Button
                              label="Rename"
                              systemImage="pencil"
                              onPress={() =>
                                router.push({
                                  pathname: '/rename-recording',
                                  params: { id: item.id },
                                })
                              }
                            />
                            <Button
                              label="Add to Note"
                              systemImage="note.text"
                              onPress={() => add([item.id])}
                            />
                          </>
                        )}
                        <Button
                          label={deleted ? 'Delete permanently' : 'Delete'}
                          systemImage="trash"
                          role="destructive"
                          onPress={() =>
                            deleted ? actions.remove([item.id]) : actions.trash([item.id])
                          }
                        />
                      </ContextMenu.Items>
                    </ContextMenu>
                  ),
                )}
            </Section>
          ))}
        </List>
      </Host>
    </>
  );
}
