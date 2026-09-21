import type { NavigationProp, ParamListBase } from 'expo-router/react-navigation';
import { useNavigation, useRouter } from 'expo-router';
import {
  audioRoute,
  audioRouteIndex,
  sameAudioRoute,
  workspaceRoutes,
  createAudioOpenGate,
  type AudioTarget,
} from './navigation';

// Both native accessory instances can receive taps before navigation commits.
const allowOpen = createAudioOpenGate();
export function useAudioNavigation() {
  const root = useNavigation<NavigationProp<ParamListBase>>('/');
  const router = useRouter();
  const open = (target: AudioTarget, legacy = false) => {
    const route = audioRoute(target);
    const destination = {
      ...route,
      params: { ...route.params, ...(!legacy ? { caller: '1' } : {}) },
    };
    const key = JSON.stringify(destination);
    if (!allowOpen(key, Date.now())) return;
    const state = root.getState();
    const index = state ? audioRouteIndex(state.routes) : -1;
    if (state && index >= 0) {
      const existing = state.routes[index]!;
      const same =
        sameAudioRoute(existing, destination) &&
        (!destination.params.expanded ||
          (existing.params as { expanded?: string })?.expanded === '1');
      root.reset({
        ...state,
        index,
        routes: workspaceRoutes(
          state.routes,
          same
            ? { ...existing, params: { ...existing.params, ...destination.params } }
            : { ...destination, key: destination.name + ':' + target.id + ':' + Date.now() },
        ),
      });
      return;
    }
    if (target.kind === 'capture')
      router.push({ pathname: '/capture', params: destination.params });
    else router.push({ pathname: '/transcript/[id]', params: destination.params });
  };
  return {
    openLegacy: (target: AudioTarget) => open(target, true),
    openCapture: (id: string, expanded = false) => open({ kind: 'capture', id, expanded }),
    openRecording: (id: string, at?: number, expanded = false) =>
      open({ kind: 'recording', id, at, expanded }),
    openNote: (id: string, edit = false) => {
      const state = root.getState();
      const index = state ? audioRouteIndex(state.routes) : -1;
      const name = edit ? 'note/[id]/edit' : 'note/[id]/index';
      if (state && index >= 0) {
        const base = state.routes.slice(0, index);
        const existing = base.findIndex(
          (route) => route.name === name && (route.params as { id?: string })?.id === id,
        );
        const routes =
          existing >= 0
            ? base.slice(0, existing + 1)
            : [...base, { name, key: name + ':' + id + ':' + Date.now(), params: { id } }];
        root.reset({ ...state, routes, index: routes.length - 1 });
      } else router.navigate({ pathname: edit ? '/note/[id]/edit' : '/note/[id]', params: { id } });
    },
  };
}
