---
name: ui-craft
description: Use before writing or editing any UI code, such as adding a screen, page, form, or component, or changing styles, in any web, desktop, or mobile app. The quality floor every interface must meet, so it looks designed rather than generated. The design rules council scores UI against.
---

# UI Craft

The floor, not the direction. Build to it without announcing it. A small
edit follows the existing look. New screens in a project with no visual
direction start with `ui-direction`.

MUST rules count in the council's UI, UX, and accessibility scores. SHOULD
rules need a reason when skipped. `DESIGN.md` and the brief win over
anything here except accessibility.

## System

- MUST use the project's `DESIGN.md`, tokens, theme, and components. Reuse
  before inventing. No DESIGN.md: infer the type scale, spacing, colors,
  radii, and depth the code already uses and stay inside them. Note them in
  `.agent-work/` or the PR, not in a new DESIGN.md.
- MUST use accessible primitives for anything with focus or keyboard
  behavior (Base UI, React Aria, Radix on web; platform components on
  native). Never hand-roll it when a primitive exists.
- MUST use one icon set at consistent sizes and stroke widths. NEVER emoji
  or Unicode glyphs as icons.
- NEVER mix component systems or icon sets on one surface, or use more than
  one primary depth strategy.

## Hierarchy and layout

- MUST give each view one focal point and one primary action.
- MUST build hierarchy from size, weight, and space before color.
- SHOULD, in dense UI, hold tiers at one size through weight and tone
  (value 600 primary, label 500 secondary, meta 400 muted).
- MUST align to a grid. Edges, baselines, and icon centers line up.
  Where geometric centering looks off (an icon in a button, a play
  triangle), nudge optically by 1 to 2 px.
- MUST keep spacing on the scale: tighter inside a group than between
  groups, more space above a heading than below it.
- MUST keep one component one look: same height, radius, padding, and
  state styles everywhere.
- MUST make nested radii concentric: outer radius = inner radius + padding.
- MUST reflow at every width. Nothing scrolls sideways at 375 px, and
  desktop is not the mobile layout stretched.
- MUST make long text, many items, and missing images look intentional.
- SHOULD keep cards one level deep, one accent per view, and neutrals for
  everything else.

## Type

- MUST use the scale only, with one or two families.
- MUST keep body text at 16 px or more on mobile web, 45 to 75 characters
  per line, and `text-wrap: balance` on headings, `pretty` on body.
- MUST use tabular numbers for numbers that are compared or that update.
- SHOULD tighten large display type slightly (down to about -0.04em);
  leave body tracking alone unless the system defines it.
- SHOULD truncate or clamp in dense UI, with the full value on hover or focus.

## States and copy

- MUST give every data view loading, empty, and error states. Skeletons
  match the real layout. Empty states offer one next action.
- MUST give every control hover, focus-visible, active, and disabled states,
  and feedback within 100 ms of every action.
- MUST show errors where they happened, with how to recover. Confirm
  destructive actions or offer undo.
- MUST write copy from the user's side: actions say what happens ("Save
  changes", not "Submit"), one name per action through the flow
  ("Publish" leads to "Published"), errors never vague, sentence case.
- MUST use realistic content: real names, lengths, and counts.
- NEVER block paste. Use `100dvh`, not `100vh`; respect safe areas.

## Accessibility and motion floor

- MUST: every control has an accessible name; every input a label; full
  keyboard use with a visible focus ring; WCAG AA contrast in every theme;
  never color alone for state. For forms, dialogs, and custom controls,
  follow `ui-access`.
- MUST: animate only `transform` and `opacity` (exceptions in `ui-motion`), keep UI feedback under 300 ms,
  respect `prefers-reduced-motion`. NEVER add decoration motion the brief
  did not ask for. For any animation work, follow `ui-motion`.

## Finish

- SHOULD theme the surfaces you did not draw: text selection, caret,
  scrollbars, focus ring, link underline offset. It is the cheapest sign a
  product was built, not assembled.
- SHOULD give content images a 1 px inset outline at 10% black (10% white
  in dark mode).
- MUST avoid the looks in `ui-direction`'s
  [references/ai-defaults.md](../ui-direction/references/ai-defaults.md)
  unless the brief or brand asks for them.
- MUST, on web pages you create or ship: a unique title and meta description, Open Graph
  tags with absolute image URLs on shareable pages, a canonical URL matching
  `og:url`, favicon and apple-touch-icon, `theme-color`, `html lang`, and a
  fixed z-index scale. Reserve space for images and embeds.
- MUST, on mobile: platform navigation and back behavior, 44 pt targets,
  dynamic type, keyboard never covering the focused input.
- MUST, on desktop: native menus and shortcuts, persisted window size and
  position, OS-standard drag regions and context menus.

## Tailwind and React

Use Tailwind's defaults unless the system defines its own; `cn` (`clsx` +
`tailwind-merge`) for conditional classes; `size-*` for squares; no arbitrary
values next to a scale (`mt-[13px]`, `z-[9999]`); never `useEffect` for
values computable during render.
