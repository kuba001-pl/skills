---
name: write-spec
description: Use when the user says "write a spec", "spec it", or "spec this", at the start of hands-off, or when a big or vague request ("rebuild the website", "make me a desktop app") needs pinning down before code. Writes a brief with testable acceptance criteria, a quality bar, and a stack decision, and asks the questions that matter in one batch.
---

# Write Spec

Most bad output is the wrong thing built well. Make "done" concrete enough
that someone who missed the conversation could check it.

Write `.agent-work/BRIEF.md` (add `.agent-work/` to `.git/info/exclude`
first). On your own, show the user the brief at the end and offer to change it.

Be quick: the user is most likely still around right after asking. Look just
enough to ask good questions, ask, and do the deep inventory after the
answers arrive.

## 1. Look before you ask

Read `README`, `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, manifests, the app's
structure, recent history, and any issue, PR, or URL the user mentioned.

For a rebuild, inventory what must survive: screens, features, content,
integrations, inbound URLs, analytics, SEO. Screenshot a live site into
`.agent-work/evidence/before/`. Every item is kept or listed under Out of scope
with a reason. Losing a feature users rely on is a regression.

## 2. Acceptance criteria

Numbered, observable, testable, each with its proof:

> Bad: Good onboarding UX.

> Good: A new user signs up and lands on a populated dashboard in under 60
> seconds without docs. Proof: e2e test plus screenshots of each step at
> 375 px and 1280 px.

Write criteria only for what the user asked for, plus what it cannot work
without. Features you think would be nice (export, sync, an installable app,
history) are not criteria: offer the best one or two as a question and list
the rest under Out of scope. A brief that grows the request starts scope creep.

When the user gave no budgets, use these and mark them "default":

- **Web:** Lighthouse performance, accessibility, best practices ≥ 90 on
  mobile; LCP < 2.5 s, CLS < 0.1, TBT < 200 ms; no console errors; correct at
  375, 768, 1280 px (and 1920 if the layout stretches) and in each theme.
- **Desktop:** interactive within 2 s of cold start; native menus, shortcuts,
  and persisted window state.
- **Mobile:** clean launch; smooth scrolling; safe areas, dynamic type, dark
  mode, 44 pt touch targets.
- **Any view that loads data:** loading, empty, and error states.

## 3. Quality bar and stack

List the `council` dimensions in scope; mark one N/A only with a
reason (a CLI has no visual UI). Note design constraints, such as an existing
brand in `DESIGN.md`.

Use the repo's stack. A rebuild is not permission to switch: a switch needs a
written reason and, unless the user asked for it, a question. For a new
project, pick mainstream tools you can run, test, and screenshot here, and
check current versions in the registry, not from memory. Write options, pick,
and why in three lines. Ask only when options differ in what the user cares
about (distribution, size, licensing, cost, reach, team skills):

> Desktop shell: **Tauri** (Recommended: small binaries, low memory) or
> **Electron** (heavier, all JavaScript, most mature)?

## 4. Questions

Ask every question whose answer changes the build and the repo can't answer,
ranked by impact, with the question tool, up to four per call, your
recommendation first. For a rebuild: keep content? keep URLs? keep the
stack? is the brand changing?

For a big job with an ambiguous request, one question confirms scope: what
you will build in 5 to 10 bullets (features, screens, platforms, stack,
what's out), with "Build this" (Recommended) or "Change it". Use the option
preview when the tool has one. When the request is already specific, record
your reading under Assumptions instead.

Decide everything else yourself. Never put a secret in the brief.

## 5. BRIEF.md

```markdown
# Brief: <title>
Request: "<the user's words, verbatim>"
## Intent            who uses it, what for, what great looks like
## Platforms
## Current state     what exists and must survive, or "new project"
## Acceptance criteria
1. <criterion>. Proof: <how>.
## Quality bar       In scope: ... N/A: ... (reason). Budgets: ... (default)
## Stack             decision and why
## Answers           question -> answer
## Decisions         choices the user may override
## Assumptions
## Out of scope
```

Keep it to what changes the build. A brief nobody finishes prevents nothing.
