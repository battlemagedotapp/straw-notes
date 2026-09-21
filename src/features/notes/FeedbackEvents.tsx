import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useNotice } from './NotesProvider';

/** One event listener, no layout: routine success is conveyed by the resulting content. */
export function FeedbackEvents() {
  const notice = useNotice();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const announced = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!notice || announced.current === notice.id) return;
    announced.current = notice.id;
    if (notice.undo) {
      AccessibilityInfo.announceForAccessibility(
        `${notice.message}. Undo Delete is in the library menu.`,
      );
    } else if (notice.recordingId) {
      Alert.alert(
        'Audio saved separately',
        'It couldn’t be added to the note. Your audio is safe in Audio.',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Review Audio', onPress: () => router.navigate('/(tabs)/recordings') },
        ],
      );
      dispatch({ type: 'clearNotice', id: notice.id });
    }
  }, [notice, dispatch, router]);
  return null;
}
