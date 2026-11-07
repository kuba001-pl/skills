---
name: prove-it
description: Use when the user says "prove it", "prove it works", "show me it works", or "does it actually work?", and before claiming any change is done. Runs the real thing, drives the real flows, captures screenshots across widths and themes, measures performance, and saves an evidence pack.
---

# Prove It

Proof is evidence you observed yourself in this session. Green mocked tests
do not prove that the user experience works. A claim without evidence is not
proof, and neither is a screenshot you did not look at.

## What to prove

Prove what the user pointed at: a change, a feature, a bug fix, or the whole
app. If `.agent-work/BRIEF.md` exists, prove its acceptance criteria. Otherwise,
write down the claims first (three to eight short lines, such as "the
settings page saves and reloads the theme"), taken from the request and the
diff. Then prove each one.

## Levels

Use the most direct level the change allows:

1. **Reproduction.** For a bug, reproduce the failure, apply the fix, and
   watch the same reproduction pass.
2. **The real app, driven through real flows,** with screenshots: a browser,
   a simulator, or a desktop window.
3. **Behavior tests:** end-to-end before integration, integration before unit.
   When a behavior has no test and the repo has a test setup, add one focused
   test that fails without the change.
4. **Static checks:** typecheck, lint, build.

Always run level 4 and every command the repo's CI runs. Add the highest of
levels 1 to 3 that the change allows.

## Running and driving

- **Web:** start the dev server as a background process and drive it with
  Playwright, or with the harness's browser preview tools when proof needs
  them. Measure performance on a production build (`build`, then
  `start`/`preview`), never on the dev server.
- **Desktop:** launch the built app. Playwright can drive Electron. Tauri
  works through WebDriver (`tauri-driver`). Otherwise use OS screenshots or
  computer use.
- **Mobile:** use the iOS Simulator (`xcrun simctl`), the Android emulator
  (`adb`), or Expo on either one. In T3 Code, use the device tools
  (`device_open`, `device_screenshot`). Use Maestro or Detox for scripted
  flows.
- **CLI and libraries:** run the real commands on real inputs, including bad
  input, and capture the output.
- **APIs:** send real requests, including invalid and unauthorized ones.

Use realistic data: plausible names, real-length text, real numbers of
items. Screenshots full of "Item 1", "John Doe", or "test@test.com" hide
layout bugs and look generated.

Stop every server, emulator, and watcher you started when you are done. The
exception is the shared server `council` asks for, which lasts for the
round.

## Evidence pack

Write to `.agent-work/evidence/<name>/`, where `<name>` is the milestone, the
council round, or a short topic when you run on your own. Add `.agent-work/` to
`.git/info/exclude` first, so evidence never lands in a commit.

- `checks.md`: each command, its exit status, and the lines of output that
  matter.
- Screenshots of every main screen in every state it has: default, loading,
  empty, error, and overflowing (long names, many items). For web, capture at
  375, 768, and 1280 px wide (add 1920 for layouts that stretch). Capture
  light and dark if the product has themes. Name files
  `<screen>-<state>-<width>-<theme>.png`.
- Flows: one screenshot per step for every acceptance-criterion flow, or a
  recording when the harness can make one.
- Performance, when the change can affect it, and always for milestone and
  council packs: a Lighthouse summary on mobile emulation for the main
  routes, and the bundle size. For desktop and mobile, startup time and any dropped
  frames you saw.
- Console and logs: errors and warnings during the flows. The target is zero
  errors.
- For web UI: [`ui-check.mjs`](../ui-polish/scripts/ui-check.mjs) from `ui-polish` on the main routes, with
  `--out` set to the pack. It measures contrast, overflow, and scale, so
  reviewers do not have to judge them by eye.
- `index.md`: every acceptance criterion or claim, marked pass or fail, with
  the files that prove it.

Keep the pack readable. A milestone pack covers only what the milestone
touched. A council pack covers the core screens in every width, state, and
theme, and secondary screens once each at desktop and mobile width. If a pack
grows past about 30 screenshots, cut duplicates before you add more. Every
image costs every reviewer tokens.
Reviewers skim a pack they cannot finish.

## Look at it

Open every screenshot and review it against `ui-craft`, at every width and
in every theme. For a large pack, hand the review to a subagent that can
view images, and keep only its findings, so the screenshots do not fill your
context. Look for what a picky designer would see first: misalignment,
uneven spacing, clipped or overflowing text, inconsistent components, low
contrast, broken dark mode, layout shift, and anything that looks like a
template. Fix what you find, then capture again. A pack with known visual bugs
is not ready for the council.

## Honesty

When something cannot be proven here (no macOS for the iOS Simulator, no API
key, no device), write exactly what is unproven and the closest proof you
got. Never mark it as pass. If the user asked for something that cannot be
proven here, tell them, or ask during an unattended run. For a default budget
you set yourself, use the closest proof and record the gap.

## Report

When you run on your own, finish with each claim and its result (pass, fail,
or unproven and why), the commands you ran, and absolute paths to the key
screenshots. If something failed, say so first.
