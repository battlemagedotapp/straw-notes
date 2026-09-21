import { LegacyAudioRoute } from '@/features/audio/LegacyAudioRoute';
/** Old naming links reopen the existing capture workspace. */
export default function MomentRedirect() {
  return <LegacyAudioRoute kind="capture" />;
}
