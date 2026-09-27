# Issue #6 — Focus, voice and long-press confirmation

## Source

- GitHub issue: #6 — 07. Implementar foco, voz y confirmación por pulsación mantenida
- URL: https://github.com/AlexAlonsoMontero/tree-comunicator/issues/6
- Branch: `feat/issue-6-foco-voz-confirmacion`

## Objective

Prevent accidental activations by announcing focus on a short press and confirming a focused communication option only after the configured long-press duration.

## Scope

- Offline text-to-speech for the essential communication flow.
- Short press focuses and reads an option without executing its action.
- Long press on the focused option confirms exactly once.
- Visible, high-contrast progress while confirming.
- Releasing before the duration cancels confirmation.
- Focusing another option cancels the previous progress and reads the new option.
- Focus and confirmation remain distinguishable without relying on color alone.

## Related requirements

- RF-003 to RF-005a
- RA-006 to RA-008a
- RD-003
- RNF-001, RNF-015, RNF-016

## Tasks

- [x] Create a real `VoiceOutput` boundary and an offline Capacitor text-to-speech adapter without leaking framework details into application.
- [x] Implement short-press focus/read and long-press confirmation in the communicator presentation flow, including cancellation and exactly-once execution.
- [x] Render accessible focus, confirmation, and progress states using non-color cues and existing design tokens.
- [x] Add unit and component tests for the acceptance criteria, including a fake voice and deterministic timer behavior.
- [x] Run applicable formatting, lint, type, architecture, test, coverage, and build checks; record evidence and manual Android/TTS limitations.
- [x] Add behaviorally meaningful voice resilience tests: repeat focused/fallback/derived phrase speech and safe interaction when voice output rejects. Writer and independent verifier passed `pnpm test:ci` (58 tests), `pnpm coverage`, and `pnpm format:check`. No synthetic coverage tests were added.

## Acceptance checklist

- [x] A short press focuses and reads without navigating or executing actions.
- [x] Holding a focused option executes its action once after the configured duration.
- [x] Releasing early never executes the action.
- [x] Touching another option changes focus and reads it.
- [x] Progress is visible, contrasted, and cancellable.
- [x] Focus and confirmation are not distinguished by color alone.
- [ ] Essential voice works offline on a real Android device with the Android engine installed.

## Constraints and non-goals

- Preserve the four-option communication grid and existing navigation coordinator.
- Keep domain/application independent from Angular, Ionic, Capacitor, and concrete infrastructure.
- Do not send real SMS from automated tests.
- Do not add provider-specific AI behavior or unrelated configuration flows.
- Do not claim Android-device validation until it is actually run on a device.

## Implementation

- `src/app/application/voice-output.ts` defines the pure `VoiceOutput` contract.
- `src/app/infrastructure/voice/capacitor-voice-output.ts` uses `@capacitor-community/text-to-speech@8.0.2` and selects a locally installed Spanish voice.
- BCP-47 tags are normalized for matching while the original tag is preserved for the native call.
- `HomePage` manages focus, an 800 ms cancellable confirmation progress, exactly-once confirmation, and non-color state cues.
- Navigation semantics remain in the existing communicator coordinator.

## Verification evidence

- Commit: `f86e63d feat(issue-6): add focus voice and long-press confirmation`
- `pnpm format:check` — passed; Browserslist warning remains.
- `pnpm lint` — passed.
- `pnpm typecheck` — passed.
- `pnpm arch` — passed without violations.
- `pnpm test:ci` — passed: 47 tests.
- Focused voice adapter test — passed: 3 tests, including mixed-case `ES-es`.
- `pnpm coverage` — executed: 73.59% global statements, below the project target of 80%; domain 96.96%, application 90.47%.
- `pnpm build` — passed; existing Browserslist and Home SCSS budget warnings remain.
- `pnpm exec cap sync android` — passed.
- `cd android && ./gradlew assembleDebug` — passed.
- No SMS was sent.

## Coverage follow-up

Current coverage is 76.21% global statements. The template instrumentation is reported at 0% despite DOM tests, so the follow-up was limited to real controls and voice-error resilience rather than coverage gaming. The documented 80% project target remains unmet and requires an explicit broader coverage plan, not artificial tests.

## Remaining manual validation

- Install/prepare an offline Spanish voice on Android and verify TTS in airplane mode.
- Verify long-press progress on a real tablet with TalkBack and Switch Access.
- If no local Spanish voice is installed, the adapter fails safely; visible voice-error feedback remains a future improvement.
- Global coverage must reach 80% before integration if the project gate is enforced strictly.

## Point 2 follow-up evidence

- Focus switching cancels the previous hold, reads the newly focused option, and avoids duplicate speech.
- `pointerleave` and `pointercancel` cancel without treating the gesture as a short press.
- Repeated keyboard keydown events no longer reset the long-press timer.
- The progress binding exposes the actual percentage (`0%` to `100%`) and is covered at `50%` during a hold.
- A pointer release after timer-based confirmation cannot confirm again.
- Focused checks: HomePage 22 tests passed, voice adapter 3 tests passed, and `pnpm typecheck` passed.
- Verification warning: existing Browserslist configuration includes browser versions outside the current Angular support range.

## Refinement evidence — visible state labels and web voice simulator

- Visible `enfocada`/`confirmada` option text was removed; focus remains exposed with `aria-pressed` and confirmation progress with `aria-busy`.
- Focused options now use the existing high-contrast focus token as their background with a contrasting text token, stronger scale, border, outline, and shadow cues.
- Confirmation progress remains cancellable and visually distinct through a dashed border, stronger scale, and a non-text progress bar.
- Native platforms still require a locally installed Spanish voice; the web platform calls the browser SpeechSynthesis path with `lang: 'es-ES'` without requiring preloaded voices.
- Focused checks: HomePage 22 tests passed, voice adapter 4 tests passed, and `pnpm typecheck` passed.
- Commits: `f3d27f4 fix(issue-6): refine focus feedback and web voice`; `a80b1a6 style(issue-6): format focus styles`.
- Final verifier1 recheck at `a80b1a6`: format check, focused tests (26), full tests (54), and typecheck passed; coverage and real-device Android validation remain pending.
