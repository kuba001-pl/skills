---
name: ui-motion
description: Use when adding, reviewing, or removing animations or transitions, or when the user says "animations feel off", "it's janky", "make it feel smoother", or "add motion". Decides whether something should move at all, then gives exact durations, curves, and origins.
---

# UI Motion

Motion explains a change: where something came from, what changed, what to
do next. Motion that explains nothing is decoration, and decoration on
something used a hundred times a day is friction.

**Review** ("are the animations right?"): report; change nothing.
**Fix** (default when building): apply the rules, then check the result.

## 1. Should it move at all?

Map how often each animated thing is used:

- **Constantly** (keyboard shortcuts, command palette, list hover, typing):
  no animation, or under 100 ms. Keyboard-triggered actions are instant.
- **Often** (menus, popovers, tabs, toggles): short and quick.
- **Occasionally** (modals, drawers, toasts): can take a little longer.
- **Rarely** (onboarding, a first load, a celebration): room for one
  authored moment.

The strongest fix is often deleting the animation. One orchestrated moment
lands better than an entrance on every section; fade-and-slide-up on every
block and hover motion on every card read as generated.

## 2. Values

Keep these as shared tokens, not hand-typed per component:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);     /* UI: entrances, feedback */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* movement on screen */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);  /* drawers and sheets */
```

| What | Duration |
| --- | --- |
| Press feedback | 100-160 ms |
| Tooltips, small popovers | 125-200 ms |
| Dropdowns, selects | 150-250 ms |
| Modals | 200-300 ms |
| Drawers and sheets | 200-500 ms |

UI animation stays under 300 ms unless it is a drawer or a deliberate moment.
Never `ease-in` for UI entrances, never bare `linear` except for progress and
loops. A second tooltip in a toolbar appears instantly.

## 3. Physics

- NEVER `scale(0)`: nothing appears from nothing. Enter from
  `scale(0.95)` (0.9 to 0.97) plus `opacity: 0`.
- Popovers and menus grow from their trigger: set `transform-origin` to the
  anchor side (primitive libraries expose it as a CSS variable). Modals are
  centered and use `center`.
- Press feedback: `scale(0.96)` on `:active` over about 150 ms ease-out. Never
  on disabled controls.
- Make motion interruptible: a toggle or toast clicked mid-animation must
  reverse from where it is. Use transitions or springs, not fixed keyframes,
  for anything the user can trigger again quickly. Gestures use springs.
- Stagger groups by 30 to 80 ms at most, and never block interaction while
  they run.

## 4. Performance

- MUST animate only `transform` and `opacity` (plus `clip-path`, `filter`,
  and shadow when measured smooth). Never `width`, `height`, `top`, `left`,
  `margin`, or `padding`. Never `transition: all`.
- NEVER animate large `blur()` or `backdrop-filter` surfaces. Set
  `will-change` only while an animation runs.
- NEVER drive motion from scroll events; use scroll-driven animations or
  `IntersectionObserver`. Pause loops that are off screen.
- MUST respect `prefers-reduced-motion`: keep opacity changes, remove
  movement, never remove the feedback itself.

## Check

Slow animations down (DevTools animation panel at 10% speed, or a temporary
multiplier) and watch each one: right origin, no jump at the start or end, no
layout shift. Record a short clip or step screenshots when the harness can.
Report what you deleted, what you changed, and the values used.
