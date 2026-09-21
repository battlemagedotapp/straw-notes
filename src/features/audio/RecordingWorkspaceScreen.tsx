import { useAudioActions } from './useAudioActions';
import { Button, ContentUnavailableView, Host, Divider, Text, VStack } from '@expo/ui/swift-ui';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/ui/tokens';
import {
  createId,
  useAppDispatch,
  useRecordings,
  useOperations,
  useAudio,
} from '../notes/NotesProvider';
import { TranscriptPassages } from './TranscriptPassages';
import { useRecordingActions } from '../recordings/useRecordingActions';
import { PlaybackControls } from './PlaybackControls';
import { useWorkspaceSheet } from './useWorkspaceSheet';
import { WorkspaceMoments } from './WorkspaceMoments';
import { usePlayback } from './usePlayback';
import { transcriptTime } from './navigation';
import type { Recording } from '../notes/types';

function RecordingWorkspace({
  item,
  at,
  sheet,
}: {
  item: Recording;
  at?: number;
  sheet: ReturnType<typeof useWorkspaceSheet>;
}) {
  const controls = usePlayback(item);
  const [jump, setJump] = useState<{ timeMs: number; key: number } | undefined>();
  const [following, setFollowing] = useState(at === undefined);
  const { closePlayer } = useAudioActions();
  const dispatch = useAppDispatch();
  const operations = useOperations();
  const { playback } = useAudio();
  const recordingActions = useRecordingActions();
  const router = useRouter();

  const header = (
    <VStack alignment="leading" spacing={12}>
      <PlaybackControls controls={controls} />
      {operations['capture-link:' + item.id]?.status === 'error' ? (
        <VStack alignment="leading" spacing={6}>
          <Text>Saved, but not added to the note.</Text>
          <Button
            label="Choose note or retry"
            systemImage="note.text"
            onPress={() =>
              router.push({
                pathname: '/link-recordings',
                params: { ids: item.id, operationId: 'capture-link:' + item.id },
              })
            }
          />
        </VStack>
      ) : null}
      <Divider />
      <WorkspaceMoments
        moments={item.moments}
        segments={item.segments}
        onSelect={(timeMs) => {
          setFollowing(false);
          setJump({ timeMs, key: Date.now() });
        }}
      />
    </VStack>
  );
  return (
    <>
      <Stack.Screen options={{ ...sheet.options, title: item.title }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="xmark" accessibilityLabel="Close audio" onPress={sheet.close}>
          Close
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="square.and.pencil"
          accessibilityLabel="Add to Note"
          onPress={() => router.push({ pathname: '/link-recordings', params: { ids: item.id } })}
        >
          Add to Note
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Audio actions">
          <Stack.Toolbar.MenuAction
            icon="text.alignleft"
            isOn={following}
            onPress={() => setFollowing((value) => !value)}
          >
            Follow Transcript
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon="note.text"
            onPress={() => router.push({ pathname: '/recording-notes', params: { id: item.id } })}
          >
            Connected Notes
          </Stack.Toolbar.MenuAction>
          {playback.status !== 'idle' && playback.audioId === item.id ? (
            <Stack.Toolbar.MenuAction
              icon="xmark.circle"
              onPress={() => {
                closePlayer(item.id);
                sheet.close();
              }}
            >
              Dismiss player
            </Stack.Toolbar.MenuAction>
          ) : null}
          <Stack.Toolbar.MenuAction
            icon="pencil"
            onPress={() => router.push({ pathname: '/rename-recording', params: { id: item.id } })}
          >
            Rename
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon="note.text"
            onPress={() => router.push({ pathname: '/link-recordings', params: { ids: item.id } })}
          >
            Add to Note
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon="trash"
            destructive
            onPress={() => recordingActions.trash([item.id], sheet.close)}
          >
            Delete
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <Host style={{ flex: 1, backgroundColor: colors.background }}>
        <VStack spacing={0}>
          <TranscriptPassages
            segments={item.segments}
            header={header}
            initialTimeMs={at}
            jump={jump}
            followEnabled={sheet.isExpanded}
            following={following}
            onManualScroll={() => setFollowing(false)}
            positionMs={controls.positionMs}
            moments={item.moments}
            onSeek={controls.onSeek}
            onToggleMoment={(timeMs) =>
              dispatch({ type: 'toggleRecordingMoment', audioId: item.id, timeMs, id: createId() })
            }
          />
        </VStack>
      </Host>
    </>
  );
}
export function RecordingWorkspaceScreen() {
  const { id, at } = useLocalSearchParams<{ id: string; at?: string }>();
  const sheet = useWorkspaceSheet('recording');
  const item = useRecordings().find((a) => a.id === id);
  const dispatch = useAppDispatch();
  const actions = useRecordingActions();
  return item && !item.deletedAt ? (
    <RecordingWorkspace
      key={`${id}:${at ?? ''}`}
      item={item}
      at={transcriptTime(at)}
      sheet={sheet}
    />
  ) : (
    <>
      <Stack.Screen
        options={{ ...sheet.options, title: item ? 'Deleted Audio' : 'Audio unavailable' }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="xmark" accessibilityLabel="Close audio" onPress={sheet.close}>
          Close
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <VStack spacing={16}>
          <ContentUnavailableView
            title={item ? 'Audio deleted' : 'Audio unavailable'}
            description={item?.title}
            systemImage="waveform"
          />
          {item ? (
            <>
              <Button
                label="Restore audio"
                systemImage="arrow.uturn.backward"
                onPress={() => dispatch({ type: 'restoreRecordings', ids: [id] })}
              />
              <Button
                label="Delete permanently"
                systemImage="trash"
                role="destructive"
                onPress={() => actions.remove([id], sheet.close)}
              />
            </>
          ) : null}
        </VStack>
      </Host>
    </>
  );
}
