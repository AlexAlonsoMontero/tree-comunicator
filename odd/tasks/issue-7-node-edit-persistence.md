# Issue #7 SQL-14: Transactional communication-node upsert API

## Goal
Add an application-layer persistence contract and SQLite adapter operation that allows future edit use cases to create or update communication nodes safely, without implementing editor UI.

## Context
SQL-06 established SQLite initialization, one-time seed, and node loading. SQL-07 connected HomePage to persisted nodes and a visible in-memory fallback. Read-only exploration found no editor UI or node mutation use case yet. The user chose the persistence API only, with the meaning that submitted nodes are upserted and omitted nodes remain unchanged.

## Approved decisions
- This work is application/infrastructure only; no PIN-gated editor UI or navigation changes.
- `saveNodes` upserts the submitted nodes by their stable caller-supplied IDs.
- Omitted nodes are not deleted or otherwise changed; deactivation is represented by `enabled: false`.
- No physical delete, cascade, full-tree replacement, or ID-generation behavior is introduced.
- Saving a batch is transactional and returns the full persisted node tree after commit.

## Non-goals
- Editor forms, PIN/session flow, preview/publish, pictogram import, backups, or schema migration.
- Physical node deletion or cascade policy.
- Inventing domain editing policies beyond existing `CommunicationNode` and approved requirements.

## Constraints
- Domain/application remain free of Angular, Ionic, Capacitor, and SQLite imports.
- The application repository contract lives under `src/app/application`; SQLite details remain in infrastructure.
- Preserve stable IDs and existing node fields. Never replace nodes omitted from the input batch.
- Preserve the existing tree navigation semantics and `Me encuentro mal` home priority.
- Keep the work reviewable and under 400 authored changed lines if practical; split or return for scope review if the implementation exceeds this.
- No commit, push, PR, or device install/launch without explicit authorization.

## Acceptance criteria
- [x] The application repository contract exposes an operation to upsert a batch of `CommunicationNode` values.
- [x] SQLite inserts new IDs and updates existing IDs without changing their IDs.
- [x] Nodes omitted from a save batch remain in the database; `enabled: false` persists as deactivation.
- [x] The operation is atomic: any failed write rolls back the whole batch and preserves the original write error if rollback/close also fail.
- [x] Parent nodes included in a batch are written before their new children; duplicate IDs and dependency cycles within the submitted batch are rejected before writes.
- [x] An empty batch performs no writes and returns the current full persisted tree.
- [x] The returned value reflects the full persisted tree read back from SQLite after commit, using a stateful fake in tests.
- [x] Tests cover create, update, omitted-node retention, deactivation, transaction commit/rollback, and error preservation.
- [x] No UI, schema migration, or physical delete behavior is added.

## TDD and routing
- TDD mode: off; use ordinary focused tests without claiming strict RED/GREEN.
- Route: one `gentle-ai-worker` for the bounded multi-file implementation, then a separate `gentle-ai-verify` read-only verification. Native assessment is currently unassessable; independent verification remains mandatory.
- Work-unit commit requires explicit user authorization. No push or PR is authorized.

## Tasks
- [x] `SQL-14` Implement the application port and SQLite transactional batch-upsert operation with focused tests.
- [x] `SQL-15` Independently verify the implementation and run the required project checks. First verification blocked on a static fake; replaced with a stateful fake and re-verified approved.
- [ ] `SQL-16` Commit the verified work unit only after explicit user authorization.

## Progress
- 2026-09-29: User selected tree-edit persistence and chose application/infrastructure API only, without editor UI.
- 2026-09-29: User chose partial upsert semantics: omitted nodes remain unchanged; no physical delete or full-tree replacement.
- 2026-09-29: Read-only exploration found an existing parent foreign key without cascade and an existing seed transaction pattern to reuse.
- 2026-09-29: SQL-14 implemented the application port, SQLite upsert, batch ordering/validation, transaction handling, and focused tests. Initial independent verification blocked on a static fake; corrected to a stateful fake and re-verified approved.
- 2026-09-29: Writer and independent verifier passed `pnpm test:ci` (86 tests), typecheck, arch, format, build, and diff-check. Build retains the HomePage SCSS budget warning; unsupported Browserslist entries also appear. Fake tests do not execute upsert SQL against actual SQLite. Verifier noted parent-FK enforcement and future fixed-home edit validation as non-blocking caveats.
- 2026-09-29: Code/spec diff is 459 insertions and 8 deletions, with another 11 insertions/1 deletion in the tracked issue task document; total tracked diff is 470 insertions/9 deletions, above the 400-line planning target. This remains one focused persistence API slice; surface this review-size risk before commit.

## Verification plan
- `pnpm test:ci`
- `pnpm typecheck`
- `pnpm arch`
- `pnpm format:check`
- `pnpm build`
- `git diff --check`
