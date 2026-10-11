# Issue #7: Emoji pictograms as the initial visual representation

## Goal
Persist and render the existing emoji symbols as the initial pictogram representation for communication nodes. Defer ARASAAC catalog management and importing custom images to a later work unit; keep those requirements visible as deferred, not completed.

## Approved scope
The user selected “Emojis por ahora”: persist and display emoji symbols, while deferring ARASAAC and custom image import. Preserve the existing emoji-to-node mapping already used by HomePage rather than inventing new symbols. Existing v1 databases must retain the same visible emoji mapping after migration.

## Constraints
- Do not store emoji text in `pictogramPath`; use a dedicated domain/schema field.
- Keep migration v1 immutable; introduce v2 for the new `pictogram_emoji` data.
- Backfill existing seed IDs using their current emoji assignments; leave unknown/custom node IDs nullable and preserve the existing `💬` presentation fallback.
- Emojis remain text labels plus visual support, not a replacement for text or speech.
- ARASAAC and custom image import/storage remain deferred requirements. Do not claim those requirements are fulfilled.
- The emoji-scope selection alone did not authorize device access. The user has now explicitly authorized one debug install/launch on the tablet against the existing `tree-communicator` database, including applying migration v2, for visual review. This changes the existing database; do not inspect or disclose its node contents. No commit, push, or PR is authorized.
- TDD mode: off; do not claim strict RED/GREEN.

## Tasks
- [x] `EP-01` Add `pictogramEmoji` to the domain and SQLite v2 migration; centralize current seed-ID emoji mappings in a domain constant for both migration backfill and seed use, map values in load/upsert/seed, and cover migration/repository behavior with tests. Independent verification passed 87 tests, typecheck, architecture, format, build, and diff check; native SQLite migration remains untested on device.
- [x] `EP-02` Move the existing HomePage emoji assignments into seed node data, render the persisted emoji with the existing fallback, and add presentation assertions. Independent verification passed 87 tests, typecheck, architecture, format, build, and diff check.
- [x] `EP-03` Update README, project definition, and requirements analysis to record persisted emoji-first behavior; preserve ARASAAC/custom-image requirements as deferred and unmet.
- [x] `EP-04` Independent verification passed 87 tests, typecheck, architecture, format, build, and diff check. Build retains the HomePage SCSS budget warning. Native SQLite migration v2 was not run on-device; separate authorization is required.
- [ ] `EP-05` Commit the reviewable work unit only after explicit user authorization; no push/PR.
- [x] `EP-06` One authorized install/launch against the existing DB deployed successfully; the user observed an indefinite `Cargando datos` screen. Filtered logs showed a `triggerEvent` TypeError but no SQLite/migration failure; v2 completion remains unconfirmed.
- [ ] `EP-07` A 5-second timeout/fallback is implemented and passes unit/UI tests (90 tests plus typecheck, architecture, format, build, diff check), but the user reports the deployed tablet still remains on the loading screen beyond the timeout. Device acceptance is not met; do not claim fixed. Root cause remains unknown.
- [x] `EP-08` One authorized timeout-build install/launch on HVA790ZA succeeded. Filtered logs had no matching SQLite/migration/runtime error lines; the user observed that the tablet remains blocked. No DB inspection, log clear, or retry.
- [x] `EP-09` User authorized one narrowly filtered current-process log capture; it returned no SQLite, migration, timeout, or bridge-error lines. No relaunch, DB access, or log clearing.
- [x] `EP-10` One authorized instrumented debug deployment/launch succeeded after full preflight. Filtered logs showed a `triggerEvent` TypeError but no startup diagnostic markers; the blocking phase remains unknown. No DB content, log clear, or retry.
- [x] `EP-11` Removed temporary diagnostic markers. The 5-second timeout remains, and local verification passed 90 tests, typecheck, architecture, format, build, and diff check. No device action.
- [x] `EP-12` Read-only local trace: Capacitor Android calls `window.Capacitor.triggerEvent(...)`; `triggerEvent` is defined by the JS bridge. The reported TypeError implies `window.Capacitor` was undefined at evaluation time; the local `@capacitor/app` backbutton/Ionic event path is a plausible caller, not proven root cause. Current Angular routes contain only HomePage's text loader. No diagnostic markers appeared in the instrumented run, so the runtime path remains unknown.
- [x] `EP-13` User granted fresh one-shot authorization for another instrumented HVA790ZA run.
- [x] `EP-14` One authorized instrumented install/launch succeeded after full preflight; generated Android `index.html` referenced marker-containing `main-5KVG72IA.js` and `chunk-BBdQgl2D.js`. Filtered logs still showed no markers, only the `triggerEvent` TypeError; no SQLite/fatal lines. Blocking phase remains unknown. No DB content, log clear, or retry.
- [x] `EP-15` Removed temporary error-level markers. The 5-second fallback remains; 90 tests, typecheck, architecture, format, build, Capacitor sync, Gradle assembleDebug, diff check passed. No diagnostic markers remain in source or generated assets. No device action.
- [x] `EP-16` User confirmed the tablet remains on the loading screen and explicitly requested a correction.
- [x] `EP-17` Made HomePage startup zoneless-safe with `ChangeDetectorRef.markForCheck()`, a `finally` loading exit, seed fallback on unexpected startup errors, and a destroyed-component guard. Added DOM timeout regression using fixture auto-detection without manually calling `detectChanges()` after the timer, plus synchronous-startup-failure coverage. Independent checks passed: 91 tests, typecheck, lint, architecture, format, coverage, build, Capacitor sync, Gradle assembleDebug, diff check. Tablet revalidation, commit, push, and PR remain unauthorized.
- [x] `EP-18` User authorized one installation/launch of the verified fix on HVA790ZA; target was online and deployment succeeded. Filtered logs showed the existing `triggerEvent` TypeError but no SQLite/fatal errors. No DB inspection, log clear, or retry.
- [x] `EP-19` User confirmed the communication buttons now appear after the authorized HomePage fix deployment. No further device action needed for this startup check.

## Evidence and limitations
- Current UI already renders hardcoded emojis from `OPTION_PRESENTATION`; seed nodes and SQLite do not persist them.
- `CommunicationNode` has optional `pictogramPath`, and schema v1 has `pictogram_path`; preserve that image-path meaning.
- Current SQLite migration v1 is already deployed/used and must not be edited in place.
- Prior SQL-17 real SQLite upsert validation is complete; its evidence commit is still separately pending authorization.
