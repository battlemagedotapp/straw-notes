# Notes implementation rules

## Product boundary

- This repository is an iPhone app for iOS 26+. Use Expo SDK 57 and `@expo/ui/swift-ui` directly. Do not add Android/web UI, platform adapters, branding, or custom native modules for this milestone.
- Penpot supplies content, hierarchy, and behavior. Native Apple controls and their runtime sizing, materials, typography, safe areas, and keyboard behavior take precedence over drawn approximations.
- Audio and storage are session-only simulations. Do not imply that demo data persists. Speech services, real recording, rich text, accounts, and native extensions belong to later milestones.

## Architecture

- `src/app` contains thin Expo Router routes and navigation composition. Router owns stacks, tabs, and route sheets; do not nest a SwiftUI navigation stack inside it.
- `src/features` contains screens, small named UI compositions, and state. Screen components may compose sibling feature components; do not import a sibling screen. Pure models never import React, navigation, native APIs, or fixtures.
- `src/ui` contains genuinely shared custom visuals and semantic tokens. Use native primitives directly rather than wrapping every Button, Text, List, or field.
- `src/fixtures` supplies deterministic demo content; `src/dev` supplies scenarios. They enter through the root provider or the development-only route, not through production feature models.
- Keep one audio state owner above navigation and both bottom accessory instances. Never put a second recorder/playback timer in a component. Keep note writing separate from transcript data.
- `notes/model.ts` is the transaction boundary for attaching captured audio to a note. It updates the note and removes pending capture together; preserve its idempotence.
- Form drafts stay local; committed note writing updates session state immediately. Sheet dismissal must retain unfinished captured audio.

## Native UI

- Before changing audio or bottom navigation, read `docs/audio-navigation-lifecycle.md`. Validate overlay, spacing, collapse, dismissal and state preservation together; do not accept a fix that silently drops another required behavior.

- Prefer a coherent SwiftUI tree under one `Host` per screen. Only embed React Native with `RNHostView` when the component needs it (currently the waveform SVG).
- Use explicit parent-proposed waveform width; do not combine RNHostView intrinsic measurement with percentage-based children. Audio workspaces have one scrolling owner, including at accessibility text sizes.
- Use the Expo Go-compatible public semantic-color modifiers documented in the design map; verify native modifier changes on-device before propagating them.
- Keep semantic text styles and system colors. Do not override native control radii, fonts, shadows, tint, or tab geometry to reproduce Penpot pixels.
- Navigation owns screen safe areas; do not add a second bottom inset to native accessories. Validate both accessory placements and keyboard handling on an iPhone.
- Header toolbars require direct Router elements; their iOS parser ignores arbitrary component wrappers. Do not mount empty bottom toolbars or add them without testing subsequent routes for retained blank space.
- Use native menus and alerts, meaningful accessible names, dynamic text, and at least 44-point custom control targets. Decorative waveforms are hidden from accessibility; seeking uses a native Slider.
- Record any native substitution or missing capability in `docs/design-map.md`.

## Validation

- Metro's project-wide default is `9081`, configured by `RCT_METRO_PORT` in the tracked `.env`. Keep start commands using this shared default rather than duplicating port flags.
- Notes uses `xyz.amankushwaha.apps.notes`. Shared iPhone automation uses `xyz.amankushwaha.tools.wda.xctrunner`; keep its signing material outside this repository under `~/.local/share/ios-automation`. Use the host-wide `ios-wda` command across app projects.
- Install native dependencies using `npx expo install`; keep SDK-compatible peers and the npm lockfile. Never solve dependency errors with `--force` or `--legacy-peer-deps`.
- Run `npm run check`, `npx expo install --check`, `npx expo-doctor`, and `npm run export:ios` for implementation changes.
- Tests should cover meaningful state transitions, preservation, and failure recovery. Do not snapshot native UI mocks as proof of native correctness.
- Linux checks do not validate iOS layout. Follow `docs/device-validation.md` and report device acceptance as pending until actually tested.
- Keep setup guides, architecture, and checklists reusable. Record review findings in the review conversation and temporary evidence under ignored `artifacts/device/`; do not append session history, screenshot findings, or one-off results to those guides.
