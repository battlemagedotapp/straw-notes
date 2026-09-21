import {
  Button,
  ContextMenu,
  Host,
  HStack,
  Image,
  List,
  Section,
  Spacer,
  Text,
  VStack,
} from '@expo/ui/swift-ui';
import {
  buttonStyle,
  font,
  foregroundColor,
  listStyle,
  contentShape,
  shapes,
  frame,
} from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/ui/tokens';
import { useAudio, useDeletedNotes, useNotes } from '../notes/NotesProvider';
import { useAudioActions } from '../audio/useAudioActions';
import { useFolderActions } from './useFolderActions';
import type { Folder } from '../notes/types';
export function FoldersScreen() {
  const { folders, notes } = useNotes();
  const removed = useDeletedNotes();
  const audio = useAudio();
  const { write } = useAudioActions();
  const { remove } = useFolderActions();
  const router = useRouter();
  const rename = (folder: Folder) =>
    router.push({ pathname: '/folder-editor', params: { id: folder.id } });
  return (
    <>
      <Stack.Screen options={{ title: 'Folders', headerLargeTitleEnabled: true }} />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={() => router.push('/select-folders')}>
          Select
        </Stack.Toolbar.Button>
        {audio.capture || audio.playback.status !== 'idle' ? (
          <Stack.Toolbar.Button icon="square.and.pencil" onPress={() => write()}>
            Write
          </Stack.Toolbar.Button>
        ) : null}
        <Stack.Toolbar.Button
          icon="plus"
          accessibilityLabel="New folder"
          onPress={() => router.push('/folder-editor')}
        >
          New folder
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section
            header={
              <VStack alignment="leading" spacing={12}>
                <Text
                  modifiers={[
                    font({ textStyle: 'subheadline' }),
                    foregroundColor(colors.secondary),
                  ]}
                >
                  On this iPhone
                </Text>
                <Text>My folders</Text>
              </VStack>
            }
          >
            {folders.map((folder) => {
              const count = notes.filter((n) => n.folderId === folder.id).length;
              return (
                <ContextMenu key={folder.id}>
                  <ContextMenu.Trigger>
                    <Button
                      modifiers={[buttonStyle('plain')]}
                      onPress={() =>
                        router.push({
                          pathname: '/(tabs)/folders/[id]',
                          params: { id: folder.id },
                        })
                      }
                    >
                      <HStack spacing={12} modifiers={[contentShape(shapes.rectangle())]}>
                        <Image
                          systemName="folder"
                          modifiers={[foregroundColor(colors.signal), frame({ width: 28 })]}
                        />
                        <VStack alignment="leading" spacing={3}>
                          <Text modifiers={[font({ textStyle: 'headline' })]}>{folder.name}</Text>
                          <Text
                            modifiers={[
                              font({ textStyle: 'subheadline' }),
                              foregroundColor(colors.secondary),
                            ]}
                          >
                            {count ? `${count} note${count === 1 ? '' : 's'}` : 'No notes yet'}
                          </Text>
                        </VStack>
                        <Spacer />
                        <Image
                          systemName="chevron.right"
                          modifiers={[
                            font({ textStyle: 'caption', weight: 'semibold' }),
                            foregroundColor(colors.secondary),
                          ]}
                        />
                      </HStack>
                    </Button>
                  </ContextMenu.Trigger>
                  <ContextMenu.Items>
                    <Button
                      label="Rename folder"
                      systemImage="pencil"
                      onPress={() => rename(folder)}
                    />
                    {folder.id !== 'personal' ? (
                      <Button
                        label="Delete folder"
                        systemImage="trash"
                        role="destructive"
                        onPress={() => remove([folder.id])}
                      />
                    ) : null}
                  </ContextMenu.Items>
                </ContextMenu>
              );
            })}
          </Section>
          <Section>
            <Button
              modifiers={[buttonStyle('plain')]}
              onPress={() => router.push('/recently-deleted')}
            >
              <HStack spacing={12} modifiers={[contentShape(shapes.rectangle())]}>
                <Image
                  systemName="trash"
                  modifiers={[foregroundColor(colors.signal), frame({ width: 28 })]}
                />
                <VStack alignment="leading" spacing={3}>
                  <Text modifiers={[font({ textStyle: 'headline' })]}>Recently Deleted</Text>
                  <Text
                    modifiers={[
                      font({ textStyle: 'subheadline' }),
                      foregroundColor(colors.secondary),
                    ]}
                  >
                    {removed.length} notes
                  </Text>
                </VStack>
                <Spacer />
                <Image
                  systemName="chevron.right"
                  modifiers={[font({ textStyle: 'caption' }), foregroundColor(colors.secondary)]}
                />
              </HStack>
            </Button>
          </Section>
        </List>
      </Host>
    </>
  );
}
