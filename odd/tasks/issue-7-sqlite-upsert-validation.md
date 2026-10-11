# Issue #7 SQL-17: Real SQLite upsert validation on Android

## Goal
Validate `SQLiteCommunicationNodeRepository.saveNodes()` against the actual Capacitor SQLite Android plugin using a disposable database, without touching the app's `tree-communicator` database.

## Approved scope
The user selected tablet validation of the SQL-14 batch upsert API. Preparing a temporary diagnostic harness did not itself authorize device install/launch. The user later separately authorized one SQL-17 smoke launch and one cleanup-only launch; both one-shot authorizations have been consumed.

## Safety boundaries
- Use a unique, disposable DB name such as `tree-communicator-sql17-upsert-smoke-<timestamp>`; never use the production DB name `tree-communicator`.
- Temporary edit surfaces only:
  - `src/app/infrastructure/persistence/sqlite-upsert-smoke.ts`
  - `src/main.ts` (temporary import/invocation only)
- Remove both temporary source changes after the run.
- Delete only the disposable DB. The Android plugin requires an RW connection registered before `deleteDatabase`; that method closes/deletes the DB, then the connection can be removed. Capture cleanup result; never delete or alter production data.
- No source commit, push, PR, or device installation/launch without explicit separate authorization.

## Runtime assertions
- Initialize a unique disposable DB with the existing repository/migration.
- Seed three simple root nodes.
- Upsert: update one stable ID, deactivate one (`enabled=false`), insert one new ID, and omit one existing ID.
- Readback proves count 4, updated contents, stable ID, omitted-node retention, deactivation, and insertion.
- Submit one batch containing a valid update followed by a row violating the SQL `label`/`speech_text` CHECK; verify the operation rejects and a subsequent empty-batch readback shows no partial update/insert.
- Delete the temporary DB after closing every connection.

## Tasks
- [x] `SQL-17A` Prepare the temporary harness and pre-install build/sync checks; do not install or launch. Harness is ready; required checks pass.
- [x] `SQL-17B` The single authorized tablet run confirmed seed, upsert/readback, and rollback against native SQLite; its initial cleanup failed.
- [x] `SQL-17C` A separately authorized cleanup-only launch deleted the exact temp DB; source hook/helper were removed and post-cleanup checks passed.
- [x] `SQL-17D` Record actual result and limitations in this document. Evidence-document commit remains pending separate explicit authorization.

## Constraints and limitations
- Android logcat rendered object arguments as `[object Object]` during the first run, hiding cleanup error details and the generated DB name. Native source inspection later established the plugin lifecycle requirement.
- The first smoke's repository operations passed, but its final cleanup failed because repository operations close their connections; `deleteDatabase` requires an RW connection in the native connection map. The cleanup-only launch corrected the sequence and confirmed deletion.
- The stateful unit-test fake remains useful but does not substitute for this native check.
- TDD mode: off. Do not claim strict RED/GREEN.
- Tablet: `HVA790ZA` / `TB330FU`. Both one-shot user authorizations have been used; no further install/launch is authorized.

## Progress
- 2026-09-30: User selected validation of the SQL-14 upsert API on the Android tablet.
- 2026-09-30: Read-only mapping confirmed injectable repository database name and plugin `deleteDatabase` API. Prepared the temporary hook in `src/main.ts` and `src/app/infrastructure/persistence/sqlite-upsert-smoke.ts`.
- 2026-09-30: Independent pre-install verification passed tests (86), typecheck, architecture, formatting, build, Capacitor sync, Android debug build, target discovery, and diff check. `HVA790ZA` / `TB330FU` is online.
- 2026-09-30: User explicitly authorized one debug install/replacement and launch on `HVA790ZA` / `TB330FU` to run SQL-17. Do not clear logs; use only the unique disposable DB.
- 2026-09-30: The one command `pnpm android:run -- HVA790ZA` failed before any observable install/launch because the target runner received `--` and the target as two arguments. Read-only diagnosis confirmed the runner validates argument count before adb/Capacitor. Filtered logcat had no SQL-17 marker; no device change occurred.
- 2026-09-30: User freshly authorized one retry using `pnpm run android:run -- HVA790ZA`; it also failed before adb/Capacitor, showing `node scripts/android-target-runner.mjs run -- HVA790ZA` and rejecting multiple target arguments. No SQL-17 marker or device change.
- 2026-09-30: A second read-only diagnosis found no documented safe pnpm separator form; direct invocation `node scripts/android-target-runner.mjs run HVA790ZA` yields the exact expected argv.
- 2026-09-30: User directed us to begin the immediate pending tablet validation; this authorized one direct runner invocation on `HVA790ZA` using the disposable DB. Do not clear logs; do not retry if it fails.
- 2026-10-10: `node scripts/android-target-runner.mjs run HVA790ZA` deployed the debug APK successfully. Initial log capture was early; read-only follow-up found `upsert-readback-success` at 12:01:47.564 and `rollback-success` at 12:01:47.769 after `seed-success`.
- 2026-10-10: Cleanup then logged `cleanup-close-failure`, `cleanup-delete-failure`, and `final-failure`. Read-only source diagnosis found each repository method already closes its connection; Android `deleteDatabase` also requires an open RW connection. The extra final close fails because none is open, and deletion then fails too. Database filename is `<name>SQLite.db` under app-private storage; exact timestamp is not logged. No retry/relaunch/log clear occurred; production DB was not touched.
- 2026-10-10: User explicitly authorized one cleanup-only debug install/launch on HVA790ZA. It enumerated filename metadata, filtered the exact SQL-17 prefix, deleted only the matching DB, and verified absence; it did not read DB contents, clear logs, or touch production data. No additional run/retry is authorized.
- 2026-10-10: Cleanup-only hook passed preflight: test:ci (86 tests), typecheck, architecture, format, build, Capacitor sync, Gradle assembleDebug, and diff check. Build retained the existing `home.page.scss` budget warning. Static inspection confirmed exact-prefix-only deletion, no DB content access, RW connection before plugin deletion, close afterward, and post-delete zero-match verification.
- 2026-10-10: The one authorized cleanup-only runner invocation deployed successfully. Follow-up read-only logcat showed `tree-communicator-sql17-upsert-smoke-1791626506653SQLite.db`, then `deleteDatabase`, then a post-delete list without that DB. Marker reported `success; deletedDatabaseCount=1; remainingDatabaseCount=0`. No retry/relaunch, log clear, shell deletion, or production DB access. A `triggerEvent` JS error appeared before cleanup; no app-side SQLite cleanup error was observed.
- 2026-10-10: Removed the temporary helper and `main.ts` hook; `pnpm test:ci` (86), typecheck, arch, format, build, Capacitor sync, Gradle assembleDebug, and diff check all passed. Source and regenerated Android assets contain no SQL-17 markers. Build retains the HomePage SCSS budget warning. No commit, push, or PR was made.
