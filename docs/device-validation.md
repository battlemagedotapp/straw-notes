# iPhone validation

Linux checks establish type/dependency/bundle correctness, not native rendering. Use SDK 57-compatible Expo Go on iOS 26+ and the [shared iPhone tooling](ios-automation.md). Record device/client versions, exercised flows and limitations in the review conversation; keep screenshots in ignored `artifacts/device/`.

## Core flow

- Browse Notes/Folders; search note text and transcript-only phrases. Open a transcript result at its timestamp; verify native search focus, typing and clear.
- Write/edit, dismiss the keyboard, navigate away and return. Writing survives until reload and remains independent of transcripts.
- Record, pause, wait, resume, mark/name a moment, minimize and switch tabs. One clock advances only active recording time. Follow live returns to the newest passage after manual scrolling.
- Write while recording; Done returns to a reader with a back path. Capture stays reachable through the header audio menu.
- Finish into an existing note and a new note in another folder. Dismiss/reopen destination: fields and audio remain. Simulate failed save from `/scenarios`; retry attaches once without overwriting writing or creating a phantom note.
- Play/pause, seek and change speed across attachment, transcript, playback sheet and accessory. Close retains position. Switching recordings preserves independent positions; natural end offers Replay.
- Cancel and confirm recording/playback conflicts, second capture and discard. Pending recordings remain individually recoverable. Background/foreground preserves an interrupted session until explicit Resume/Finish.

## Organization and forms

- Pin/unpin, sort, select/move, trash and restore notes without losing contents. Permanent deletion only affects deleted notes after confirmation.
- Create/rename folders; reject blank/duplicate names. Deleting a folder moves its notes to the default, which cannot be deleted.
- Dismiss clean and dirty name forms, including swipe gestures; verify Save/Discard/Keep editing and keyboard behavior. Removing a chosen destination requires correction without consuming pending audio.
- Reload resets the demo; stale note/audio routes show useful unavailable states.

## Visual and accessibility review

- Compare custom composition hierarchy to linked Penpot boards. Native control geometry and materials take precedence.
- Check regular/inline accessory transitions for idle, capture, player and pending states. Content scrolls behind glass; the final row clears controls. No duplicate safe areas, empty toolbar reservations or stale controls after editor/selection/sheet transitions.
- Inspect light/dark appearance, long titles/transcripts, keyboard dismissal and sheet detents. At accessibility text sizes, controls remain reachable and transport joins transcript scrolling.
- Check Reduce Motion and Reduce Transparency when available. Verify VoiceOver reading order, gestures, labels and native seeking on-device; element labels alone are insufficient.
- Review narrow/wide iPhone widths when suitable devices/simulators are available. Mark unavailable widths, settings and human accessibility checks as pending; one phone cannot establish all layouts.
