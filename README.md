# Notes

An iPhone-only Expo SDK 57 app using native SwiftUI controls, with Penpot guiding content and interactions. Includes Notes/Audio/Folders and native Search, plain-text writing, independent simulated recordings, optional shared attachments, demo import, bookmarks, and separate note/recording recovery.

**Audio is simulated. No microphone is accessed; all changes reset on reload.**

## Run from Linux

Use Node 24 LTS (minimum 22.13) and SDK 57-compatible Expo Go on an iPhone running iOS 26+.

```sh
npm ci
npm start
```

Open the project in Expo Go on the same network. Metro uses **9081**, configured once by `RCT_METRO_PORT` in the tracked `.env`; `npm run ios` and direct `npx expo start` use it too. No Mac, development client or EAS setup is required.

If opening times out, visit `http://<computer-LAN-IP>:9081/status` in iPhone Safari. It should return `packager-status:running`. Check LAN/firewall access to that port; discovery alone does not establish connectivity. Alternatively use `npm start -- --tunnel` (Expo may request its tunnel helper).

## Code map

- `src/app` — Router layouts and thin routes.
- `src/features/library` — note browsing and folder organization screens.
- `src/features/notes` — documents, types, app reducer and provider.
- `src/features/audio` — audio reducer, controls, capture/recording workspaces and navigation.
- `src/features/recordings` — recording library, optional linking, demo import, session flow drafts and recording recovery.
- `src/features/search` — cross-resource search and its pure query model.
- `src/ui` — shared semantic colors, accessibility, waveform and resource counts.
- `src/fixtures`, `src/dev` — demo content and development scenarios.
- `tests/session.test.ts` — critical preservation, recovery and timing checks using Node’s test runner.

Development scenarios are available only by direct link: `exp://<computer-LAN-IP>:9081/--/scenarios`. There is no product navigation entry.

Read [AGENTS.md](AGENTS.md) for implementation conventions, [the design map](docs/design-map.md) for Penpot sources, and [the lifecycle contract](docs/audio-navigation-lifecycle.md) for state/interaction rules. [iPhone tooling](docs/ios-automation.md) and [device validation](docs/device-validation.md) cover native reviews.

## Validate

```sh
npm run check
npx expo install --check
npx expo-doctor
npm run export:ios
```

CI runs these checks on Linux. Export verifies bundling, not native layout or accessibility.

Install native dependencies with `npx expo install` and keep the npm lockfile. The React DOM override aligns Router’s optional peer with React; it does not add a web target. Generated native projects, local review evidence and signing credentials stay outside version control.
