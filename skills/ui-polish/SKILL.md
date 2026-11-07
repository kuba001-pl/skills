---
name: ui-polish
description: Use when the user says "ui polish", "polish the UI", "make it look better", or "review the UI", and inside hands-off before its review round. Runs the app, measures and screenshots every screen, finds what looks off or generated, fixes it within the existing design, and shows before and after.
---

# UI Polish

Take an existing interface to one a professional designer would sign off on.
Most visual problems only show up rendered, so work from the running app.

- **"Polish the UI"** (or "make it look better"): the full pass.
- **"Review the UI"** (or "audit"): steps 1 to 3, then report. Change nothing.

The rules are in `ui-craft`; the direction is in `DESIGN.md`. With no
`DESIGN.md` and a look that is generic all over, the problem is direction,
not polish: say so and offer `ui-direction` before fixing details.

## The pass

1. **Scope.** The screens the user named, otherwise the main ones: what a new
   user sees first and what is used most. Save everything under
   `<project>/.agent-work/evidence/ui-polish/` (add `.agent-work/` to
   `.git/info/exclude` first).
2. **Before.** Run the app. For web, run this skill's `scripts/ui-check.mjs`
   by absolute path on each screen's URL with
   `--out <project>/.agent-work/evidence/ui-polish/before`
   (and `--dark` for a dark theme). It screenshots each width and measures
   what a script can: contrast and names (axe-core), sideways scrolling,
   clipped text, viewport tag, touch targets, and type and spacing drift. Its
   MUST lines are failures, not opinions. Also capture each screen's states
   (empty, loading, error, long content). For other platforms, capture as
   `prove-it` describes. With no way to run it, review the source and say the
   review is not visual.
3. **Find.** Start from the script's MUST lines. Then look at the
   screenshots for what no script sees, using these tests:
   - **Squint:** blur your eyes. Hierarchy and sections still read, and
     nothing jumps out harshly.
   - **Reference:** put each screen next to the reference products in
     `DESIGN.md` (or two well-known products in the category). Name what
     makes theirs look better: spacing, type, restraint, detail.
   - **Swap:** where would a stock template look the same? That is where it
     defaulted. Check against `ui-direction`'s
     [references/ai-defaults.md](../ui-direction/references/ai-defaults.md).
   - **Signature:** can you point to the product's signature in at least a
     few places, or is it generic?
   - **Baseline:** read the code behind each problem against `ui-craft`.

   Record each finding as the screen or `file:line`, what is wrong, why it
   matters in one sentence, and the fix. Rank by how much a user would
   notice. Drop pure taste.
4. **Fix.** System first: a missing token, scale step, or shared component
   often fixes ten screens at once. Then screen by screen, reusing the
   project's tokens and components. Keep behavior unchanged. Change existing
   styles before adding components, wrappers, or files; a pass whose diff is
   mostly new code has become a redesign, so stop and ask. Do not migrate
   libraries or change the brand unless asked.
5. **After.** Run the script again with the same URLs in the same order,
   widths, and themes, with
   `--out <project>/.agent-work/evidence/ui-polish/after`. Done means zero MUST
   lines (or each one explained), no new SHOULD lines, and screenshots that
   are visibly better side by side. Run the repo's checks.
6. **Report.**
   - Start with a one-line verdict on how specific the design feels: generic,
     competent, or distinctive, with one sentence of why.
   - MUST and SHOULD counts before and after, and the diff size.
   - Before and after screenshots of the biggest changes, by absolute path.
   - What you left alone, and why.
