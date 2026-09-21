# Issue 3 — Prepare Ionic Angular, Capacitor and Android for the horizontal MVP

## Source

- GitHub issue: #3 — 01. Preparar Ionic Angular, Capacitor y Android para el MVP horizontal
- Branch: issue-3-preparar-ionic-angular-capacitor-android-mvp-horizontal

## Tasks

- [x] Create ODD tracking for the feature.
- [x] Clean accidental package artifacts created at the repository root.
- [x] Copy the Ionic Angular Capacitor seed into the repository without `node_modules` or npm lockfile.
- [x] Install dependencies with pnpm and keep `pnpm-lock.yaml` as the package-manager lockfile.
- [x] Verify the imported base and current Git status.
- [x] Configure Capacitor app id/name for Tree Communicator.
- [x] Add Android platform and configure SDK/orientation requirements.
- [x] Create the initial horizontal communicator layout.
- [x] Run available build/sync checks and record any device/API-26 gaps.

## Evidence

- Started tracking before assistant-owned repository writes.
- Imported Ionic Angular standalone seed into the repository.
- Installed dependencies with pnpm; `pnpm-lock.yaml` is present and `package-lock.json` is absent.
- Approved required dependency build scripts through `pnpm approve-builds --all` after pnpm blocked install scripts for `@parcel/watcher`, `esbuild`, `lmdb`, and `msgpackr-extract`.
- Configured Capacitor as `com.treecommunicator.app` / `Tree Communicator`.
- Added strict TypeScript flags: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noImplicitOverride` in addition to `strict`.
- Added the Android Capacitor project and set `minSdkVersion = 26`, `compileSdkVersion = 36`, and `targetSdkVersion = 36`.
- Locked the main Android activity to `landscape` and removed the default Internet permission from the local MVP shell.
- Replaced the blank Ionic page with a Spanish horizontal communicator shell: top navigation, 2x2 communication grid, and bottom controls outside the grid.
- Verification passed: `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm exec cap sync android`, and `cd android && ./gradlew assembleDebug`.
- Tablet verification: ADB sees `TB330FU` on Android API 35. After uninstalling the conflicting prior app, `cd android && ./gradlew installDebug` succeeds and `adb shell monkey -p com.treecommunicator.app -c android.intent.category.LAUNCHER 1` launches the app.
- Safe-area fix: the shell no longer uses fullscreen `ion-content`; Capacitor status bar overlay is disabled at startup; Android `MainActivity` asks the window to fit system windows and colors status/navigation bars with the warm dark background so Android system bars remain visible and do not cover the app.
- Lint fix: ESLint now ignores generated Android, `node_modules`, and `www` outputs so generated `native-bridge.js` is not linted after Android builds.
- API 26 verification: Android emulator `emulator-5554` reports Android `8.0.0` / SDK `26`; `cd android && ./gradlew installDebug` succeeds; `adb -s emulator-5554 shell monkey -p com.treecommunicator.app -c android.intent.category.LAUNCHER 1` launches `com.treecommunicator.app/.MainActivity`.
- Airplane-mode verification: with `airplane_mode_on = 1` on the API 26 emulator, force-stopping and launching the app starts the same activity successfully.
