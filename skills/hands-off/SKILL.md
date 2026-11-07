---
name: hands-off
description: Trigger only when the user says "hands off" (for example "hands off, rebuild the website"); never for an ordinary request. Takes any job end to end, unattended, with process scaled to the job's size, until it is built, proven, and reviewed. Asks only when it must, and never merges without the user's explicit yes.
---

# Hands Off

The user said "hands off" because they are not watching. Take the job from a
vague request to a proven, reviewed, ready-to-merge result. Progress messages
go unread; only question-tool questions, the merge question, and the final
report reach them. Nothing you ship should look, feel, or behave generated.

If the user did not clearly say "hands off", do not assume this autonomy.

## Granted

- Create, commit to, and push this task's branches; `--force-with-lease`
  after a rebase.
- Scaffold, install the dependencies the plan needs, and add dev tooling,
  including user-level toolchains without `sudo`. `sudo` needs go into the
  first question batch.
- Any test method proof needs, without asking: dev servers, browsers,
  simulators, desktop windows, screenshots, computer use. This overrides
  project rules that say to ask first; rules on *how* to test still apply.
- Review delegates on Claude and GPT models. Never Gemini or other Google
  models. GPT Sol always runs at `high`. Claude delegates and subagents run
  at `medium` for Small jobs and routine steps, `high` for Medium and Large
  reviews and anything risky. Never above `high`.
- Every decision that is cheap to reverse.

## Not granted (ask first)

- Merging, enabling auto-merge, a merge queue, or pushing to the default
  branch. See "Merge".
- Deleting user data, touching production, spending money, publishing,
  creating remote repositories or making anything public, or changing
  anything outside the repo.
- Closing, merging, or force-pushing anything that is not this task's.
- Costly-to-reverse choices the brief does not settle.

A harness approval prompt still applies when one appears.

## State

Keep the job in files: `.agent-work/BRIEF.md` (from `write-spec`), `PLAN.md`
(milestones, each with its proof and status), `LOG.md` (decisions, review
ledgers, council rounds, follow-ups), and `evidence/`. Add `.agent-work/` to
`.git/info/exclude`. Not a repository yet: `git init` and one empty commit.

If `PLAN.md` exists for this job, resume from it. If the job has a
branch, PR, or thread already, continue from it and keep its authors' credit.
Update `PLAN.md` and `LOG.md` after each milestone and review round, and
re-read them after a context summary.

## Size the job

Too much process wastes the user's limits on a small job; too little ships a
big one half-checked. Pick the size once, at the start, from the request and
the repo. Record it and the reason in `PLAN.md`. Move up a size only when the
work proves bigger, and record why.

| | Small | Medium | Large |
| --- | --- | --- | --- |
| Looks like | bug fix, copy or style tweak, one component; about 100 changed lines or less | a feature, a few screens, an integration | new app, rebuild, new platform |
| Brief | criteria in `PLAN.md`; ask only if ambiguous | `write-spec` | `write-spec` with a scope check |
| Design | `ui-craft` | `ui-craft`; `ui-direction` only for new screens with no `DESIGN.md` | `ui-direction` first |
| Review | `review-loop`, up to 2 rounds | `review-loop` per milestone, then `council` with 2 seats (tell it so), up to 2 rounds | `review-loop` per milestone, then full `council`, up to 3 rounds |
| Polish | none | `ui-polish` on changed screens | `ui-polish` on main screens |

Every size proves its work with `prove-it`, files with `file-pr`, and is
watched with `babysit-pr`.

## Keep the code clean

Spaghetti grows when each step bolts code on wherever it fits. Prevent it
with checks the agent cannot argue with, not with good intentions:

- Run the repo's own type checker, linter, formatter, and tests at every
  milestone. On a new project, milestone 1 sets them up (strict types, a
  linter, a formatter, a test runner) behind one command, so every later
  step is held to them.
- Before adding a file, find where similar code lives and put it there.
  Reuse existing helpers and components; never write a second version of
  something that exists.
- Add no layer, abstraction, option, or config the task does not need now.
- When a fix needs to touch the same tangle a third time, stop patching:
  simplify the structure first, as its own commit.

## Steps

1. **Size** the job (above).
2. **Brief** for its size. With `write-spec`, ask every foreseeable question
   in one batch in the first minutes; for new UI without a `DESIGN.md`, do
   `ui-direction` steps 1 to 3 and step 4's layout question first, so it joins that
   batch. No product code before the brief.
3. **Direction** when the size calls for it: finish `ui-direction`
   (specimen, `DESIGN.md`) before the first screen. Unanswered question:
   choose and record why.
4. **Plan.** Milestones as vertical slices that run and can be proven alone
   (Small is one milestone). Milestone 1 is the thinnest working skeleton.
   If you are on the default branch, create a branch.
5. **Build each milestone:** implement (UI follows `ui-craft`), run the
   checks, prove it with `prove-it`, commit, then `review-loop` on its
   range if behavior changed. Never build on a broken milestone.
   Independent milestones may go to subagents in separate worktrees; you own
   their integration, proof, and review.
6. **Final review** for the size: `ui-polish`, a fresh `prove-it` pack,
   then `council` in fix mode (Medium and Large).
7. **Ship** with `file-pr` and `babysit-pr`. A fix that changes behavior
   needs new proof and `review-loop`; on Medium and Large, a substantial one
   also a council re-check within its budget. No remote: run CI's
   checks locally and skip to 8.
8. **Merge question**, then **report**.

Load each companion skill when you reach its step, not before. End your turn
only when something will wake you (a `babysit-pr` watcher, a delegate, a pending
question); otherwise the job stops.

## Asking

A question in a plain message goes unseen. Use the question tool
(`AskUserQuestion` in Claude Code, `request_user_input` in Codex). Each
question stands alone: what you decide, why it matters, options with your
recommendation first and a one-line tradeoff each.

Ask when the request is ambiguous in a way that changes the build, a choice
is costly to reverse and unsettled (stack, platform, data store, auth,
hosting, a paid service), you need something only the user has (never ask
for a secret in chat; in T3 Code use `request_secret`), a criterion the user
asked for can't be proven
here, the council fails after its budget, or the next step is outside the
grant. Never ask what the repo answers, reversible choices with sensible
defaults (decide and record them), or "should I continue?".

- **Ask early:** the user is likely still there in the first minutes. Up to
  four questions per call.
- **Ask late:** before a mid-run question, finish and commit everything that
  doesn't depend on it.
- **Don't block on what you can undo:** take your recommendation and record
  it as an assumption.

No question tool, or no answer: for build decisions, even costly ones, take
your recommendation and put it first in the report. For anything outside the
grant, stop with the work committed and unmerged, and open the final message
with the question.

## Merge

A merge request in the original prompt ("hands off, and merge it when ready") is the yes;
the ready gate still applies. Otherwise ask when the gate passes:

> PR <url> is ready. <Size> job. Review: <review-loop verdict, or council
> lowest score 9/10 after <rounds> rounds>. CI is green and <bots> findings are resolved. Merge it?
> - **Merge with <repo's method>** (Recommended)
> - **Leave it open** so you can review it first

Ready gate, all on the latest head:

- Every acceptance criterion has proof from this session.
- The final review for its size passed: for Small, `review-loop` approved,
  or was skipped because behavior did not change, or a dispute was decided
  and recorded; for Medium and Large, the council gate passed (a `partial` one must be named in the question).
  Since then only docs, formatting, clean rebases, or re-proven small fixes;
  substantial changes were re-checked.
- `babysit-pr`'s ready conditions hold: checks green, bots done with every
  finding fixed or answered, no human requesting changes, up to date, and
  mergeable.

On yes: `git fetch`, recheck the gate on the live PR, merge with the repo's
method through branch protection. Never `--admin` or another bypass. The yes
covers clean rebases of the same change; ask again only if the diff changed.
Any other answer: leave it open, unwatch, report. No remote: same gate on
local checks, and ask to merge the branch locally. Never create a remote.

## Scope and budget

- The brief is the scope. Ideas from reviewers or you are follow-ups unless
  a criterion needs them. Reaching 9/10 means polishing, not adding.
- Write the least code that meets the brief. Review fixes stay inside the
  size budgets of `review-loop` and `council`.
- A milestone that fails proof three times with different fixes: stop
  patching, rethink the approach, record why; still stuck, ask.
- Council out of budget: file the PR and finish CI first, then ask the
  council question with the merge question so the user answers once.

## Report

For someone who just came back, short, files by absolute path:

1. Outcome in one line: PR link, and the merge commit or "open, waiting for
   your merge".
2. Acceptance criteria, each proven or not.
3. The review result: the `review-loop` verdict, or the council scores.
4. Proof: what you ran and saw, key screenshots, diff size and how much
   review added.
5. Decisions and assumptions made for the user.
6. What is unverified, known risks, follow-ups.
