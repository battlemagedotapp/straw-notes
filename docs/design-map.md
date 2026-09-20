# Penpot implementation map

Penpot defines content, hierarchy and interactions; Apple supplies control styling and adaptive sizing. This map covers all three product pages, excluding Scratchpad and the brainstorm archive. Source links are kept here only, rather than duplicated in an exported inventory.

**Implemented** describes front-end behavior, not device acceptance. **Partial** identifies deferred controls on an otherwise implemented board. **Reference** identifies guidance, not an extra route. Use the [device checklist](device-validation.md) for visual acceptance; keep review results outside this document.

## Flow and native mapping

| Area         | Entry and transitions                                                        | Implementation                                                                           |
| ------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Library      | Notes/Folders → note; Search → note or transcript timestamp                  | Router NativeTabs/Stack, native search, SwiftUI List/Section; `features/library`         |
| Organization | Select/sort/pin → move, trash, restore; folder create/rename/delete          | Native menus, list rows, forms and confirmations; `features/library`                     |
| Document     | Reader → edit; attachment → transcript or playback controls                  | One ScrollView, Text and multiline TextField; `features/notes`                           |
| Capture      | Record → pause/resume/mark → minimize or Finish                              | Native modal, custom RecordingPanel and transcript composition; `features/audio`         |
| Destination  | Finish → choose new/existing note → attach; cancel/failure → retry           | Native searchable sheet, List, Picker and TextField; draft retained per capture          |
| Playback     | Attachment → transcript; passage/bookmark → timestamp; controls → seek/speed | Distinct attachment, compact player and accessory compositions; native Slider and Picker |
| Recovery     | Interrupted capture, missing transcript, pending audio, failed attachment    | Native ContentUnavailableView, alerts and app Feedback                                   |

See [audio/navigation lifecycle](audio-navigation-lifecycle.md) for ownership and transitions.

## Native substitutions

- Router owns tabs, Search, sheets, safe areas and keyboards. `NativeTabs.BottomAccessory` owns glass, width, height and regular/inline placement. Native collapse takes precedence over Penpot’s larger Search gap and smaller idle capsule.
- Reader/editor and selection actions use native header controls. Contextual audio menus replace Penpot’s keyboard-adjacent capsule. Writing from capture minimizes its modal before opening the editor.
- RecordingPanel, AudioAttachment, CompactPlayback and the two audio accessories remain distinct compositions. Their custom hierarchy follows Penpot; native buttons retain system styling. Only waveform rendering uses RNHostView/SVG, with width proposed by its parent and no intrinsic sizing loop.
- Waveforms are decorative. Tapping an attachment or compact waveform opens native playback controls with an accessible Slider; there is no custom seeking gesture.
- Documents have one scrolling container. Recording/transcript transport sits above transcript scrolling at standard text sizes and joins that scroll region at accessibility sizes.
- Custom content uses semantic system colors and dynamic text. The Expo Go target uses public `foregroundColor` and `backgroundOverlay` modifiers; no native patches or styling adapter. Phone masks, legacy tokens and simulated glass are excluded.
- Destination keeps title, folder, choice and query across cancellation/retry. Name forms blur their native field before closing and protect dirty changes. Confirmation/cancellation lives in the header, without duplicate footers.
- Player close retains position without confirmation. Capture discard requires confirmation. Close controls and multiple-pending recovery extend the drawn boards deliberately.
- Personal is the default folder; deleting another folder moves its notes there. Recently Deleted has no promised automatic retention period. These fill gaps in the designs.
- Plain text replaces rich editing. Real recording, permissions, persistence, imports/exports, summaries, settings and system extensions are deferred. Do not expose inactive actions or treat illustrative Penpot values as real service capabilities.

## Source inventory

## 01 · Screens

### [Start here · Native-first Notes](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa23d1490875)

Behavior and source guidance; retained as reference.

### [Sources · Capture and audio](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa23e3627d90)

- [Notes / Capture accessory](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa1c0d97c735) — Implemented source.
- [Notes / Audio accessory](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa1c0dcd14de) — Implemented source.
- [Notes / Audio attachment](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa1c0dfa880a) — Implemented source.
- [Notes / Recording panel](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa1c175feed6) — Implemented source.
- [Notes / Waveform · Live](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa1c16f79f6e) — Implemented source.
- [Notes / Waveform · Playback](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa1c172fb86e) — Implemented source.
- [Notes / Compact playback](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=e744bf61-86d4-8051-8008-aad2feddf30a) — Implemented source.

### [States · Library, recording and import](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa2716e297b8)

- [Library · Empty](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa27172f8a60) — Implemented.
- [Search · No results](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa2717acd263) — Implemented.
- [Recording · Paused](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa2718298407) — Implemented.
- [Recording · Moment added](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa2718ef0d1c) — Implemented.
- [Import · Complete](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa2719ae4366) — Deferred.
- [Import · Retry or continue](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa271a57363a) — Deferred.
- [Audio attachment · Playing](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa288334248e) — Implemented.
- [Audio accessory · paused · Regular](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa3b5e43b95e) — Implemented.
- [Audio accessory · paused · Inline](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa3b5f8397cd) — Implemented.
- [Audio accessory · playing · Regular](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa3b615f74b9) — Implemented.
- [Audio accessory · playing · Inline](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa3b62c39555) — Implemented.
- [Recently Deleted · Selection and restore](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=f13b894f-f3ae-8097-8008-aa5aae09a007) — Implemented.

### [Library · Behavior notes](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa291de601f4)

Behavior and source guidance; retained as reference.

### [Library · Browse, search and select](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa2945df4348)

- [Library · All Notes](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99312d0c245) — Implemented.
- [Library · Folders](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99316ea79d6) — Implemented.
- [Library · Search](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a9940f2854cd) — Implemented.
- [Library · Select & sort](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a9941339b3dc) — Implemented.
- [Library · Recently Deleted](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a9941797143f) — Implemented.
- [Library · Folder editors](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a994457a6b7b) — Implemented.
- [Library · All Notes · Scrolled](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=bdf28c7a-0593-80f5-8008-a9edbc257802) — Implemented.
- [Library · Search · Focused](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=bdf28c7a-0593-80f5-8008-a9edbe7e5e6b) — Implemented.
- [Library · Move confirmed](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=bdf28c7a-0593-80f5-8008-a9edee7d4014) — Implemented.

### [Capture · Record and return](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa295ce8e44a)

- [Capture · Recording](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99bf1d11243) — Implemented.
- [Capture · Expanded](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99bfa79fe0a) — Implemented.
- [Capture · Recording · Scrolled](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=bdf28c7a-0593-80f5-8008-a9edbcfdc558) — Implemented.
- [Capture · Conflicts](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c145b9ee3) — Implemented.
- [Capture · Destinations](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c21050080) — Implemented.

### [Notes · Read, write and share](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa295ef265a2)

- [Note · Reader](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c277bc8bb) — Partial — Plain-text content and attachments; summary deferred.
- [Note · Editing](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c2e57c470) — Partial — Native plain text; formatting deferred.
- [Note · Formatting](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c419f178b) — Deferred.
- [Note · Bookmarks](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c6f89d2d8) — Implemented.
- [Note · Summary](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c78e690c1) — Deferred.
- [Note · Share & export](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c818f3f07) — Deferred.

### [Transcript · Follow, use and correct](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa296be6188e)

- [Transcript · Reader](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c5715016c) — Partial — Playback, passage seek and moments; correction tools deferred.
- [Transcript · Passage tools](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c5dd7bfb3) — Partial: seek and bookmark; correction deferred.
- [Transcript · Correct](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99c8d0edfd9) — Deferred.

### [Import · Source and destination](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa296d5e1442)

- [Import · Source picker](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99e972259dc) — Deferred.
- [Import · Review](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99e9f3e4fc3) — Deferred.
- [Import · Destination](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99eaf25cb16) — Deferred.

### [Settings · Preferences and access](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa296ec77194)

- [Settings · Hub · Modal](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa43595d7ad6) — Deferred.
- [Settings · Processing](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99ef143c879) — Deferred.
- [Settings · Storage](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99efed606a1) — Deferred.
- [Settings · Manage recordings](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99f0b540443) — Deferred.
- [Settings · Privacy](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99f164753ad) — Deferred.
- [Settings · iOS integrations](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=78a9636f-f866-80fd-8008-a99f20af58f0) — Deferred.
- [Management · Selection excerpt](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa47bacbe496) — Implemented.
- [Native · Remove recordings confirmation](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa47bf7ff328) — Deferred.

### [Responsive · 375 and 440 point widths](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa298971ae1e)

- [Responsive · Library · 375 pt](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa27c0c1be56) — Acceptance reference.
- [Responsive · Library · 440 pt](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dfac74&board-id=1e58aafe-2add-80f4-8008-aa282381fc5a) — Acceptance reference.

## 02 · Overlays & sheets

### [05 · Feedback](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=d6a77d61-ea49-8034-8008-a9a7a21df196)

- [Feedback · Informational](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa21d6caabee) — Deferred.
- [Notes / Feedback](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa1c6dd861e4) — Implemented source.

### [01 · Forms](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa218cd15e56)

- [Overlay · Folder editor](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a13e61cdee) — Implemented.
- [Overlay · Rename folder sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a145b0157c) — Implemented.
- [Overlay · Rename note sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a14d7e3b68) — Implemented.
- [Overlay · Name moment sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a15571e5a0) — Implemented.
- [Overlay · Add link sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a18de129b1) — Deferred.
- [Overlay · Formatting sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a1a6eb10d8) — Deferred.

### [02 · Choices](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa218d4d7719)

- [Overlay · Move sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a15df69968) — Implemented.
- [Overlay · Choice sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a165800734) — Deferred.
- [Overlay · Add audio sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a16d4ba108) — Deferred.
- [Overlay · Share transcript sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a1767583f5) — Deferred.
- [Overlay · Playback speed sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a20b18163d) — Implemented.
- [Overlay · Playback tools sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a212f857f7) — Deferred.
- [Preference · Language](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa29e7f3b9db) — Deferred.
- [Preference · Audio quality](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa29e868aed9) — Deferred.
- [Preference · Keep recordings](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa29e8cfa05e) — Deferred.
- [Preference · Recording destination](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa29e93fdbed) — Deferred.

### [03 · Menus](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa218dd02c00)

- [Overlay · Folder menu](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a1fa792d03) — Implemented.
- [Overlay · Audio options menu](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a202db43a6) — Deferred.
- [Overlay · Text tools menu](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a21ad75cd5) — Deferred.
- [Overlay · Passage menu](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a2230e1690) — Partial: seek and bookmark; correction deferred.
- [Overlay · Sort menu](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a22b267a0a) — Implemented.
- [Overlay · Note actions sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a19eb816b2) — Partial: rename, pin, move, bookmarks, record and delete; export deferred.
- [Library · More menu](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=481e6b2b-fccb-8069-8008-aa5b323a8c4d) — Partial: sort, create and record; settings deferred.
- [Playback · Sleep timer](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=481e6b2b-fccb-8069-8008-aa5b328e95ff) — Deferred.
- [Playback · Up next](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=481e6b2b-fccb-8069-8008-aa5b4cabba3e) — Deferred.

### [04 · Confirmations](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa218e988621)

- [Overlay · Conflict alert](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a1af3c952b) — Implemented.
- [Overlay · Playback conflict](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a1b76d98a3) — Implemented.
- [Overlay · Discard recording alert](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a1bfa22270) — Implemented.
- [Overlay · Stop and delete alert](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a1c7a3b2c2) — Deferred.
- [Overlay · Permanent delete alert](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a1d039e731) — Implemented.
- [Overlay · Dirty editor sheet](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=78a9636f-f866-80fd-8008-a9a19684ae33) — Implemented for moment, note and folder names.

### [06 · Input and destination states](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa46c1eecfdc)

- [Empty · Confirm disabled](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa46c1fa022c) — Implemented for name forms.
- [Save failed · Value retained](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa46ccb1fd8b) — Partial — Destination capture save only.
- [Link · Invalid address with keyboard](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa46d8e343d1) — Deferred.
- [375 pt · Larger text and long name](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa4852e41fe5) — Acceptance reference.
- [Dark · Native input surface](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192dffd59&board-id=1e58aafe-2add-80f4-8008-aa485330861f) — Acceptance reference.

## 03 · iOS surfaces, states & access

### [03 · Widget](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a4eb1c206d)

- [Notes / Widget content](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1c793ddeee) — Deferred.

### [06 · Inbound share](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a77f42d592)

- [Region · Status](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a782c15d7c) — Deferred.
- [Region · Navigation](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a785875b39) — Deferred.
- [Region · Content](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a78849ccd7) — Deferred.
- [Region · Home indicator](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a79d0ff7a5) — Deferred.

### [01 · Content and recovery states](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1db3125c4a)

- [State · First recording](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc1fdf96d) — Deferred.
- [State · Microphone denied](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc25789b3) — Deferred.
- [State · Speech denied](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc29a4c6e) — Deferred.
- [State · Audio interrupted](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc2da4599) — Implemented.
- [State · Storage full](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc31afa2d) — Deferred.
- [State · Missing transcript](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc35e6477) — Implemented.
- [State · Summary loading](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc3a42f0d) — Deferred.
- [State · Summary unavailable](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc3ec64d3) — Deferred.
- [State · Transcript processing](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc438cefa) — Deferred.
- [State · Import unsupported](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc4824879) — Deferred.
- [State · Import partial success](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc4cb959d) — Deferred.
- [State · Library unavailable](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa1dc5158a4d) — Deferred.

### [02 · Access and combined states](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa2694c3caec)

- [Access · Larger text library](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a576d3d370) — Acceptance reference.
- [Access · Larger text reader](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a5861c655f) — Acceptance reference.
- [Access · Dark library](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a601d3e528) — Acceptance reference.
- [Access · Dark recording](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a6172f7bf1) — Acceptance reference.
- [Access · Dark reader](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a62627d120) — Acceptance reference.
- [State · Add text while recording](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a75581d2a5) — Implemented.
- [State · Name a moment](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a7699c64f4) — Implemented.
- [Access · Opaque controls](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a70762f8de) — Acceptance reference.

### [04 · Live Activity and Dynamic Island](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa26965b34dd)

- [Surface · Live Activity · Recording](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a4f751cd01) — Deferred.
- [Surface · Live Activity · Paused](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a5029f9a14) — Deferred.
- [Surface · Live Activity · Private](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a50ef5bed5) — Deferred.
- [Surface · Dynamic Island · Expanded](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a51c78d131) — Deferred.
- [Surface · Dynamic Island · Compact](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a52869583f) — Deferred.
- [Surface · Lock Screen](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a64b422d73) — Deferred.

### [05 · System entry points](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa269767c431)

- [Surface · Control Center](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a545f2ac9b) — Deferred.
- [Surface · App icon & quick actions](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a55113128f) — Deferred.
- [Surface · Spotlight](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a55c531df7) — Deferred.
- [Surface · Shortcuts](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a567bb54d6) — Deferred.
- [Surface · Action Button](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=d6a77d61-ea49-8034-8008-a9a656e54d6c) — Deferred.

### [Share · Destination and recovery](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa4772f80ffc)

- [Native note destinations](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa47732a5804) — Deferred.
- [_Search Field](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa4775213845) — Deferred.
- [Retained destination](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa477577841c) — Deferred.
- [Native button · Try again](https://design.penpot.app/#/workspace?team-id=c514c1fb-1cda-8125-8008-a4d56197d986&file-id=c514c1fb-1cda-8125-8008-a97344a09405&page-id=78a9636f-f866-80fd-8008-a99192e04f72&board-id=1e58aafe-2add-80f4-8008-aa477673214b) — Deferred.
