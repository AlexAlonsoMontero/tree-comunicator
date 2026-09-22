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
- Forecast: about 180 authored changed lines.
- Delivery strategy: ask-on-risk.
- Commit: pending explicit user authorization under repository policy.

## Tasks
- [x] `NAV-01` Implement and test the pure communication-tree navigation model. Route: delegated direct (`gentle-ai-worker`); trigger: multi-file write (new domain source and test files). Verification: writer and independent verifier both passed `pnpm test:ci` and `pnpm typecheck`; parent performed structural readback and `git diff --check`.
- [ ] `NAV-02` Create the work-unit commit after explicit user authorization. Route: inline direct. Verification: inspect staged diff and record the commit identity.

## Progress
- 2026-09-03: Feature document created.
- 2026-09-03: `NAV-01` implemented and independently verified. No correctness blockers were found.

## Evidence
- `src/app/domain/communication-navigation.ts`: pure node model and navigation state/view functions.
- `src/app/domain/communication-navigation.spec.ts`: 8 navigation rule tests, including RF-001, RF-006, RF-007, RF-009, RF-010, RF-010a, RF-010b, and RF-015.
- Writer verification: `pnpm test:ci` passed (3 files, 10 tests); `pnpm typecheck` passed. Browserslist emitted an existing unsupported-browser warning.
- Independent verification: the same test and typecheck commands passed; no Angular/Ionic/Capacitor dependency was found.
- Parent structural check: `git diff --check` passed.
- Native risk assessment: unavailable because the native command returned empty output; independent verification was run as the fail-closed high-risk path.

## Next step
Request explicit authorization to create the Conventional Commit work unit for `NAV-01`; do not alter presentation until the next authorized issue point.
