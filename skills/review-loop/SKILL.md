---
name: review-loop
description: Use when the user says "review loop", "second opinion", or "get a second opinion". The other model family (GPT if you are Claude, Claude if you are GPT) reviews a change, plan, or decision, usually in 3 rounds or fewer, and only real findings get fixed.
---

# Review Loop

A different model family catches what yours misses. Make the smallest changes
that answer real findings, and push back on everything else.

- **Code change** (default): the loop below.
- **Review only** ("what does GPT think?"): round 1, then report each finding
  with your own verdict. Change nothing.
- **Plan, design, or decision** ("Tauri or Electron?"): the decision brief,
  at most 2 rounds. Report both positions and your recommendation.

```
Second opinion only. No edits, commits, pushes, or subagents.
Repo: <abs path>  Read: <files that matter>
Question: <one sentence>  Constraints: <user's words, stack, scale>
My answer: <recommendation>  Because: <two or three lines>
Argue against my answer first, with evidence. Then say whether you agree.
Reply: VERDICT: AGREE or DISAGREE / Against: / Missing: / Recommendation:
```

## Reviewer

- The model the user's `CLAUDE.md` or `AGENTS.md` names, otherwise the other
  family's flagship: GPT Sol if you are Claude, Claude Opus if you are GPT.
- Never Gemini or any other Google model, even when it is the only other
  model offered.
- Reasoning effort: GPT Sol always runs at `high`, never lower. A Claude
  reviewer may use `medium` for small, low-risk changes (copy, style, docs,
  a Small job) and for rounds that only check fixes, and `high` otherwise.
  Never `xhigh`, `max`, or anything above `high`.
- T3 Code: resolve the model with `orchestrator_capabilities`, then a new
  `delegate_task` every round (`role: "review"`). Set the effort option it
  lists (`reasoningEffort` for Codex, `effort` for Claude) to that level in
  `target.options`; defaults can be `low`. Follow the `next` instruction
  the result returns (completion wakes you); do not poll `task_status`.
  Never use thread tools for review.
- Elsewhere: the other family's CLI, read-only, with the model and effort
  set, for example `codex exec -m <model> -c model_reasoning_effort=high
  --sandbox read-only "<brief>" </dev/null` (an open stdin hangs it), or
  `claude -p --model <model> "<brief>"` from Codex.
- Other family unreachable: a fresh subagent of your own model, labeled
  `same-provider` in the ledger and report.

One reviewer at a time. It must not start subagents. Do not edit the files
under review while it runs. A timeout, an error, or silence is not approval.

## Budget

3 rounds. Extend to 5 only while a blocker or should stays open on security,
auth, permissions, data loss, or concurrency, or when the user asks. Inside
`hands-off`: 2 per milestone. Stop early when a round returns only nits.
Doc-, comment-, and formatting-only fixes need no new round.

## The loop

1. **Scope.** `git status --short`; never stash, discard, or include
   unrelated work. Base: merge base with the PR's base or default branch (or
   the milestone's first commit in `hands-off`). Commit first and review the
   range, unless the change is the user's uncommitted work and they did not
   ask you to commit: then review the working tree. Run the checks that cover the change; don't send
   code that fails them. Record `git diff --shortstat <base>`.
2. **Brief.** The reviewer has no history:

   ```
   Review only. No edits, commits, pushes, PR comments, or subagents.
   Repo: <abs path>  Base: <sha>  Head: <sha or "working tree">
   Diff: git diff <base> [<head>]   (working tree: also read untracked files)
   Intent: <one or two sentences>  Out of scope: <...>
   Criteria: <relevant lines from .agent-work/BRIEF.md, if any>
   Checks: <commands and results>  Evidence: <index.md path, if any; open screenshots>
   Design bar for UI: <abs path to ui-craft/SKILL.md>, if the change has UI
   Read the surrounding code. Find bugs, broken callers, gaps against the intent, and visible UI or UX
   defects. Flag code that ignores the repo's existing patterns, duplicates a
   helper that exists, or sits in the wrong layer. Skip style. Flag code,
   tests, or guards the intent does not need.
   blocker = intended case wrong. should = real bug users hit in scope.
   nit = everything else (rare paths, small perf, extra compatibility).
   Reply: VERDICT: APPROVE or CHANGES
   L1 [blocker|should|nit] <file>:<line> <claim>. Fix: <suggestion>
   (keep ids stable across rounds)
   ```

3. **Triage.** Check every finding yourself; a rare path is a nit whatever
   its label. Fix only bugs in intended use, security or data-loss risks,
   accessibility failures, broken criteria, and visible UI or UX defects in
   the changed screens. Use the smallest fix; prefer deleting or narrowing
   code. Disagree with evidence (`file:line`, a test, output). Refactors,
   extra tests, abstractions, rare-path hardening, features, and bugs in
   untouched code (unless the change makes them worse) are follow-ups.
   Re-run the checks after fixing. Never agree just to end the loop.
4. **Size budget.** Review fixes may grow the diff by half its size or 50
   lines, whichever is more. Past that, only blocker fixes; cut back first.
5. **Ledger** in `.agent-work/LOG.md` if it exists, else your notes: round,
   model, id, severity, outcome (`fixed`, `disagree`, `declined`), evidence.
6. **Next round** only if budget remains and a blocker or should is open, or
   behavior changed since the last approval. Send the brief, the ledger, and
   the diff since last round; ask for each old id `resolved` or `still open`.
7. **Stop** when the reviewer approves the current diff and nothing serious
   is open, or when a dispute survives two replies or the budget runs out.
   Then write both sides briefly; inside `hands-off`, decide if reversible
   and record it, otherwise ask the user. Out of budget is not approval.

Don't push during the loop. Report rounds, the reviewer model (`same-provider`
if so), what review changed, diff size before and after, and declined
findings with reasons. In a PR description, above the model line:

`Reviewed with review-loop: <n> rounds with <model>. Verdict: <reviewer's last VERDICT, verbatim>.`

Name any finding still open. Never report a verdict the reviewer did not give.
