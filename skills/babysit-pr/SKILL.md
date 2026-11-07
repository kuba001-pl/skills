---
name: babysit-pr
description: Use when the user says "babysit", "babysit the PR", "watch this PR", or "get it green", and after file-pr files a PR. Watches a pull request through CI and review bots until it is ready to merge, fixes real failures and findings, answers false ones with a reason, and never merges without the user's explicit yes.
---

# Babysit PR

Get one pull request from "open" to "ready to merge" without the user
watching it: checks green, every review finding handled, and the branch up
to date.

## Pick the PR

Use the PR the user named (number or URL). Otherwise use the PR for the
current branch (`gh pr view`). If there is none, say so, and offer `file-pr`
to file one.

Record its URL, base, head branch, head SHA, author, checks, and review
state. If the head branch belongs to someone other than the user (a fork, or
a teammate's branch), ask before you push to it. If auto-merge is on, check who
enabled it (`gh pr view --json autoMergeRequest`). If the user did, that is
their yes: leave it on and say so. Otherwise turn it off and say so, but on
a PR the user does not own, ask first.

## Wait

Never write your own watcher, polling loop, or `sleep` loop. Use one watcher
per PR. Every watcher on a GitHub account shares one rate limit.

**In T3 Code:** handle the existing checks and comments first. Then call
`watch_pull_request` and end your turn. T3 Code wakes you when a check fails,
required checks pass, someone comments or reviews, or the branch conflicts.

- Only the thread that owns the PR watches it. A delegated child (a reviewer,
  a council member) never watches.
- A wake is news, not a merge decision. Check readiness yourself.
  `watch_pull_request` reports conflicts but not BEHIND, so check that too.
- Call `unwatch_pull_request` before you stop, hand off, or ask a question.
- "Stopped watching, could not read it" usually means the rate limit is used
  up. Check `gh api rate_limit --jq .resources.graphql`. If `remaining` is
  near 0, wait for `reset` with one background command before you watch
  again.

**Everywhere else:** use `scripts/pr-wait` from this skill's directory, by
absolute path.

```bash
pr-wait <pr> [--repo owner/name] [--until ready|green|any-change]
```

It prints one line per real event. It exits 0 when the condition is met or
the PR merges, 1 when it needs you (a check failed, a conflict, unresolved
threads, the PR closed), and 2 on bad input. `ready` (the default) means
required checks are green, Greptile or Macroscope reviewed the head, and no
threads are unresolved. Use `green` when the repo has neither bot.

In Claude Code, run it with the Monitor tool so each line wakes you. Set
`timeout_ms` to the maximum the tool allows. A monitor expires, so start it
again after every push, every exit 1, every expiry, and every resume. It
remembers what it already reported. If it says another pid already watches
the PR, do not start a second one.

In Codex, or any harness without a background wake, run `pr-wait` in the
foreground with the longest command timeout available, and run it again
after each exit until the PR is ready. Never end the turn while you wait,
because nothing will wake you.

When an event needs no action and a watcher will wake you again, end your
turn without a message. Never post or say "still waiting".

## Reviews and CI

- Act only on checks and comments newer than the latest push.
- Verify every bot finding against the source before you change code. Fix
  real findings and real CI failures. Tell repository failures apart from
  infrastructure flakes. Rerun a flake once (`gh run rerun <run-id> --failed`);
  report it if it fails again.
- A finding about code this PR did not touch is pre-existing. Reply with
  that and list it as a follow-up, unless the PR makes it worse.
- Bots review every push, so fixes can breed new findings. After 3 pushes
  driven by review findings, fix only failing checks and bugs in the
  intended case. Report the rest instead of pushing again.
- Dismiss a false positive with a written reason (see "Comments"), then
  resolve the thread.
- If the repo has `.macroscope/check-run-agents/*.md`, read those rules before
  you answer a Macroscope finding.
- CodeRabbit is advisory. Handle its findings like any others, but never wait
  for it or hold a merge for it.
- Human review comments get the same care. Do what a reviewer asked when it
  is right. When you disagree, reply with your reasoning and leave the thread
  open for them.
- Keep the PR at the size the goal needs. Decline extra tests, guards for
  edge cases that do not matter, extra compatibility, and tiny performance
  costs, with a reason. List them as follow-ups. Prefer the fix that deletes
  or narrows code. Review fixes may grow the PR by half its size when you
  started or 50 lines, whichever is more. Past that, only fixes for blockers
  and failing checks go in.
- Prove every fix that changes behavior before you push it (`prove-it`).
- Keep up with the base branch. Rebase when the PR is BEHIND or conflicts, or
  when new base commits touch its files. Push a rebase with
  `--force-with-lease` against the head you saw before it.
- If another PR makes this one obsolete, stop, report it, and ask before
  closing.

## Comments

Prefix every comment you post on the user's behalf with this note:

```md
> [!NOTE]
> **<model> responding on behalf of <user>**

The actual comment starts here.
```

- Use the verified public model name, or the harness name if the model is not
  exposed, and the user's name or GitHub login.
- This applies to PR comments, inline review comments, replies to bots and
  reviewers, and dismissal reasons. It does not apply to PR descriptions,
  commit messages, or text the user asked you to post verbatim.
- Lead with the conclusion. Cite the code, check, or reproduction. Keep it
  short, with no filler or thanks. Separate verified facts from judgment.
- Check for secrets and private details before you post. Confirm that GitHub
  returned the comment URL. Resolve a thread only after your reply posted.
- Post only comments that serve the user's request. Never post a status
  update.

## Ready

The PR is ready when all of these are true on the latest head:

- Required checks are green.
- Review bots have finished on the head, and every finding is fixed or
  dismissed with a written reason.
- No human review still requests changes.
- The branch is up to date with its base, and GitHub reports it as
  mergeable.

Then stop watching and report: the PR link, the head SHA, what you fixed,
what you dismissed and why, and anything still waiting on a human.

## Merge

Merge only when the user explicitly said to merge this PR, in the request or
in answer to a question. Otherwise report that it is ready and leave it open.

Before merging: `git fetch` and read the live PR again. Never merge when it is
BEHIND or DIRTY, when checks are not green, or when base commits that landed
after the last green run touch its files. Rebase, push, and wait for green
again. Merge with the repo's method, through branch protection as configured.
Never use `--admin` or another bypass. With a merge queue or auto-merge, stay
until GitHub reports the PR as merged.
