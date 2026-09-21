# iPhone validation

Linux checks establish type/dependency/bundle correctness, not native rendering. Use SDK 57-compatible Expo Go on iOS 26+ and the [shared iPhone tooling](ios-automation.md). Keep numbered screenshots and session results in ignored artifacts/device/.

## Resource journeys

- Browse Notes, Audio, Folders and native Search. Verify native tab separation without custom sizing.
- Record, pause/resume, mark/remove, minimize, switch tabs and Finish. The caller returns; one saved recording appears without requiring a note.
- Inject a capture save failure; verify paused capture and retry preserve duration, moments and transcript. Repeat Finish rapidly and attempt stale actions.
- Record from a note. Write during capture and return; keep the recorder accessible in the header. Finish replaces it with a reference. Discard keeps writing.
- Delete an associated note before Finish, or inject a link failure. Saving must still create the recording; retry linking must not duplicate it or revive a deleted note.
- Add one recording to two notes. Rename it and verify both references. Add multiple recordings from the note picker; already-linked rows cannot duplicate references.
- Close/swipe linking forms, reopen, and verify input/selection. Remove a source or destination before submission; require correction without partial attachment or phantom notes.
- Import several demo samples, including unsupported and retryable failure cases. Retry only failed items; successful imports stay saved. Close/reopen retains review state.
- Search writing, recording titles and transcript-only phrases. Shared audio appears once. Timestamp entry scrolls without autoplay or interrupting capture.
- Open missing and deleted note/recording routes; verify useful titles and recovery paths.

## Shared task state

- Check recording, paused, interrupted and save-failed capture in the regular/inline accessory, library and associated note.
- Other Record actions must reopen capture. Test Save and play, including Cancel and failed save.
- Play/pause, seek, rate, end/replay, switch audio and Close across note references, recording workspace and accessory.
- Tap title/waveform in both accessory placements; expand by scrolling and grabber, scroll the transcript, then collapse. There must be one workspace, no duplicate timer, and controls return when collapsed. Live updates must not scroll compact controls away.
- Open the same workspace rapidly, switch audio from within a workspace, and close child rename/linking sheets. Preserve the caller/tab and prevent duplicate audio routes. Open legacy playback/capture-controls URLs.
- X/swipe keeps audio; Dismiss player returns idle and remembers position. Finish returns to the caller; retry retains capture on failure; Discard confirms even while paused. Writing and Connected Notes leave the workspace and do not reveal it again on Back.
- Open search timestamps and marked moments without seeking/autoplay or changing capture; verify expanded initial timestamp position and the native More → Follow Transcript checkmark. Manual scrolling and moment browsing turn it off; toggling it on returns to the current passage without changing playback. Compact mode retains controls and defers following until expansion. No floating arrow should remain. Verify the native slider stays centered over the decorative waveform, remains reachable, and never seeks during capture. Check caption-size bookmark alignment and native Moments menu selection without another workspace. Check root direct-link fallback and stale capture IDs.

- Starting capture remembers playback position; finishing/discarding never automatically resumes old playback.
- Navigate through editor keyboard, native sheets, selection, tab collapse and background/foreground. No second clock, duplicated task chrome, lost state or forced tab switch.

## Organization and recovery

- Pin/sort/move notes; validate folder names and default-folder protection. Folder deletion moves active/deleted notes without changing references.
- Remove an attachment and delete its note while playing: recording and playback remain.
- Delete linked audio after reviewing affected notes: only that recording's player stops; notes retain recoverable references.
- Restore audio and verify all retained references reconnect without autoplay. Permanent deletion removes references from active and deleted notes.
- Check native library More → Undo Delete, selection/batch actions, empty Recently Deleted and cancelled destructive confirmations.
- Rename with keyboard and swipe dismissal; verify Save/Discard/Keep editing behavior.
- Reload resets all demo content and draft state.

## Visual and accessibility acceptance

- Native control typography, materials and runtime geometry take precedence over Penpot pixels.
- Verify audio scroll indicators stay at the sheet edge in compact/full states while content keeps its reading margin. Open More → Connected Notes with zero, one and multiple notes; close back to the same player, and open a note without retaining duplicate audio sheets.
- Verify final rows clear controls, no duplicate safe areas or retained empty toolbar space, and no keyboard/sheet obstruction.
- Test light/dark appearance, long names, missing transcripts, accessibility text sizes, Reduce Motion and Reduce Transparency.
- Inspect VoiceOver reading order, labels, announcements and native Slider seeking on-device. WDA element labels alone do not establish VoiceOver correctness.
- Review additional iPhone widths when available; explicitly report untested hardware/settings as pending.

- Save, link, unlink and mark must not insert feedback into lists, notes, editors or workspaces. Verify no temporary block precedes the editor title. Check that saved audio attachments retain their embedded playback controls and transcript action. Delete and navigate away/back: Undo Delete must remain available, restore the latest deleted batch, and not replay announcements. A failed automatic attachment alerts once and leaves recovery in the saved audio workspace.

Moments contain only an ID and timestamp; no editable names or naming sheet. Moment menus and lists show a short excerpt from the matching transcript passage alongside the timestamp, derived from the transcript rather than stored as a name. Capture and saved transcript passages share mark/remove context actions and a native custom preview with inner padding, bounded width and an eight-line excerpt. The full passage remains in the transcript. Saved audio additionally offers Seek; live capture cannot seek. Verify long-press previews and mark/remove in both workspaces on iPhone.
