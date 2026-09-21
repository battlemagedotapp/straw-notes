# Audio and navigation lifecycle

Navigation presents a task; it does not own it. One provider clock advances capture or playback. All audio, imported samples and storage are session-only simulations and reset on reload.

## Resources and ownership

| State                                            | Owner                                                |
| ------------------------------------------------ | ---------------------------------------------------- |
| Notes and folders                                | Notes resource state                                 |
| Saved recordings, transcripts and marked moments | Recording resource state                             |
| Ordered recording references                     | Each note's recordingIds                             |
| Active capture and optional associated note ID   | Audio runtime state                                  |
| Player, playback rate and remembered positions   | Audio runtime state                                  |
| Save/link/import results and injected failures   | Application transaction state, keyed by operation ID |
| Link and import form drafts                      | Session flow drafts                                  |
| Routes, keyboard, sheets and accessory placement | Expo Router and UIKit                                |

A recording can be independent or referenced by multiple notes. References do not copy or move audio. Renaming a recording updates every presentation. Writing never modifies transcript content.

The application reducer is the transaction boundary. Saving capture creates one recording and clears that capture. Optional attachment is a separate operation: a failed link must never undo successful recording save. Batch linking and new-note creation are atomic. Stable capture and operation IDs make repeated and stale actions safe.

Focused contexts keep recording/notes resources independent of audio ticks. Pure models do not import React, navigation, native APIs or fixtures.

## Transitions

| Event                                     | Result and preservation rule                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- |
| Record from idle                          | Start one capture with a date/time title; open workspace                                    |
| Record while capturing                    | Open the existing capture; never replace it                                                 |
| Record while playing                      | Remember position and close player before starting capture                                  |
| Record new from a note                    | Associate the capture with that note; save and link on Finish                               |
| Write globally                            | Create an independent note and preserve audio state                                         |
| Write a note for this recording           | Create or reopen one associated note; commit writing immediately                            |
| Pause / Resume                            | Count only active recording time                                                            |
| Background                                | Interrupt recording and pause playback; foreground never resumes automatically              |
| Minimize / dismiss capture                | Preserve the task and return to its caller                                                  |
| Finish                                    | Save independently, optionally link, then return to caller; never force a destination sheet |
| Save failure                              | Retain paused capture, segments, moments and association; expose retry                      |
| Associated note disappeared / link failed | Keep saved recording, explain failure, offer optional linking retry                         |
| Discard capture                           | Confirm loss of that capture; keep writing and saved recordings                             |
| Play during capture                       | Confirm Save and play; play only if capture save succeeds                                   |
| Open detail / search match                | Navigate without autoplay; timestamp scroll does not interrupt capture                      |
| Seek / rate / pause                       | All references and accessories project the same player                                      |
| End                                       | Pause at duration and offer Replay; never loop automatically                                |
| Close player                              | Remember position and hide player; finishing capture never reopens it                       |
| Add to Note                               | Link existing recordings without consuming or copying them                                  |
| Dismiss linking sheet                     | Retain form values; leave saved recordings untouched                                        |
| Import samples                            | Commit successful items independently; retry failed items only                              |
| Dismiss import                            | Retain selection/results; never remove successful imports                                   |

An active capture appears in Audio and in its associated note, separate from saved attachments. It cannot be selected for linking until saved.

## Deletion and organization

| Action                       | Effect                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| Rename/move/pin note         | Preserve recording IDs, writing and playback                                                       |
| Delete note                  | Move to Recently Deleted; recordings and playback remain                                           |
| Permanently delete note      | Remove writing and references, not recordings                                                      |
| Remove from Note             | Remove one reference; retain recording                                                             |
| Delete recording             | Explain affected notes; move to Recently Deleted and stop only its player                          |
| Restore audio                | Reconnect retained references; never autoplay                                                      |
| Permanently delete recording | Remove its media metadata, transcript, moments, positions and references from active/deleted notes |
| Delete folder                | Move active/deleted notes to the default folder; default cannot be deleted                         |

Deleted recording references show Restore audio / Remove from Note. Recovery has no simulated automatic expiration. Only already-deleted resources can be permanently deleted. Destructive capture discard, linked-audio deletion and permanent deletion require native confirmation. Ordinary recoverable deletion offers Undo Delete in the matching library’s native More menu and Recently Deleted. The latest deletion remains undoable until replaced; no navigation-dependent timer is used.

## Presentation

Accessory priority is **capture → explicitly opened player → idle actions**. Idle actions are Record, Write and Import in the regular accessory; inline placement omits Import. Import opens the existing demo chooser and retains its session draft. There is no pending recording queue. Capture includes recording, paused, interrupted and failed-save presentations. All Record entry points become Open recorder while capture exists.

| Surface                        | Task presentation                                                |
| ------------------------------ | ---------------------------------------------------------------- |
| Notes, Audio, Folders, Search  | Native tabs and BottomAccessory                                  |
| Reader/editor                  | Native header task controls, with saved audio players in content |
| Capture and recording detail   | Workspace controls; no duplicate accessory                       |
| Linking/import/playback sheets | Native presentation; preserve underlying task                    |
| Selection                      | Resource actions; underlying audio remains unchanged             |

UIKit owns glass, width, spacing, collapse and safe areas. Regular/inline accessory instances share state, not timers. Fill native proposed bounds without another bottom inset or custom capsule. At accessibility sizes keep the regular accessory and reachable controls. Toolbars use direct Router elements; avoid empty bottom toolbars.

Audio accessories use one horizontal row: a compact leading waveform, capture status or playback title, and a 44-point Play/Pause control. Both placements use a 16-point leading inset. Only expanded placement shows elapsed time, immediately before Play/Pause. Capture shows Recording, Paused, Interrupted or Save failed instead of its generated title. Neither placement shows Close/Discard. The native bottom accessory API does not provide swipe dismissal; do not intercept its collapse gesture.

Tapping the title or waveform opens the task's canonical Router workspace: `/capture` or `/transcript/[id]`. Each is one native form sheet with compact and full detents (50% capture, 60% recording), a native grabber, and native scroll-to-expand. Controls and transcript share one scrolling owner and stay mounted as the sheet expands. Accessibility text sizes and transcript timestamp links open expanded. Compact mode disables automatic transcript following and restores the controls when collapsed; manual reading turns off the checked Follow Transcript option in the workspace’s native More menu. Enabling it returns to the current passage when expanded, including while paused. Compact mode defers following until expansion. There is no floating follow button, geometry tracking, or reserved overlay clearance. Timestamp entry and marked-moment browsing scroll only: they do not seek, autoplay, or replace the shared player.

Header X and swipe dismissal preserve audio. Capture Finish saves and returns to its caller; save failure retains the workspace with Try again. Its actions menu offers confirmed Discard, including when paused. Saved-recording actions include Dismiss player only when that recording owns the player; dismissal remembers position and returns the accessory to idle. Rename, linking and connected notes are child tasks, not additional audio players. More → Connected Notes opens a native list independently of transcript length. Closing it returns to the workspace; opening a note removes the workspace and its child task while preserving audio. Connected notes never appear as a transcript footer. Linked-note navigation and capture-associated writing remove the audio workspace before opening the note.

One audio navigation helper preserves the caller/tab state, reuses the same audio route, and replaces other audio workspaces and their task children. A short duplicate-tap gate covers the two accessory instances before navigation commits. Capture routes bind a stable capture ID; old callbacks cannot affect newer captures. The former `/capture-controls` and `/playback/[id]` routes redirect for compatibility. Root direct-link dismissal falls back to Notes for capture and Audio for saved audio. No durable-data migration is needed.

Playback titles stay static and use native single-line truncation; the open action announces the full title. Live capture smoothly interpolates provider-driven waveform samples, with no extra audio clock; pause and Reduce Motion stop the signal animation.

Routine save, link, unlink and mark operations add no completion UI. Changed content, dismissed task sheets and moment counts provide feedback. One root event listener announces deletion accessibly and presents an actionable native alert only when saved capture could not attach to its note. Notes never embed notices or active-capture status blocks. Save and link errors remain reachable through the retained capture or recording until resolved. Stale routes use meaningful titles and unavailable states.

Audio scroll views occupy the full proposed sheet width. Horizontal reading margins belong to their content stack, not the ScrollView itself, so native scroll indicators remain at the viewport edge. Router and UIKit continue to own safe areas and sheet expansion.

Saved audio references retain their embedded player, waveform, elapsed time and transcript action. Remove from Note remains below the attachment. Reader headers avoid duplicating playback controls already present in an attachment; editors retain their header controls. Capture save failure uses its status and Retry; interruption uses its status and Resume. Import/link errors remain local to their task.

Moments contain only an ID and timestamp; no editable names or naming sheet. Moment menus and lists show a short excerpt from the matching transcript passage alongside the timestamp, derived from the transcript rather than stored as a name. Capture and saved transcript passages share mark/remove context actions and a native custom preview with inner padding, bounded width and an eight-line excerpt. The full passage remains in the transcript. Saved audio additionally offers Seek; live capture cannot seek. Verify long-press previews and mark/remove in both workspaces on iPhone.
