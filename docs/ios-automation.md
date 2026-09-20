# iPhone automation from Linux

Use the host-wide `ios-wda` CLI. Setup, signing and renewal belong to `~/.local/share/ios-automation/README.md`; this repository does not duplicate that tooling or contain signing material.

WDA uses `xyz.amankushwaha.tools.wda.xctrunner` across app projects. Notes uses `xyz.amankushwaha.apps.notes`; Expo Go’s installed bundle ID is `host.exp.Exponent`.

Keep the iPhone unlocked and connected over USB. Start Metro with `npm start`. In another terminal, run `ios-wda start` and leave it running.

```sh
ios-wda status
ios-wda launch host.exp.Exponent
ios-wda list-items
mkdir -p artifacts/device
ios-wda screenshot artifacts/device/current.png
```

Use `ios-wda --help` for tapping, typing and swiping; inspect current elements before selecting controls. After a phone restart, run `ios-wda mount` if developer services need mounting. Pairing/signing problems belong to the shared host setup.

Screenshots and one-off review scripts stay in ignored `artifacts/device/`. Report findings in the review conversation. An automation failure is not evidence of an app defect; verify the actual screen and interaction. WDA labels and screenshots do not replace human VoiceOver testing.
