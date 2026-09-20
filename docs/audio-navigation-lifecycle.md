# Audio and navigation lifecycle

Navigation changes the presentation, not the audio task. One provider clock advances the pure audio reducer; regular and inline accessories only display its state. All data is session-only and resets on reload. Penpot sources and native substitutions live in [the design map](design-map.md).

## Ownership

| State                                                            | Owner                                  |
| ---------------------------------------------------------------- | -------------------------------------- |
| Notes, folders, attachments and deleted notes                    | Notes reducer                          |
| Capture: absent, recording, paused or interrupted                | Audio reducer                          |
| Finished captures and per-capture save errors                    | Audio reducer                          |
| Player: idle, playing or paused; remembered attachment positions | Audio reducer                          |
| Destination title, folder, selection and search query            | DestinationDrafts, keyed by capture ID |
| Search, sorting, selection and temporary name input              | Screen-local state                     |
| Routes, sheets, keyboard handling and accessory placement        | Expo Router/native navigation          |

`NotesProvider` exposes focused contexts so audio ticks do not change the notes context. The notes reducer atomically attaches audio and removes its pending capture. Visual components receive data and callbacks; controllers own navigation and confirmations. Recording and playback never advance simultaneously.

## Transition chart

| Event                                  | Result                                                    | Preservation rule                                                   |
| -------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| Record from idle                       | Start capture; open workspace                             | One capture and one clock                                           |
| Write in any state                     | Open a new editor                                         | Keep audio; commit writing immediately                              |
| Pause / Resume                         | Freeze / resume elapsed time                              | Count only active time                                              |
| Background / foreground                | Interrupt capture, pause playback / retain that state     | Resume explicitly; no real background-recording guarantee           |
| Mark / name                            | Add timestamp, optionally edit its name                   | Keep capture running; cancelling naming retains the mark            |
| Minimize recording or leave transcript | Return to caller                                          | Keep task and position                                              |
| Discard capture                        | Confirm, then remove the identified capture               | Cancel changes nothing; other captures survive                      |
| Finish                                 | Move capture to pending; open destination                 | Repeated Finish cannot duplicate it                                 |
| Close/swipe destination                | Return to caller                                          | Keep audio and entered fields                                       |
| Save                                   | Validate destination and attach once; open note           | Preserve writing; consume only the matching pending capture         |
| Save fails or destination disappears   | Show error; allow correction/retry                        | Keep capture/draft; no phantom note or silent retargeting           |
| Start another capture                  | Confirm, keep previous capture pending, start new         | Do not lose prior audio                                             |
| Record during playback                 | Confirm, close player and start capture                   | Remember listening position; cancel leaves playback unchanged       |
| Play during capture                    | Confirm Finish and play                                   | Keep finished capture pending; cancel leaves capture unchanged      |
| Play attachment                        | Resume remembered position, or replay from zero after end | One active player                                                   |
| Pause / seek / speed change            | Update shared player                                      | Every placement agrees                                              |
| Natural end                            | Pause at duration; offer Replay                           | No automatic loop                                                   |
| Close player                           | Stop clock and hide global player                         | No confirmation; keep attachment and remembered position            |
| Switch attachment                      | Play selected attachment                                  | Remember previous position; no second clock                         |
| Move/rename/pin note                   | Update organization/labels                                | Keep writing, audio identity and playback                           |
| Trash playing note                     | Close its player                                          | Preserve unrelated capture/pending audio; restore does not autoplay |
| Delete folder                          | Move its active/deleted notes to default folder           | Default folder cannot be deleted                                    |
| Permanent delete                       | Confirm removal of already-deleted notes                  | Never remove an active note through this action                     |

Delayed actions target stable capture/attachment IDs. Saving, discarding or finishing one item must not consume another. Successful attachment or confirmed discard clears that capture’s draft/error.

## Presentation

Accessory priority is **capture → explicitly opened player → pending recordings → Record/Write**. A pending-recordings toolbar action keeps unsaved audio reachable when capture/player occupies the accessory. Closing or finishing a task never automatically reopens an old player.

| Route                             | Controls                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Notes, Folders, Search            | Native tabs and BottomAccessory; native keyboard/focus behavior                                              |
| Reader/editor                     | Native header audio menu for capture or another attachment; no duplicate player for the displayed attachment |
| Recording/transcript              | Workspace transport; no global accessory duplication                                                         |
| Destination/naming/playback sheet | Native sheet controls; dismissal returns to caller                                                           |
| Selection                         | Native header actions; audio continues without task chrome                                                   |
| Missing note/audio                | Unavailable state and native back path                                                                       |

UIKit owns accessory glass, geometry and collapse. Fill its proposed bounds without another safe-area inset, custom capsule, keyboard listener or tab-height calculation. Keep the regular accessory at accessibility text sizes. Document and selection actions use headers; do not mount empty bottom toolbars. Header children must be direct Router elements, so shared toolbar hooks return those elements rather than component wrappers.

Minimize is harmless navigation; Close player stops listening; Discard destroys unsaved audio after confirmation. Keep these labels distinct. See [device validation](device-validation.md) for the interaction and visual checks; reducer tests cannot establish native behavior.
