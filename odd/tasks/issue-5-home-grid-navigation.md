# Issue #5: Home grid navigation

## Objective
Implement the domain model and pure navigation rules that support the home 2×2 communication grid for issue #5.

## Problem and rationale
The existing home screen is visual-only: its communication options are static and it has no domain representation of the communication tree or page navigation. The model keeps communication content separate from UI-generated pagination controls so the UI can never put navigation into a communication cell.

## Scope
- Define a pure TypeScript communication-node model in `src/app/domain`.
- Define pure navigation policy/state rules for a four-option page, including home ordering, next-page availability, back restoration, and start reset.
- Add Vitest unit tests for the critical navigation decisions.

## Constraints
- Domain code must not import Angular, Ionic, Capacitor, or infrastructure.
- The UI-generated `Other options` / `No encuentro mi opción` control is not a communication node.
- The root `Me encuentro mal` node must always be the first visible home option.
- No persistence, TTS, long-press interaction, SMS, or presentation changes are in this work unit.

## Acceptance criteria
- [x] A communication node captures the logical tree attributes needed by navigation.
- [x] A navigation state exposes at most four communication nodes per page.
- [x] The home page puts `Me encuentro mal` first when it is available.
- [x] Next-page availability is derived from remaining sibling nodes rather than a content node.
- [x] Back restores the prior parent and page context.
- [x] Reset returns to the root's first page and clears confirmed path state.
- [x] Unit tests cover all critical navigation decisions.

## TDD and delivery
- TDD mode: off; source: no explicit project or session TDD configuration was found. Focused ordinary checks were used.
- Forecast: about 180 authored changed lines for `NAV-01`; actual work-unit size was 444 additions including the ODD task document.
- Delivery strategy: single-pr. User selected one PR for the complete issue after the feature branch crossed the 400-line advisory review threshold.
- Commit: `b723423` (`feat(navigation): add communication tree state`).

## Tasks
- [x] `NAV-01` Implement and test the pure communication-tree navigation model. Route: delegated direct (`gentle-ai-worker`); trigger: multi-file write (new domain source and test files). Verification: writer and independent verifier both passed `pnpm test:ci` and `pnpm typecheck`; parent performed structural readback and `git diff --check`.
- [x] `NAV-02` Create the work-unit commit. Route: inline direct. Evidence: `b723423` (`feat(navigation): add communication tree state`).
- [x] `NAV-03` Implement and test the communicator state coordinator: current navigation state, confirmed path-derived phrase, and local no-option fallback state. Route: delegated direct (`gentle-ai-worker`); trigger: multi-file write. Verification: writer and independent verifier both passed `pnpm test:ci` and `pnpm typecheck`; native assessment was unavailable, so independent verification followed the fail-closed path.
- [x] `NAV-04` Create the communicator-state work-unit commit after explicit user authorization. Route: inline direct. Evidence: `1d89a7b` (`feat(communicator): add navigation state coordinator`).
- [x] `NAV-05` Bind communicator state to the home presentation: render coordinator options/phrase, confirm options on click, and wire Back, Start, and next-page controls. Route: delegated direct (`gentle-ai-worker`); trigger: four-file mapping and multi-file write. `No encuentro mi opción` is visible but intentionally has no action in this work unit. Verification: writer and independent verifier passed `pnpm test:ci` (4 files, 25 tests), `pnpm typecheck`, `pnpm lint`, and `pnpm arch`.
- [x] `NAV-06` Create the HomePage binding work-unit commit after explicit user authorization. Route: inline direct. Evidence: pending commit identity.

## Progress
- 2026-09-03: Feature document created.
- 2026-09-03: `NAV-01` implemented and independently verified. No correctness blockers were found.
- 2026-09-03: `NAV-01` committed as `b723423` with explicit user authorization.
- 2026-09-03: User selected the `single-pr` delivery strategy.
- 2026-09-03: `NAV-03` implemented and independently verified. No correctness blockers were found.
- 2026-09-03: User explicitly authorized the `NAV-03` work-unit commit; committed as `1d89a7b`.
- 2026-09-03: User selected a visible, intentionally inactive `No encuentro mi opción` control for `NAV-05`; the local rescue flow remains a later work unit.
- 2026-09-03: `NAV-05` implemented and independently verified. No correctness blockers were found.
- 2026-09-03: User explicitly authorized the `NAV-05` work-unit commit only; the local rescue flow remains pending.

## Evidence
- `src/app/domain/communication-navigation.ts`: pure node model and navigation state/view functions.
- `src/app/domain/communication-navigation.spec.ts`: 8 navigation rule tests, including RF-001, RF-006, RF-007, RF-009, RF-010, RF-010a, RF-010b, and RF-015.
- Writer verification: `pnpm test:ci` passed (3 files, 10 tests); `pnpm typecheck` passed. Browserslist emitted an existing unsupported-browser warning.
- Independent verification: the same test and typecheck commands passed; no Angular/Ionic/Capacitor dependency was found.
- Parent structural check: `git diff --check` passed.
- Native risk assessment: unavailable because the native command returned empty output; independent verification was run as the fail-closed high-risk path.
- `src/app/application/communicator-state.ts`: framework-independent state coordinator exposing navigation, derived phrase, and local fallback availability.
- `src/app/application/communicator-state.spec.ts`: 9 tests for initial state, selection, phrase composition, invalid input, pagination, fallback, back, and reset.
- `NAV-03` writer verification: `pnpm test:ci` passed (4 files, 19 tests); `pnpm typecheck` passed. The independent verifier observed the same results; Browserslist warnings are pre-existing.
- `src/app/presentation/pages/home/home.page.ts`, `.html`, `.scss`, and `.spec.ts`: coordinator-backed HomePage integration with a presentation seed tree, controls outside the grid, and a disabled terminal fallback control.
- `NAV-05` verification: writer and independent verifier passed `pnpm test:ci` (4 files, 25 tests), `pnpm typecheck`, `pnpm lint`, and `pnpm arch`. Browserslist warnings are pre-existing.
- Untracked `.codegraph/` appeared during delegated work and was preserved; it is not part of `NAV-05`.

## Next step
Request explicit authorization to commit `NAV-05`; leave the local rescue flow for a later authorized work unit.
