# Android target runner

## Objective
Provide repository commands to list Android ADB targets and build, sync, and deploy the application to one detected target.

## Scope
- Add a Node runner that parses `adb devices`.
- Add package scripts for listing targets and deploying to a unique target or explicit target ID.

## Constraints
- Do not change application behavior, Android permissions, or dependencies.
- Refuse ambiguous deployment when multiple targets are connected.
- Use Capacitor's supported `run android --target` command.

## Tasks
- [x] `ANDROID-01` Add target listing and unique-target deployment commands. Writer and independent verification passed target listing, help, and format checks. No commit without explicit user authorization.

## Verification
- Verify command help and target-list behavior without deploying.

## Next step
Use `pnpm android:run` to deploy to the single detected target, or pass an explicit ID after `--` when multiple targets are connected. Commit only with explicit authorization.
