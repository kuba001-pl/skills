---
name: council
description: Use only when the user says "council" or asks for a 9/10 review panel, and as the final quality gate inside hands-off. Independent Claude and GPT reviewers score function, UX, UI, performance, reliability, accessibility, security, and code. On its own it scores once and changes nothing; asked to fix, it fixes and re-scores for up to 3 rounds.
---

# Council

A gate, not a vibe check. A score counts only if it rests on evidence, and a
low score counts only if it names a fix.

**Score** (the default: "run the council"): one round. Report the table and
findings. Change nothing. **Fix until it passes** (inside `hands-off`, or "get
it to 9/10"): the loop below.

## Before a round

- Fix mode only: fix what you already know is broken, answer open PR
  comments, and commit, so all members review one SHA. Score mode changes
  nothing and reviews HEAD plus the working tree as they are.
- Run every check and build an evidence pack with `prove-it` in
  `.agent-work/evidence/council-<n>/`.
- No `.agent-work/BRIEF.md`? Write a short one: what the product is for, what
  it does now, which dimensions are in scope. Describe it as it is. Missing
  features are follow-ups, never criteria.
- For a server app, start one production build for the round and give
  members its URL. Members never build, install, or start servers. Stop it
  when the round ends.

## Members

- Use the members the user's `CLAUDE.md` or `AGENTS.md` names. Otherwise:
  Claude Opus, GPT Sol, and a second fresh instance of the family that did
  not write the code (if neither did, the family other than your own). For a
  small change (one milestone, no new screen, under about 300 changed
  lines), or when the caller asks for two seats, use only the first two;
  both must then score every dimension. The user's config may also set the
  round budget.
- Never Gemini or any other Google model, even when it is offered.
- Reasoning effort: GPT Sol seats always `high`. Claude seats `high` for
  round 1, `medium` allowed for later rounds that only check fixes. Never
  `xhigh`, `max`, or anything above `high`.
- T3 Code: resolve models with `orchestrator_capabilities`, then one
  `delegate_task` per member in parallel (`role: "review"`). Set the effort
  option it lists (`reasoningEffort` for Codex, `effort` for Claude) to that
  level in `target.options`; defaults can be `low`. New delegates every
  round. Follow the `next` instruction each result returns (completion wakes
  you); do not poll `task_status`.
- Elsewhere: the other family's seats through its CLI, read-only, in the
  background, with the model and effort set, for example
  `codex exec -m <model> -c model_reasoning_effort=high --sandbox read-only
  "<brief>" </dev/null` (an open stdin hangs it), or `claude -p --model
  <model> "<brief>"` from Codex. Your own family's seats are fresh subagents.
- Only one family reachable: fill the seats with fresh subagents of it and
  label the council `partial: <model>` everywhere.

Members work alone. Never show them each other's scores, your opinion, or
the pass threshold. A member that errors or hits a rate limit gets one retry;
then its seat is `failed`. Never fill in a score yourself.

## Dimensions

The brief may mark a dimension N/A with a reason; members may not.

| Dimension | What a 9 means |
| --- | --- |
| Function | Every acceptance criterion works in the real app. |
| UX | Core tasks are obvious and short. Loading, empty, and error states exist where data does. Mistakes are recoverable. |
| UI | Looks professionally designed: clear hierarchy, one consistent system, rhythmic spacing, restrained color, right at every width and theme. None of the generic AI looks in `ui-direction`'s references. |
| Performance | Meets the brief's budgets, measured. No jank in core flows. |
| Reliability | Handles real input, network failure, and errors in intended use. No console errors. Core flows tested. |
| Accessibility | Keyboard-complete, named controls, AA contrast in every theme, visible focus, reduced motion respected. |
| Security | No secrets in code, input validated at boundaries, authz on the server. |
| Code | Follows the repo's existing structure and patterns, no duplicated logic, no dead code or speculative abstraction, no more code than the task needs. Type checker and linter pass. |

Anchors: **10** an expert would change nothing. **9** shippable, only nits.
**8** one issue a user or expert would notice. **6-7** clear problems.
**5 or less** broken or embarrassing.

## Member brief

```
Independent review panel member. Review only: no edits, commits, pushes,
PR comments, subagents, installs, builds, or servers. Read-only commands are fine.
Project: <abs path>  Commit: <sha>  Base: <sha or "new project">
Brief: <abs>/.agent-work/BRIEF.md (read first; it is the scope)
Evidence: <abs>/.agent-work/evidence/council-<n>/index.md and checks.md.
  ui-check-<theme>.json has measured contrast, overflow, and scale. Open screenshots
  for UI, UX, and accessibility; for other dimensions read the code.
Running app: <URL or "none">   Design bar: <abs path to ui-craft/SKILL.md>
Previous rounds: <finding ids and text only, without your verdicts; round 2+>
<dimensions table and anchors, minus N/A ones>
Score only what you observed. Every score below 10 cites a finding with a
concrete fix. If you cannot check a dimension (e.g. you cannot view images),
write "no score". Ideas beyond the brief go under FOLLOW-UPS and never lower
a score. Rare paths and extra hardening are nits and cannot hold a score
below 9 unless the brief names them. Round 2+: mark each old id "resolved" or "still open: <why>".
Reply exactly:
SCORES
<Dimension>: <n>/10 - <reason>
FINDINGS
C1 [blocker|should|nit] [<dimension>] <file:line or screenshot> <problem>. Fix: <change>.
FOLLOW-UPS
- <idea>
```

## The gate

Passes when, in one round on the current code, every score given for every
in-scope dimension is 9 or higher, and each dimension has at least two such
scores. `no score` is an abstention, not a pass: if too few members could
check a dimension, find one who can or ask. A score below 9 with no in-scope,
actionable finding is invalid after one request to justify it; record it as
`no actionable finding`.

## Between rounds

Check every finding yourself. Fix it only if it is a bug in intended use,
a security or data-loss risk, an accessibility failure, a broken criterion, a
visible UI or UX defect on an in-scope screen, or another concrete defect
holding a score below 9. One fix per root problem. Disagree with evidence
(`file:line`, a screenshot, a measurement); a finding still held after two
rounds of evidence is stuck, so ask (see "Budget"). Refactors, extra tests,
abstractions, rare-path hardening, and features are follow-ups. When the
council reviews a change, problems in code it did not touch are follow-ups.

**Size budget.** At round 1, record the commit and `git diff --shortstat
<base>`. Council fixes may grow the change by half its size or 50 lines,
whichever is more (a quarter for a new project). Past that, only blocker
fixes. Report the size before and after.

Then `prove-it` again (round 2+: only screens the fixes touched, plus
`ui-check` on every route), commit, and start new delegates. Log every round
in `.agent-work/LOG.md`: members, scores, findings and outcomes.

## Budget

Up to 3 rounds (or fewer when the caller sets it), including re-checks after
the PR is filed. If the gate has
not passed and a round does not raise the lowest valid score, stop. When you
stop without a pass, ask with the question tool: the table, open findings,
both sides of disputes, and one recommendation (more rounds, accept, or cut
scope). Inside `hands-off`, finish the PR's CI first and ask together with the
merge question. Running out of budget is not a pass.

## Results

Edit the PR description (above the model line), or put it in the final reply
when there is no PR:

```markdown
## Council review

Gate: every score ≥ 9/10, two or more per dimension. Result: passed in 2 rounds.

| Dimension | Claude Opus | GPT Sol |
| --- | --- | --- |
| Function | 10 | 9 |
| UI | 9 | 9 |

Lowest score by round: 7 → 9
```

One row per in-scope dimension, final round's scores, `no score` where none was given, `partial` in the gate
line when it applies.
