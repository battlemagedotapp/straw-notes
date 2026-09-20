import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { createId, useAppDispatch, useAudio } from '../notes/NotesProvider';
import { newNote } from '../notes/model';
import type { AudioAttachment } from '../notes/types';
import { formatTime } from './model';

export function useAudioActions() {
  const audio = useAudio();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const start = () => {
    dispatch({ type: 'audio', action: { type: 'start', id: createId(), title: 'New recording' } });
    router.push('/capture');
  };
  return {
    closePlayer(audioId: string) {
      dispatch({ type: 'audio', action: { type: 'closePlayer', audioId } });
    },
    discardRecording(captureId: string, onDiscard?: () => void) {
      const item =
        audio.capture?.id === captureId
          ? audio.capture
          : audio.pending.find((c) => c.id === captureId);
      if (!item) return;
      Alert.alert(
        'Discard this recording?',
        `The ${formatTime(item.elapsedMs)} just captured will be lost.`,
        [
          { text: 'Keep', style: 'cancel' },
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
    openPending() {
      if (audio.pending.length === 1)
        router.push({ pathname: '/destination', params: { captureId: audio.pending[0]!.id } });
      else router.push('/pending-recordings');
    },
    startRecording() {
      if (audio.capture) {
        Alert.alert(
          'Start a new recording?',
          `This stops “${audio.capture.title}” at ${formatTime(audio.capture.elapsedMs)}. The audio is kept.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Start new', onPress: start },
          ],
        );
      } else if (audio.playback.status === 'playing') {
        Alert.alert(
          'Start recording?',
          `This pauses playback at ${formatTime(audio.playback.positionMs)}. You can return to it at any time.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Start recording', onPress: start },
          ],
        );
      } else start();
    },
    write(folderId = 'personal') {
      const id = createId();
      dispatch({ type: 'create', note: newNote(id, folderId, new Date().toISOString()) });
      router.push({ pathname: '/note/[id]/edit', params: { id } });
    },
    play(item: AudioAttachment) {
      const play = () =>
        dispatch({
          type: 'audio',
          action: { type: 'play', audioId: item.id, durationMs: item.durationMs },
        });
      if (audio.capture)
        Alert.alert(
          'Finish recording to play audio?',
          'Your captured audio will be kept until you choose where to save it.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Finish and play',
              onPress: () => {
                dispatch({
                  type: 'audio',
                  action: { type: 'finish', captureId: audio.capture?.id },
                });
                play();
              },
            },
          ],
        );
      else play();
    },
  };
}
