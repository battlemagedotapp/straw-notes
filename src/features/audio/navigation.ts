/** Audio presentation decisions are separate from playback/capture state. */
export type AudioTarget =
  | { kind: 'capture'; id: string; expanded?: boolean }
  | { kind: 'recording'; id: string; at?: number; expanded?: boolean };
export const audioRouteNames = [
  'capture',
  'transcript/[id]',
  'capture-controls',
  'playback/[id]',
  'moment',
];
/** Invalid external timestamps behave like ordinary entries, never NaN scroll targets. */
export function transcriptTime(value: string | number | undefined): number | undefined {
  if (value === undefined || (typeof value === 'string' && !value.trim())) return undefined;
  const time = Number(value);
  return Number.isFinite(time) ? Math.max(0, time) : undefined;
}

export function audioRoute(target: AudioTarget) {
  const at = target.kind === 'recording' ? transcriptTime(target.at) : undefined;
  return {
    name: target.kind === 'capture' ? 'capture' : 'transcript/[id]',
    params: {
      id: target.id,
      ...(target.expanded || at !== undefined ? { expanded: '1' } : {}),
      ...(at !== undefined ? { at: String(at) } : {}),
    },
  };
}
export function audioRouteIndex(routes: readonly { name: string }[]) {
  return routes.findIndex((route) => audioRouteNames.includes(route.name));
}
export function sameAudioRoute(
  route: { name: string; params?: object },
  target: ReturnType<typeof audioRoute>,
) {
  const params = route.params as { id?: string } | undefined;
  return route.name === target.name && params?.id === target.params.id;
}

/** Preserve the caller and its nested tab state; remove audio task children. */
export function workspaceRoutes<T extends { name: string; key: string; params?: object }>(
  routes: readonly T[],
  destination: T,
): T[] {
  const index = audioRouteIndex(routes);
  return index < 0 ? [...routes, destination] : [...routes.slice(0, index), destination];
}
export function createAudioOpenGate() {
  let pending: { key: string; until: number } | undefined;
  return (key: string, now: number) => {
    if (pending?.key === key && pending.until > now) return false;
    pending = { key, until: now + 500 };
    return true;
  };
}
