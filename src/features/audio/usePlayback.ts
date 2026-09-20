import { useAppDispatch, useAudio } from '../notes/NotesProvider';
import type { AudioAttachment } from '../notes/types';
import { useAudioActions } from './useAudioActions';

export interface PlaybackControls {
  title: string;
  durationMs: number;
  positionMs: number;
  playing: boolean;
  seekingDisabled: boolean;
  onToggle: () => void;
  onSeek: (positionMs: number) => void;
}
export function usePlayback(item: AudioAttachment): PlaybackControls {
  const { playback, capture, listeningPositions } = useAudio();
  const dispatch = useAppDispatch();
  const { play } = useAudioActions();
  const current = playback.status !== 'idle' && playback.audioId === item.id ? playback : null;
  return {
    title: item.title,
    durationMs: item.durationMs,
    positionMs: current?.positionMs ?? listeningPositions[item.id] ?? 0,
    playing: current?.status === 'playing',
    seekingDisabled: Boolean(capture),
    onToggle: () => play(item),
    onSeek: (positionMs) =>
      dispatch({
        type: 'audio',
        action: { type: 'seek', audioId: item.id, durationMs: item.durationMs, positionMs },
      }),
  };
}
