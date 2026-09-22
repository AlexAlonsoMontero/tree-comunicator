# Issue 4 — Configure hexagonal architecture and quality controls

## Source

- GitHub issue: #4 — 02. Configurar arquitectura hexagonal y controles de calidad
- Branch: feat/configure-hexagonal-quality

## Scope decision

Keep this issue pragmatic. Configure boundaries and checks now; do not create fake domain ports, pre-commit tooling, or Playwright tests before real flows exist. CI is the merge gate for this issue.

## Tasks

- [x] Create ODD tracking for the feature.
- [x] Create the base `domain`, `application`, `infrastructure`, and `presentation` structure.
- [x] Move the current Ionic home page into `presentation` and update routes/imports.
- [x] Add dependency-cruiser rules for hexagonal boundaries.
- [x] Add Prettier configuration and scripts.
- [x] Add explicit quality scripts for architecture, CI tests, and coverage.
- [x] Update CI to block merges on formatting, architecture, coverage, Capacitor sync, and Android assemble.
- [x] Update `AGENTS.md` / `docs/GUIA_DESARROLLO.md` with the reduced issue #4 decision.
- [x] Run available verification commands and record evidence.

## Evidence

- Started tracking before assistant-owned repository writes.
- Added `src/app/domain`, `src/app/application`, `src/app/infrastructure`, and `src/app/presentation` with README files only; no fake ports or empty interfaces were introduced.
- Moved the home page to `src/app/presentation/pages/home` and updated lazy route loading.
- Added `dependency-cruiser`, Prettier, and Vitest V8 coverage support as dev dependencies.
- Added `format`, `format:check`, `arch`, and `coverage` scripts; updated `ci` to include format, architecture, and coverage checks.
- Updated GitHub Actions to run format check, architecture check, coverage, Capacitor sync, and Android assemble.
- Documented the issue #4 decision in `AGENTS.md`, `docs/GUIA_DESARROLLO.md`, and README command docs.
- Strengthened dependency-cruiser external package matching for Angular, Ionic, and Capacitor imports.
- Added `coverage/**/*` to ESLint ignores so local lint remains stable after coverage generation.
- Removed the separate `pnpm test:ci` CI step to avoid running the same unit tests twice; `pnpm coverage` remains the merge-gating test command.

## Verification results

- `pnpm install`: passed; lockfile updated. Warnings: deprecated subdependencies `uuid@7.0.3`, `whatwg-encoding@3.1.1`.
- `pnpm format:check`: passed; all matched files use Prettier style.
- `pnpm lint`: passed; ESLint reported no issues, including after coverage output existed.
- `pnpm typecheck`: passed.
- `pnpm arch`: passed; no dependency violations found across 10 modules and 12 dependencies.
- `pnpm test:ci`: passed during implementation, then removed from CI because `pnpm coverage` already runs the same unit tests. Warning: Browserslist includes unsupported browser versions for this Angular version.
- `pnpm coverage`: passed; 2 test files and 2 tests passed. Coverage: all files 92.59% statements, 90.9% branches, 100% functions, 89.18% lines. Warning: Browserslist includes unsupported browser versions for this Angular version.
- `pnpm build`: passed. Warnings: Browserslist includes unsupported browser versions; `src/app/presentation/pages/home/home.page.scss` exceeds the production component style warning budget by 108 bytes.
- `pnpm exec cap sync android`: passed; synced 4 Capacitor plugins.
- `cd android && ./gradlew assembleDebug`: passed; BUILD SUCCESSFUL. Warnings: Gradle `flatDir` metadata warning and Android SDK XML version warning.
