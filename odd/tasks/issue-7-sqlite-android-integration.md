# Issue #7, work unit 1: SQLite Android integration

## Objective
Integrate the approved `@capacitor-community/sqlite` 8.x plugin and establish that a local database can be created, closed, reopened, and read on Android.

## Problem and rationale
Issue #7 needs a reliable on-device local persistence foundation. The confirmed stack already selects SQLite through Capacitor; this work unit validates that native integration before defining the application's persisted domain schema.

## Scope
- Add and lock the compatible SQLite plugin dependency.
- Synchronize the Capacitor Android project and make the Android build include the plugin.
- Add the smallest suitable smoke-test mechanism needed to verify local database create/close/reopen/read on an Android device or emulator.

## Non-goals
- Application database schema, domain/application persistence contracts, or migrations.
- Persisting the communication tree or moving the seed out of `HomePage`.
- Pictogram storage/import, backups, or user-facing database UI.

## Constraints
- SQLite data stays on-device in app-private storage; no remote database or network dependency.
- Preserve the existing hexagonal boundary: domain/application must not import Capacitor or SQLite.
- Keep the dependency on the documented Capacitor-compatible 8.x line.
- Preserve unrelated existing work and report unavailable Android runtime validation honestly.

## Acceptance criteria
- [x] `@capacitor-community/sqlite` is added on a compatible 8.x version and the pnpm lockfile is consistent.
- [x] Capacitor Android sync registers/includes the plugin and the Android debug build succeeds.
- [x] An Android device/emulator smoke check creates a local database, writes a value, closes/reopens the connection, and reads the same value.
- [x] No application schema or communication-tree persistence is introduced in this work unit.

## TDD and delivery
- TDD mode: off; source: repository check found no explicit project/session TDD configuration, consistent with prior issue work. This infrastructure integration will use focused runtime/build checks.
- Forecast: under 400 authored changed lines, excluding generated files.
- Delivery strategy: ask-on-risk. No commit is authorized by this request; ask before committing.

## Tasks
- [x] `SQL-01` Integrate and validate the SQLite Android plugin. Route: delegated direct (`gentle-ai-worker`); trigger: multi-file write and installation/build verification. Dependency, sync, debug build, typecheck, architecture check, and target discovery passed. Independent verification found no blocker.
- [x] `SQL-02` Add a temporary, development-only diagnostic hook/helper to run the SQLite round-trip on the connected Android tablet, then remove the hook after capturing evidence. Route: delegated direct (`gentle-ai-worker`); trigger: multi-file write and device build/install verification. User authorized install/launch on `HVA790ZA` (`TB330FU`). Captured successful create/write, close, reopen/read same value, final close; removed the temporary source hook/helper afterward.

## Progress
- 2026-09-29: Feature document created after user authorized proceeding with point 1.
- 2026-09-29: SQLite 8.1.1 dependency added and Capacitor Android sync/debug build/typecheck/architecture check passed. Target discovery found connected Android tablet `HVA790ZA` (`TB330FU`). The device create/close/reopen/read smoke has not run yet.
- 2026-09-29: User authorized a temporary development-only diagnostic hook/helper and install/launch on `HVA790ZA` (`TB330FU`). The on-device SQLite round-trip succeeded, and temporary source code was removed.

## Evidence
- `package.json`: `@capacitor-community/sqlite` dependency added as `^8.1.1`.
- `pnpm-lock.yaml`: SQLite 8.1.1 and transitive dependencies locked.
- `android/capacitor.settings.gradle`, `android/app/capacitor.build.gradle`: Capacitor sync registered SQLite and restored registration for the already-declared text-to-speech plugin.
- `pnpm add @capacitor-community/sqlite@8`: passed.
- `pnpm exec cap sync android`: passed; six Android plugins detected, including SQLite 8.1.1.
- `cd android && ./gradlew assembleDebug`: passed (`BUILD SUCCESSFUL`).
- `pnpm typecheck`, `pnpm arch`, `pnpm android:targets`: passed. Target: `HVA790ZA | device | TB330FU`.
- Temporary development hook reported `TREE_COMMUNICATOR_SQLITE_SMOKE: start create/write`, `closed after write`, `reopen/read`, `success value=tree-communicator-sqlite-smoke-ok`, and `final close` in Android logcat on `HVA790ZA` (`TB330FU`). It was removed after the run; the final `HomePage` contains no smoke invocation and `src/app/infrastructure/persistence/sqlite-smoke.ts` is absent.
- Native `gentle_review assess` was unavailable/returned unassessable. Independent verification passed `pnpm install --frozen-lockfile`, `pnpm test:ci` (58 tests), `pnpm typecheck`, `pnpm arch`, `pnpm format:check`, `cd android && ./gradlew assembleDebug`, and `git diff --check`. It also inspected the retained device log evidence; no blocker found. The verifier did not perform a fresh install/launch.
- Active branch is `feat/issue-7-persistencia-pictogramas-copias`; no commit was created.

## Next step
Work unit 1 is complete. Continue with the next authorized issue #7 work unit (application schema/migrations) only after agreeing its scope. No commit was created; ask explicitly before committing.
