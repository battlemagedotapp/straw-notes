import { useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useAudio } from '../notes/NotesProvider';
import { useAudioNavigation } from './useAudioNavigation';

/** Retain old links without retaining another audio screen in the stack. */
export function LegacyAudioRoute({ kind }: { kind: 'capture' | 'recording' }) {
  const { id, at, expanded } = useLocalSearchParams<{
    id?: string;
    at?: string;
    expanded?: string;
  }>();
  const { capture } = useAudio();
  const navigation = useAudioNavigation();
  const applied = useRef(false);
  useEffect(() => {
    if (applied.current) return;
    applied.current = true;
    navigation.openLegacy(
      kind === 'capture'
        ? { kind, id: id ?? capture?.id ?? 'unavailable', expanded: expanded === '1' }
        : {
            kind,
            id: id ?? 'unavailable',
            at: at === undefined ? undefined : Number(at),
            expanded: expanded === '1',
          },
    );
  }, [kind, id, at, expanded, capture, navigation]);
  return null;
}
