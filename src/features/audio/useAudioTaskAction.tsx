import { useAudioNavigation } from '@/features/audio/useAudioNavigation';
import { Stack } from 'expo-router';
import { useAppDispatch, useAudio, useRecordings } from '../notes/NotesProvider';
import { useAudioActions } from './useAudioActions';
import { captureStatus } from './model';

/** Return direct Router elements: its header parser does not render wrapper components. */
export function useAudioTaskAction({ attachmentIds = [] }: { attachmentIds?: string[] } = {}) {
  const { capture, playback } = useAudio();
  const recordings = useRecordings();
  const dispatch = useAppDispatch();
  const actions = useAudioActions();
  const audioNavigation = useAudioNavigation();
  if (capture) {
    return (
      <Stack.Toolbar.Menu icon="mic" accessibilityLabel={captureStatus(capture)}>
        <Stack.Toolbar.MenuAction
          icon="mic"
          onPress={() => audioNavigation.openCapture(capture.id)}
        >
          Open recorder
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          icon={capture.status === 'recording' ? 'pause' : 'play'}
          onPress={() =>
            dispatch({ type: 'audio', action: { type: 'toggleCapture', captureId: capture.id } })
          }
        >
          {capture.status === 'recording' ? 'Pause' : 'Resume'}
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          icon="trash"
          destructive
          onPress={() => actions.discardCapture(capture.id)}
        >
          Discard…
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    );
  }
  const item =
    playback.status === 'idle'
      ? undefined
      : recordings.find((a) => !a.deletedAt && a.id === playback.audioId);
  if (!item || attachmentIds.includes(item.id)) return null;
  return (
    <Stack.Toolbar.Menu icon="waveform" accessibilityLabel={`Audio, ${item.title}`}>
      <Stack.Toolbar.MenuAction
        icon="waveform"
        onPress={() => audioNavigation.openRecording(item.id)}
      >
        Open audio
      </Stack.Toolbar.MenuAction>
      <Stack.Toolbar.MenuAction
        icon={
          playback.status === 'playing'
            ? 'pause'
            : playback.status !== 'idle' && playback.positionMs >= item.durationMs
              ? 'arrow.counterclockwise'
              : 'play'
        }
        onPress={() => actions.play(item)}
      >
        {playback.status === 'playing'
          ? 'Pause audio'
          : playback.status !== 'idle' && playback.positionMs >= item.durationMs
            ? 'Replay audio'
            : 'Play audio'}
      </Stack.Toolbar.MenuAction>
      <Stack.Toolbar.MenuAction icon="xmark" onPress={() => actions.closePlayer(item.id)}>
        Dismiss player
      </Stack.Toolbar.MenuAction>
    </Stack.Toolbar.Menu>
  );
}
