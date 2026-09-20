import { Stack, useRouter } from 'expo-router';
import { useAppDispatch, useAudio, useNotes } from '../notes/NotesProvider';
import { useAudioActions } from './useAudioActions';

/** Return direct Router elements: its header parser does not render wrapper components. */
export function useAudioTaskAction({ attachmentIds = [] }: { attachmentIds?: string[] } = {}) {
  const { capture, playback } = useAudio();
  const { notes } = useNotes();
  const dispatch = useAppDispatch();
  const actions = useAudioActions();
  const router = useRouter();
  if (capture) {
    const status =
      capture.status === 'recording'
        ? 'Recording'
        : capture.status === 'paused'
          ? 'Paused'
          : 'Interrupted';
    return (
      <Stack.Toolbar.Menu icon="waveform" accessibilityLabel={status}>
        <Stack.Toolbar.MenuAction icon="waveform" onPress={() => router.push('/capture')}>
          Open recording
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          icon={capture.status === 'recording' ? 'pause' : 'play'}
          onPress={() => dispatch({ type: 'audio', action: { type: 'toggleCapture' } })}
        >
          {capture.status === 'recording' ? 'Pause recording' : 'Resume recording'}
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          icon="trash"
          destructive
          onPress={() => actions.discardRecording(capture.id)}
        >
          Discard recording
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    );
  }
  const item =
    playback.status === 'idle'
      ? undefined
      : notes.flatMap((n) => n.audio).find((a) => a.id === playback.audioId);
  if (!item || attachmentIds.includes(item.id)) return null;
  return (
    <Stack.Toolbar.Menu icon="waveform" accessibilityLabel={`Audio, ${item.title}`}>
      <Stack.Toolbar.MenuAction
        icon="text.bubble"
        onPress={() => router.push({ pathname: '/transcript/[id]', params: { id: item.id } })}
      >
        Open transcript
      </Stack.Toolbar.MenuAction>
      <Stack.Toolbar.MenuAction
        icon={playback.status === 'playing' ? 'pause' : 'play'}
        onPress={() => actions.play(item)}
      >
        {playback.status === 'playing' ? 'Pause audio' : 'Play audio'}
      </Stack.Toolbar.MenuAction>
      <Stack.Toolbar.MenuAction icon="xmark" onPress={() => actions.closePlayer(item.id)}>
        Close player
      </Stack.Toolbar.MenuAction>
    </Stack.Toolbar.Menu>
  );
}

export function useUnsavedRecordingsAction({ menu = false }: { menu?: boolean } = {}) {
  const { pending } = useAudio();
  const router = useRouter();
  if (!pending.length) return null;
  const label = `Unsaved recordings (${pending.length})`;
  const open = () => router.push('/pending-recordings');
  return menu ? (
    <Stack.Toolbar.MenuAction icon="tray" onPress={open}>
      {label}
    </Stack.Toolbar.MenuAction>
  ) : (
    <Stack.Toolbar.Button icon="tray" accessibilityLabel={label} onPress={open}>
      {label}
    </Stack.Toolbar.Button>
  );
}
