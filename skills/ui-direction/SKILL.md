---
name: ui-direction
description: Use when starting a new product, screen set, or redesign without a settled visual direction, when the user says "ui direction", "design direction", "make it look distinctive", "write DESIGN.md", or "set up a design system", and in hands-off before the first screen of new UI. Picks a direction grounded in the product's world, checks it is not a generic default, and records it in DESIGN.md.
---

# UI Direction

Generated UI looks generated because it starts from defaults. Decide what this
product should look like before writing any screen, and write it down so every
later screen follows it.

The bar: if another model, given the same request, would produce
substantially the same design, you have not decided anything yet.

## 1. What is already true

Read `DESIGN.md`, tokens, theme files, components, and a few real screens.

- **An established look exists** (in DESIGN.md or consistently in code):
  inherit it. If DESIGN.md is missing, document what the code already does
  (step 5) instead of inventing a new look. Repetition in code is evidence,
  not intent: record a pattern only if it is consistent and deliberate.
- **Adding a screen or component inside it:** no direction work. Follow
  `ui-craft` with the existing system.
- **Redesign:** keep content, function, and explicit brand assets (logo,
  name, brand color). Replace the rest.
- **Nothing yet:** do steps 2 to 5.

## 2. Mode and world

Pick the mode. It decides how bold to be:

- **Operate** (apps, dashboards, admin, tools): precision and restraint.
  Ambition shows in density, alignment, and speed, not decoration.
- **Read** (docs, articles, knowledge bases): typography and wayfinding.
- **Persuade** (landing and marketing pages): one bold idea, real proof.
- **Experience** (games, showcases, playful products): the interaction is
  the point.

Then write three lines: who uses it, where and when (the real scene, which
also decides light or dark), and the subject's vernacular: the materials,
objects, and visual traditions its users already know. Distinct choices come
from there. A tool for night-shift nurses and a portfolio for a ceramicist
should not look alike.

Name the rut: the page this category always ships. Read
[references/ai-defaults.md](references/ai-defaults.md). Those looks are off
the table unless the brief or the brand asks for one.

## 3. Plan the system

Write a compact plan, not code:

- **Color strategy first:** restrained (tinted neutrals plus one accent;
  the default for Operate and Read), committed (one strong color carries a
  large share of the surface), or full palette (3 to 4 named roles). Then 4
  to 6 named hex values, with text and accent contrast checked against
  their backgrounds.
- **Type:** one family, or two clearly different ones, chosen for this
  subject. System stacks and workhorse UI faces suit Operate; Persuade wants
  a face with a point of view, not one from the defaults list. A ratio: 1.2
  for dense apps, 1.25 to 1.333 for reading and marketing.
- **Depth:** one primary strategy: borders, subtle shadows, layered
  shadows, or surface tints. A border plus a soft shadow is fine; three
  strategies on one surface is not.
- **Shape and density:** two or three radii with a rule for which goes where,
  and a 4 px spacing scale with the default gap for this density.
- **Signature:** the one memorable element, such as a type treatment, a
  layout move, or an interaction. Spend boldness there and keep the rest
  quiet.
- **Layout:** two or three distinct options as ASCII wireframes of the main
  screen.

## 4. Check, choose, render

Revise anything that fails these:

- **Swap test:** swap your typeface for the usual one and your layout for a
  standard template. Where nothing would change, you defaulted.
- **Token test:** read the token names and values aloud. Do they belong to
  this product, or to any project?
- **Rut test:** is any part on the ai-defaults list without the brief asking?

If the user is reachable (a standalone run, or `hands-off`'s first question
batch), offer the layout options with the question tool, with previews and
your pick first. Otherwise choose and record why.

Render a specimen before building screens: one page with the type scale,
palette, a button, an input, a card or row, and the signature element.
Screenshot it at mobile and desktop width and look at it. Adjust the plan,
not the screens.

## 5. Write DESIGN.md

At the project root, short enough to read in a minute:

```markdown
# Design
Mode: <operate|read|persuade|experience>. Scene: <who, where, light or dark>.
Direction: <two sentences>. Signature: <the one memorable element>.
Not this: <the rut, named>.
## Color   <strategy>; tokens: name hex role
## Type    families and roles; scale (ratio, steps); weights
## Space   scale; default gaps; density
## Shape   radii and where each goes; depth strategy
## Motion  how much and where (see ui-motion)
## Components  primitives library; icon set
## References  products to match in quality, and what to take from each
```

Never copy another product's logo, brand colors, or copy. Take its quality
bar and principles only.
