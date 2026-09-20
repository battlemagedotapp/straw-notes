import { useLocalSearchParams } from 'expo-router';
import { LibraryScreen } from '@/features/library/LibraryScreen';
export default function Folder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LibraryScreen folderId={id} />;
}
