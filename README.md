# Agent skills

Skills for Claude Code and Codex that make agents finish work properly: prove
it runs, get it reviewed by a different model, keep the code small and clean,
and make the UI look designed rather than generated.

Each skill works on its own ("polish the UI", "review loop", "babysit the
PR"). `hands-off` chains them for a whole job you don't want to supervise.

## Install

```bash
git clone https://github.com/kuba001-pl/skills.git
mkdir -p ~/.claude/skills ~/.codex/skills
cp -R skills/skills/* ~/.claude/skills/   # Claude Code
cp -R skills/skills/* ~/.codex/skills/    # Codex
```

Install all of them: they call each other.

## Skills

The name is the phrase you say. Skills that act on their own (open PRs, run
unattended) start only on their exact words, so "ship it!" said as approval
opens nothing.

**Build**

| Skill | Say | What it does |
|---|---|---|
| `hands-off` | "hands off" | Takes a job end to end without you watching, with process sized to the job. Asks only when it must, and asks before merging. |
| `write-spec` | "write a spec", "spec it" | Turns a request into testable acceptance criteria, a quality bar, and a stack decision, with the important questions asked in one batch. |
| `prove-it` | "prove it", "show me it works" | Runs the real app, drives the real flows, screenshots each screen and state, measures performance, and reports what passed. |

**Review**

| Skill | Say | What it does |
|---|---|---|
| `review-loop` | "review loop", "second opinion" | The other model family reviews a change, plan, or decision, usually in 3 rounds or fewer. Only real findings get fixed. |
| `council` | "council" | Two or three independent reviewers score function, UX, UI, performance, reliability, accessibility, security, and code. Asked to fix, it re-scores until every score is 9/10 or better, for at most 3 rounds. |

**Ship**

| Skill | Say | What it does |
|---|---|---|
| `file-pr` | "file a PR" | Opens a clean PR that leads with the problem, then hands it to `babysit-pr`. |
| `babysit-pr` | "babysit the PR" | Watches a PR through CI and review bots, fixes real failures, answers false findings, and tells you when it is ready. |

**Design**

| Skill | Say | What it does |
|---|---|---|
| `ui-direction` | "ui direction", "write DESIGN.md" | Picks a visual direction from the product's own world, rules out generic AI looks, renders a specimen, and writes `DESIGN.md`. |
| `ui-craft` | (automatic when writing UI) | The quality floor for every screen: system, hierarchy, type, states, copy, platform details. |
| `ui-polish` | "polish the UI", "review the UI" | Measures and screenshots each screen, fixes what looks off or generated, and shows before and after. |
| `ui-access` | "fix accessibility" | axe-core plus a keyboard walkthrough, then fixes with native elements first. |
| `ui-motion` | "make it feel smoother" | Decides what should move at all, then sets exact durations, curves, and origins. |

## How `hands-off` works

It sizes the job first, so a bug fix does not get an app's process:

| | Small | Medium | Large |
|---|---|---|---|
| Looks like | bug fix, one component, about 100 lines | a feature, a few screens | new app, rebuild |
| Brief | a few criteria | `write-spec` | `write-spec` with a scope check |
| Design | `ui-craft` | plus `ui-direction` for new screens without a `DESIGN.md` | `ui-direction` first |
| Review | `review-loop` | `review-loop`, then a 2-seat `council` | `review-loop`, then the full `council` |

Then it plans milestones, builds each one (type checker, linter, and tests
every time, `prove-it`, commit, review), files the PR, babysits it, asks you
whether to merge, and reports. It asks questions only with the question
tool, early, and only when the answer changes what gets built. Everything
else it decides and lists in the report so you can override it.

## Shared rules

- **Never merges without your yes.** Not even when every check is green.
- **Proof, not claims.** Done means command output and screenshots from this
  session.
- **Bounded reviews.** Usually 3 rounds at most (5 only while a security or
  data-loss blocker stays open), an early stop when only nits remain, and
  review fixes may grow a change by at most half (or 50 lines).
- **Real findings only.** Refactors, extra tests, rare edge cases, and
  feature ideas become follow-ups, not code.
- **Two model families.** Claude and GPT review each other. Never Gemini or
  other Google models. GPT Sol always runs at `high`; Claude runs at
  `medium` or `high` depending on the task. Nothing runs above `high`.
- **Work folder.** Briefs, plans, and screenshots go in `.agent-work/`, which
  is added to `.git/info/exclude` and never committed.

## Requirements

- An authenticated [GitHub CLI](https://cli.github.com) (`gh`) for PRs.
- Node.js for `ui-polish`'s UI check (it installs Playwright and axe-core
  into `~/.cache/ui-polish-check` on first use), and `python3` for
  `babysit-pr`'s watcher outside T3 Code.
- Both model families for `review-loop` and `council`: the other family's
  CLI (Codex CLI from Claude Code, or Claude Code from Codex), or T3 Code's
  delegates. Without one, they fall back to a fresh agent of your own model
  and label the result `same-provider`.

## Configure

Put personal settings in your `CLAUDE.md` or `AGENTS.md`, so updating the
skills keeps them:

```markdown
## Skills config
- council members: Claude Opus, GPT Sol, GPT Sol
- review-loop reviewer: GPT Sol
- council budget: 3 rounds
```

## Develop

After editing a skill, run:

```bash
scripts/check-skills
```

It checks frontmatter against the Agent Skills rules, trigger clauses,
links and script paths, the Codex `agents/openai.yaml` files, emoji, the
reasoning-effort cap, and that every phrase in the tables above appears in
its skill's description.

## Credits and license

Adapted in part from open-source skill collections, credited in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Released under the
[MIT License](LICENSE).
