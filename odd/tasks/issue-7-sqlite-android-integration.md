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
- Delivery strategy: ask-on-risk. Chain strategy selected by user: `feature-branch-chain`; the issue branch is the integration/tracker branch, with SQL-06 and SQL-07 as dependent slices. Strategy selection does not authorize commits, PR creation, or push.

## Tasks
- [x] `SQL-01` Integrate and validate the SQLite Android plugin. Route: delegated direct (`gentle-ai-worker`); trigger: multi-file write and installation/build verification. Dependency, sync, debug build, typecheck, architecture check, and target discovery passed. Independent verification found no blocker.
- [x] `SQL-02` Add a temporary, development-only diagnostic hook/helper to run the SQLite round-trip on the connected Android tablet, then remove the hook after capturing evidence. Route: delegated direct (`gentle-ai-worker`); trigger: multi-file write and device build/install verification. User authorized install/launch on `HVA790ZA` (`TB330FU`). Captured successful create/write, close, reopen/read same value, final close; removed the temporary source hook/helper afterward.
- [x] `SQL-03` Commit the SQLite Android integration work unit after explicit user authorization. Route: inline direct. Evidence: `df6a8d9` (`feat(persistence): integrate local SQLite for Android`).
- [x] `SQL-04` Define the initial versioned infrastructure schema/migration for the current `CommunicationNode` model and test its SQL/version. Route: delegated direct (`gentle-ai-worker`); trigger: multi-file write. User confirmed node-only v1; defer settings, SMS contacts, statistics, and history tables until their models exist. Added a finite IEEE-754 range check for `position`; independent verification approved after correction. Tests inspect generated SQL but do not execute SQLite, recorded as a validation limitation. No application repositories, runtime wiring, or presentation changes.
- [x] `SQL-05` Commit the schema/migration work unit after explicit user authorization. Route: inline direct. Evidence: `66ba250` (`feat(persistence): add node schema migration v1`).
- [x] `SQL-06` Apply v1 during SQLite initialization and add an application port/use case plus infrastructure adapter that reads nodes and seeds the approved initial tree only when the table is empty. Route: delegated direct; multi-file write. User approved the current tree as the initial seed and a visible in-memory fallback on DB failure. Added guaranteed connection cleanup after successful creation, including when `open()` fails; independent verification approved.
- [x] `SQL-09` Commit SQL-06 after explicit user authorization. Route: inline direct. Evidence: `239e3bc` (`feat(persistence): initialize SQLite node repository`).
- [ ] `SQL-07` Connect HomePage to asynchronously loaded repository nodes and surface the fallback warning without claiming the seed was saved; update the functional project definition with these approved policies. Route: delegated direct; multi-file UI/doc write. Keep navigation/TTS behavior unchanged.
- [x] `SQL-08` Choose a review-chain strategy for the over-budget feature. Route: inline direct. User selected `feature-branch-chain`; tracker/child PRs are not created without separate authorization.

## Progress
- 2026-09-29: Feature document created after user authorized proceeding with point 1.
- 2026-09-29: SQLite 8.1.1 dependency added and Capacitor Android sync/debug build/typecheck/architecture check passed. Target discovery found connected Android tablet `HVA790ZA` (`TB330FU`). The device create/close/reopen/read smoke has not run yet.
- 2026-09-29: User authorized a temporary development-only diagnostic hook/helper and install/launch on `HVA790ZA` (`TB330FU`). The on-device SQLite round-trip succeeded, and temporary source code was removed.
- 2026-09-29: User confirmed the next work unit should define only the current `CommunicationNode` v1 schema/migration; tables for future models are deferred.
- 2026-09-29: SQL-04 implementation initially failed independent review because `position REAL NOT NULL` did not enforce the domain's finite-number invariant. The correction added a numeric-type and IEEE-754 finite-range check.
- 2026-09-29: Independent verification approved corrected SQL-04; all checks passed. The SQL is validated structurally in tests, not executed against a SQLite engine.
- 2026-09-29: User authorized and created the schema/migration work-unit commit `66ba250` (`feat(persistence): add node schema migration v1`).
- 2026-09-29: User approved seeding the current tree only for an empty DB, visible in-memory fallback on SQLite errors, and `feature-branch-chain` delivery.
- 2026-09-29: SQL-06 initially failed independent verification because `closeConnection()` was skipped after an `open()` failure. Added cleanup and regression tests; independent verification approved. No actual device install/launch was run for this work unit.
- 2026-09-29: User authorized and created SQL-06 work-unit commit `239e3bc` (`feat(persistence): initialize SQLite node repository`).

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
- Active branch is `feat/issue-7-persistencia-pictogramas-copias`; work-unit commit `df6a8d9` (`feat(persistence): integrate local SQLite for Android`) was created after explicit user authorization.
- SQL-04 writer checks passed: `pnpm test:ci` (64 tests), `pnpm typecheck`, `pnpm arch`, `pnpm format:check`, `git diff --check`.
- Independent SQL-04 verification passed the same checks and approved the finite-range correction. It confirmed the test checks SQL structure and finite boundary declarations but does not execute the migration against a SQLite engine; no behavior-level SQLite constraint test was added.
- SQL-04 implementation commit: `66ba250` (`feat(persistence): add node schema migration v1`).
- SQL-06 writer and independent verification passed: `pnpm test:ci` (75 tests), `pnpm typecheck`, `pnpm arch`, `pnpm format:check`, `pnpm build`, `git diff --check`. Build emitted the existing `home.page.scss` budget warning. No hardware runtime check was run.
- SQL-06 commit: `239e3bc` (`feat(persistence): initialize SQLite node repository`). Commit includes 855 insertions across implementation, focused tests, and task evidence; it is larger than the 400-line planning target, so keep the next UI slice narrow and do not combine it with additional work.

## Next work unit approved: initial SQLite schema and migrations

Read-only mapping found that the only existing persisted-domain candidate is `CommunicationNode`; settings, SMS contacts, statistics, and history do not yet have domain models. Requirements mandate local SQLite persistence, stable node IDs, and migrations that preserve settings, but do not specify placeholder table fields for not-yet-modeled data.

The user confirmed a node-only v1. Implement a versioned initial infrastructure migration for all current `CommunicationNode` fields and the parent relationship, with focused migration tests. Defer settings, SMS contacts, statistics, and history tables until their models/use cases define their data. Do not add application repositories/ports, connect the tree to SQLite, or change `HomePage` in this work unit.

### Acceptance criteria for `SQL-04`
- The infrastructure migration catalog exposes one deterministic initial version for `communication_nodes`.
- Every required/optional field in the current `CommunicationNode` model has an appropriate SQL column and nullability; IDs remain stable text keys.
- The parent relation is represented without changing navigation semantics; valid `action` values are constrained to the domain union.
- The migration catalog has focused tests for version/order and the table's columns/constraints/indexes.
- No future-entity tables, repository, runtime wiring, or presentation changes are introduced.

## Next point discovery: initialize SQLite and load persisted nodes

Read-only mapping found that `main.ts` bootstraps Angular without an app initializer; HomePage currently creates its coordinator from a presentation-local `PRESENTATION_SEED_TREE`. The v1 migration catalog is not yet applied anywhere. SQLite 8.1.1 supports registering version upgrades before `createConnection`/`open`; application persistence would need a narrow repository port and an infrastructure adapter, with no Capacitor imports in domain/application.

Product decisions resolved: promote the current presentation tree to the official initial seed and insert it only when the DB is empty; if SQLite initialization/load fails, continue with the seed in memory and display a clear Spanish warning that it is not saved.

The work is forecast to add roughly 450–600 authored changed lines across DB initialization/repository and HomePage integration/tests. Current branch history is already about 400 authored lines excluding generated Gradle files. User selected `feature-branch-chain`: keep the issue branch as the integration/tracker branch and review SQL-06 and SQL-07 as dependent slices. No PRs or pushes are authorized yet.

## Next step
Continue with SQL-07 as a separate, tightly scoped UI/doc slice. No push or PR is authorized.
