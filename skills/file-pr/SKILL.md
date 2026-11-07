---
name: file-pr
description: Use when the user says "file a PR", "open a PR", or "make a PR"; never for "ship it" said as approval. Turns the current work into a clean pull request with a short problem-first title and description, then hands it to babysit-pr. Never merges without the user's explicit yes.
---

# File PR

## 1. Get the branch ready

1. Check whether this branch already has a PR. If it does, update that one
   instead of opening a second.
2. If you are on the default branch, create a branch for the work. Commit
   with clear messages. Do not commit unrelated changes in the working tree;
   ask if it is unclear what belongs.
3. `git fetch` and rebase onto the latest base branch (usually
   `origin/main`). Review the full diff against it. The diff must match the
   goal, and nothing unrelated may ride along: no stray debug code, local
   config, or `.agent-work/` folder.
4. Run the checks the repo's CI runs. Do not file a PR you know is red. If
   the change has not been proven yet, prove it with `prove-it`.

## 2. Write it

**Title:** follow the repo's conventions (check recent merged PRs). Say why
the change matters, not how.

> Bad: perf(server): negotiate permessage-deflate on the websocket
>
> Good: perf(server): cut websocket frame size by 70%+ with gzipping

**Description:** open with the problem in plain words, based on the user's
request. Then explain the solution briefly. Do not lead with an inventory of
changes.

> Bad: Removed implicit workspace carry-over from every "new thread" entry
> point. Deleted buildContextualThreadOptions and the seed-context machinery.
>
> Good: My "new worktree" default was ignored when starting new threads. Super
> unintuitive. Now your preferences always apply.

Then add, in this order:

- one line on how you proved it, with screenshots if you can upload them
- the `council` results section, if the council ran
- the `review-loop` line, if it ran
- last: `Created with <model> in <harness>.` Include subagent models that
  wrote part of the change. Use the model names the harness reports. Never
  guess.

Check the title, description, and attachments for secrets and private
details.

## 3. File it

Push the branch and open a real PR, not a draft, so review bots run. If
`gh pr create` fails because the GraphQL rate limit is used up, use REST:
`gh api repos/<owner>/<repo>/pulls -f title=... -f head=... -f base=... -F body=@<file>`.

If the repo has no GitHub remote, say so and stop at a committed branch.
Never create a remote repository unless the user asks.

## 4. Babysit it

Continue with `babysit-pr` until the PR is ready. Stop sooner only if the user
asked only to file it.

Never merge unless the user explicitly said to merge, in the request or in
answer to a question. `babysit-pr` has the merge rules.

Report the PR link, how you proved it, and its state: ready, waiting for a
human review, or blocked (and on what).
