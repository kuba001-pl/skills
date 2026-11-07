---
name: ui-access
description: Use when building or changing forms, dialogs, menus, or custom controls, or when the user says "fix accessibility", "accessibility audit", "a11y", or "check keyboard and screen reader support". Audits with axe-core and a keyboard walkthrough, then fixes with native elements first.
---

# UI Access

Accessible UI is UI that works: by keyboard, by screen reader, at 200% zoom,
and for anyone who cannot tell two colors apart. A script finds about a third
of the problems. A keyboard walkthrough finds most of the rest.

**Audit** ("check accessibility"): find and report; change nothing.
**Building:** apply the rules as you write; run the audit once at the end of
the milestone, not on every edit.
**Fix** ("fix accessibility"): audit, fix what you find, audit again.

## Audit

1. Run `ui-polish`'s [`ui-check.mjs`](../ui-polish/scripts/ui-check.mjs) on
   each screen (`--out <project>/.agent-work/evidence/a11y`). Its axe lines
   cover names, labels, contrast, roles, and lang.
2. Walk every core flow by keyboard only, driving the real app (Playwright
   `keyboard.press('Tab')`, or by hand). Record: can you reach and use every
   control, in a logical order, always seeing where focus is? Does Escape
   close what it should? Does focus land somewhere sensible after each
   action?
3. Read the code of every custom control, dialog, and form against the rules
   below.
4. Report each finding with its screen or `file:line`, who it blocks, and the
   fix. Blockers first: anything that stops a keyboard or screen reader user
   from finishing a core task.

## Rules

**Semantics**
- MUST use native elements before ARIA: `button` for actions, `a` for
  navigation, `label` with every input. A `div` with `onclick` is a bug.
- MUST give every control an accessible name. Icon-only buttons get
  `aria-label`; decorative icons get `aria-hidden="true"`.
- MUST keep heading levels in order and one `h1` per page. Set `html lang`.

**Keyboard and focus**
- MUST make everything usable by keyboard in visual order. Never
  `tabindex` above 0.
- MUST show a visible focus indicator with 3:1 contrast. Use
  `:focus-visible`; never remove outlines without a replacement.
- MUST, for modals: trap focus, set initial focus, close on Escape, return
  focus to the trigger. Use the primitive library's dialog.
- MUST offer a skip link on pages with long navigation.

**Forms**
- MUST label every field visibly. A placeholder is not a label.
- MUST tie errors to fields (`aria-describedby`, `aria-invalid`), say how to
  fix them, and move focus to the first error on submit.
- MUST submit with Enter, use the right `type` and `autocomplete`, and
  never block paste.

**Perception**
- MUST meet WCAG AA contrast in every theme: 4.5:1 for text, 3:1 for large
  text and UI parts. Placeholders too.
- MUST never use color alone to signal state; add an icon, text, or shape.
- MUST make targets at least 24 by 24 px (44 pt on touch).
- MUST reflow at 320 px and at 200% zoom without losing content.
- MUST respect `prefers-reduced-motion`.

**Dynamic content**
- SHOULD announce async results and errors with a polite live region; a toast
  must not be the only place important information appears.
- SHOULD keep focus in place when content updates around it.

## Fix

Fix by changing the element before adding ARIA: swap the `div` for a
`button` before reaching for `role` and `tabindex`. Prefer the primitive
library's component over patching your own. Then run the audit again and
report before and after: the axe counts and the keyboard walkthrough result.
