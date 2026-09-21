import { useEffect, useState } from 'react';
import type { NavigationProp, NavigationState, ParamListBase } from 'expo-router/react-navigation';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useAccessibility } from '@/ui/useAccessibility';
import { transcriptTime } from './navigation';

export function useWorkspaceSheet(kind: 'capture' | 'recording') {
  const { expanded, at, caller } = useLocalSearchParams<{
    expanded?: string;
    at?: string;
    caller?: string;
  }>();
  const { largeText } = useAccessibility();
  const initialExpanded = largeText || expanded === '1' || transcriptTime(at) !== undefined;
  const [isExpanded, setExpanded] = useState(initialExpanded);
  const router = useRouter();
  const navigation =
    useNavigation<
      NavigationProp<
        ParamListBase,
        string,
        undefined,
        NavigationState<ParamListBase>,
        object,
        { sheetDetentChange: { data: { index: number; stable: boolean } } }
      >
    >();
  useEffect(
    () => navigation.addListener('sheetDetentChange', ({ data }) => setExpanded(data.index === 1)),
    [navigation],
  );
  return {
    isExpanded,
    options: {
      presentation: 'formSheet' as const,
      sheetAllowedDetents: kind === 'capture' ? [0.5, 1] : [0.6, 1],
      sheetInitialDetentIndex: initialExpanded ? 1 : 0,
      sheetGrabberVisible: true,
      sheetExpandsWhenScrolledToEdge: true,
    },
    close: () => {
      if (caller === '1' && router.canGoBack()) router.back();
      else {
        router.dismissAll();
        router.navigate(kind === 'capture' ? '/(tabs)/notes' : '/(tabs)/recordings');
      }
    },
  };
}
