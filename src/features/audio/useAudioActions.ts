import { useAudioNavigation } from '@/features/audio/useAudioNavigation';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { createId, useAppDispatch, useAudio } from '../notes/NotesProvider';
import { newNote } from '../notes/model';
import type { Recording } from '../notes/types';
import { formatTime } from './model';

export function useAudioActions() {
  const audio = useAudio();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const audioNavigation = useAudioNavigation();
  const openCapture = (id: string) => audioNavigation.openCapture(id);
  return {
    closePlayer(audioId: string) {
      dispatch({ type: 'audio', action: { type: 'closePlayer', audioId } });
    },
    discardCapture(captureId: string, onDiscard?: () => void) {
      const c = audio.capture;
      if (c?.id !== captureId) return;
      Alert.alert(
        'Discard audio?',
        `The ${formatTime(c.elapsedMs)} just captured will be lost. Any writing is kept.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              dispatch({ type: 'audio', action: { type: 'discard', captureId } });
              onDiscard?.();
            },
          },
        ],
      );
    },
    startCapture(noteId?: string) {
      if (audio.capture) {
        openCapture(audio.capture.id);
        return;
      }
      const now = new Date();
      const captureId = createId();
      dispatch({
        type: 'audio',
        action: {
          type: 'start',
          id: captureId,
          title:
            'Audio · ' +
            now.toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
          noteId,
        },
      });
      openCapture(captureId);
    },
    write(folderId = 'personal') {
      const id = createId();
      dispatch({ type: 'create', note: newNote(id, folderId, new Date().toISOString()) });
      router.push({ pathname: '/note/[id]/edit', params: { id } });
    },
    writeForCapture() {
      const c = audio.capture;
      if (!c) return;
      const id = c.noteId ?? createId();
      if (!c.noteId)
        dispatch({
          type: 'writeForCapture',
          captureId: c.id,
          note: newNote(id, 'personal', new Date().toISOString()),
        });
      audioNavigation.openNote(id, true);
    },
    finish(captureId: string) {
      dispatch({ type: 'finishCapture', captureId, now: new Date().toISOString() });
    },
    play(item: Recording) {
      if (audio.capture) {
        const captureId = audio.capture.id;
        Alert.alert('Save and play?', 'Save your current audio before playback starts.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save and play',
            onPress: () =>
              dispatch({
                type: 'finishCapture',
                captureId,
                now: new Date().toISOString(),
                playAfterId: item.id,
              }),
          },
        ]);
      } else
        dispatch({
          type: 'audio',
          action: { type: 'play', audioId: item.id, durationMs: item.durationMs },
        });
    },
  };
}
