# Git Learning Notes

A progressive, hands-on guide to **Git** — from the object model and commits through branches, merge, rebase, cherry-pick, stash, reset vs restore vs revert, reflog, bisect, remotes, conflict recovery, hooks, and pull-request workflow. Each lesson builds on the last. Read the takeaway, study the explanation and commands, then try the exercise in a throwaway clone (not on a shared `main`).

Git is the tool. GitHub, GitLab, Azure DevOps, and Cursor’s Source Control panel are hosts and UIs on top of it. Interview Q&A for this topic lives at [`/notes/git`](/notes/git).

---

## Objects, commits & the working tree

### Lesson 1. What Git stores: blobs, trees, commits, and refs

**Takeaway:** Git is a content-addressed database. A **blob** is file contents, a **tree** is a directory listing, a **commit** is a snapshot plus metadata, and a **ref** is a name that points at a commit.

**Explain:** When you commit, Git does not store “a diff of the project” as the primary object. It stores a snapshot. Unchanged files reuse the same blob hash, so snapshots are cheap.

```text
commit  e3a1…   message, author, parent(s)  ──►  tree  9f2c…
                                                      ├── blob  a11  README.md
                                                      ├── tree  b22  src/
                                                      │     └── blob  c33  app.ts
                                                      └── blob  d44  package.json

ref  refs/heads/main  ──►  e3a1…
ref  HEAD             ──►  refs/heads/main   (you are on main)
```

Every object is named by a SHA-1 or SHA-256 hash of its contents. Change one byte in a file and you get a new blob and a new tree and a new commit. The old commit still exists until garbage collection.

A **branch** is not a copy of all files. It is a ref — a movable pointer. `main` and `feature/login` can point at the same commit; creating a branch does not duplicate the project.

```powershell
git cat-file -t HEAD          # commit
git rev-parse HEAD            # full hash
git log -1 --format="%T %P"   # tree and parent(s)
```

**Tip:** When someone says “Git stored a diff,” they mean Git *can compute* diffs between snapshots. The object you revert or cherry-pick is still a commit pointing at a tree.

**Try it:** In a throwaway repo, make one commit. Run `git cat-file -p HEAD` and `git cat-file -p HEAD^{tree}`. Identify the tree hash and at least one blob hash.

---

### Lesson 2. The four areas: working tree, index, local repo, remote

**Takeaway:** Every change lives in one of four places: the **working directory** (files on disk), the **index / staging area**, the **local repository** (`.git`), or a **remote**. The daily loop is edit → add → commit → push.

**Explain:**

```text
Working directory   git add    Staging (index)   git commit    Local repo     git push     Remote
(your file edits) ──────────►  (next snapshot)  ────────────►  (commits)    ──────────►  origin
```

`git status` is the map of these areas. “Changes not staged” are only on disk. “Changes to be committed” are in the index. “Your branch is ahead of origin/main by 1” means the local repo has a commit the remote does not.

```powershell
git status
git diff              # working tree vs index (unstaged)
git diff --staged     # index vs HEAD (what the next commit will be)
```

`git add` copies the file’s current bytes into the index. If you edit again after adding, you have **both** a staged version and a newer unstaged version. Commit records only the index.

Fetch and pull bring remote commits into the local repo (and, for pull, update your branch). They do not automatically clean unstaged work — that is why dirty trees block checkouts.

**Tip:** If you are unsure what will be committed, run `git diff --staged` every time before `git commit`. The habit prevents “oops, I staged .env.”

**Try it:** Edit a file, run `git status` and both diffs. `git add` it, run the diffs again. Edit the same file once more and observe two layers of change.

---

### Lesson 3. Making good commits: add, status, and messages

**Takeaway:** A commit is a snapshot you could revert, cherry-pick, or explain in a PR. Stage related files together, write a subject that says **why**, and keep secrets out of history.

**Explain:** `git add path` stages one path. `git add -p` stages hunks. `git commit -m "Subject"` creates the object. Many teams prefer a short subject (≤72 chars) plus a body when the why is not obvious.

```powershell
git add src/lib/notes/parse-markdown.ts
git add -p src/app/notes.css
git status
git commit -m "Fix learning-note parser dropping Try it text"
```

A useful subject is an imperative clause: “Fix…”, “Add…”, “Remove…”. “WIP” and “misc” force reviewers to open the diff to learn anything. One logical change per commit makes `git bisect` and `git revert` possible later (Lessons 17 and 20).

`git commit --amend` rewrites the **latest** commit if it has not been pushed (Lesson 27). Do not amend commits other people already pulled.

Never commit `.env`, private keys, or `node_modules`. Fixing that after a push means rotating secrets — history still contains the file.

**Tip:** If the change set feels like two sentences (“refactor parser” and “tweak button color”), make two commits. Future you will thank present you during a revert.

**Try it:** In a toy repo, make a sloppy “misc” commit, then reset it softly (Lesson 15) and recut it as two commits with real subjects.

---

### Lesson 4. HEAD is where you are now

**Takeaway:** **HEAD** is a pointer to your current position. Normally it points at a **branch name**; that branch points at a commit. Commands like checkout, switch, reset, and rebase move HEAD.

**Explain:** In `.git/HEAD` you usually see `ref: refs/heads/local` — an indirect pointer. `HEAD~1` is the first parent of the current commit. `HEAD^2` is the second parent of a merge commit.

```powershell
git rev-parse HEAD
git rev-parse --abbrev-ref HEAD    # current branch name
git log -1 --oneline
git show HEAD~1 --oneline
```

When you `git switch main`, HEAD is attached to `main`. When you `git switch --detach e3a1` (or check out a raw hash or a tag), HEAD points **at the commit itself**. New commits in that state are easy to lose — that is **detached HEAD** (Lesson 8).

`origin/main` is **not** HEAD. It is a remote-tracking ref updated by fetch. You can be on `local` (HEAD → `local` → commit A) while `origin/local` still points at commit B.

**Tip:** Draw three boxes: HEAD → branch → commit. Most “I am lost” moments are one of those three pointing somewhere unexpected. `git status` first line tells you which branch HEAD is attached to.

**Try it:** Run `type .git\HEAD` (PowerShell) or `cat .git/HEAD`. Switch branches and watch the file change. Then `git switch --detach HEAD~1` and read `git status`.

---

### Lesson 5. `.gitignore` and what must never be committed

**Takeaway:** `.gitignore` lists **untracked** paths Git should not propose to add. It does not untrack files already in history. Secrets, build output, and editor junk belong there.

**Explain:** Patterns are matched from the file’s directory downward. `/` at the start means “only at this level.” `!` negates.

```gitignore
# dependencies and build
node_modules/
.next/
dist/

# secrets and local env
.env
.env.*.local

# OS / editor
.DS_Store
*.log
```

If you already committed `.env`:

```powershell
git rm --cached .env
# add .env to .gitignore
git commit -m "Stop tracking .env"
```

`rm --cached` removes the file from the **index** but leaves it on disk. You must still **rotate** the secret; the old blob remains in older commits until history is rewritten (and even then, assume it leaked).

`git check-ignore -v path` tells you which rule hid a file. `git status --ignored` lists ignored paths.

**Tip:** Commit `.gitignore` itself. Do not ignore it. Teams share the ignore rules; they do not share `.env`.

**Try it:** Create `tmp.secret`, confirm `git status` sees it, add a ignore rule, confirm it disappears. Then `git add -f tmp.secret` to see how force-add bypasses ignore (do not push that).

---

## Branches

### Lesson 6. Branches are movable pointers

**Takeaway:** A branch is a name that points at a commit. Committing while that branch is checked out **moves the name forward**. Creating a branch is cheap because Git does not copy files.

**Explain:** After three commits on `main`, `main` points at C. `git branch feature/login` creates a second name also pointing at C. Checkout `feature/login` and commit D: `feature/login` now points at D; `main` still points at C.

```text
A──B──C     ← main
       \
        D   ← feature/login (HEAD)
```

```powershell
git branch                  # list local
git branch feature/login    # create, stay where you are
git switch feature/login    # move HEAD to that branch
git switch -c feature/login # create and switch
```

`git switch` (and older `git checkout`) updates the working tree to match the target commit. Uncommitted changes that would be overwritten will block the switch (Lesson 21).

Long-lived branches (`main`, `develop`, `qa`) are integration lines. Short-lived branches (`feature/…`, `fix/…`) should live days, not months — the longer they live, the harder the merge.

**Tip:** Name branches after the work, not after yourself (`feature/auth-refresh`, not `sawata`). PR titles and CI labels will copy the name.

**Try it:** Create `feature/demo`, add a commit, run `git log --oneline --decorate --graph --all`. Confirm two refs and one extra commit.

---

### Lesson 7. Creating, switching, and listing branches

**Takeaway:** `git switch -c name` is the daily create-and-go command. `git branch -vv` shows tracking. Delete merged locals with `git branch -d`; use `-D` only when you intend to drop unmerged work.

**Explain:**

```powershell
git switch main
git pull
git switch -c feature/notes-git
# ... commits ...
git branch -vv
git switch main
git branch -d feature/notes-git    # safe delete if merged
git branch -D feature/notes-git    # force
```

`git branch -a` lists remotes too (`remotes/origin/feature/notes-git`). After a PR merge you fetch and prune:

```powershell
git fetch --prune
git branch -vv
```

Gone remotes show `[gone]` — those locals are safe to delete.

Switching with a dirty tree: Git allows it if the changes apply cleanly on the target. If they would overwrite a different version of the file, Git refuses. Stash, commit, or `git switch -m` (merge-style, use with care) are the exits.

**Tip:** Always update `main` (or your team’s base) **before** branching. A feature cut from a week-old `main` is a rebase you could have avoided.

**Try it:** From an updated `main`, create a branch, commit, switch back, delete with `-d` (should fail if not merged), then `-D`. Recreate the branch from the old hash using reflog if you still need it (Lesson 19).

---

### Lesson 8. Detached HEAD and how to recover

**Takeaway:** Detached HEAD means HEAD points at a commit hash, not a branch. You can look around safely. If you **commit** while detached, create a branch immediately or those commits become dangling.

**Explain:** You detach when you check out a tag, a remote-tracking ref, or a raw SHA (`git switch --detach abc1234`). `git status` says “HEAD detached at …”.

```powershell
git switch --detach HEAD~3
git log -1
# just looking? switch back:
git switch main

# you committed by accident?
git switch -c rescue/detached-wip
```

`git switch -c rescue/…` creates a branch at the current detached commit so the name holds the work. Without that, the next checkout leaves the commit referenced only by reflog.

Exploring an old release (`git switch --detach v1.2.0`) is a good use of detached HEAD. Building a feature there is not.

**Tip:** Treat detached HEAD as read-only unless you immediately name a branch. Cursor and `git status` both shout; believe them.

**Try it:** Detach at `HEAD~1`, make a dummy commit, run `git switch main` (the commit looks “gone”), then `git reflog` and `git switch -c rescue <hash>` to get it back.

---

## Integrating history

### Lesson 9. Fast-forward vs diverged histories

**Takeaway:** A **fast-forward** moves your branch pointer forward because you have no unique commits. **Diverged** means both sides have commits the other lacks — pull must merge or rebase.

**Explain:**

```text
Fast-forward (you are just behind)
you:     A──B──C
origin:  A──B──C──D──E
after:   A──B──C──D──E   (pointer moved; no merge commit)

Diverged
you:     A──B──C──F
origin:  A──B──C──D──E
```

```powershell
git status
# "Your branch is behind 'origin/main' by 5 commits, and can be fast-forwarded."
git pull                 # or git merge --ff-only origin/main
```

`--ff-only` refuses to create a merge commit. That is a good default for updating `main` locally: if it cannot fast-forward, you should look at what you accidentally committed on `main`.

Cursor may show “behind by 5 (fast-forward).” That is this lesson in the UI.

**Tip:** If you only meant to consume remote commits, prefer `git pull --ff-only`. A surprise merge commit on `main` is Lesson 10 happening when you did not ask.

**Try it:** Clone a toy repo twice (two folders). Commit in A, push. In B, `git status` should say behind / fast-forward. Pull and inspect `git log --oneline --graph`.

---

### Lesson 10. Merge: combining two lines of work

**Takeaway:** `git merge other` joins `other` into your current branch. If histories diverged, Git creates a **merge commit** with two parents. Conflicts pause the merge until you fix and `git commit`.

**Explain:** Checkout the branch that should **receive** the work (usually `main` or `develop`), then merge the feature:

```powershell
git switch main
git pull --ff-only
git merge feature/notes-git
```

```text
A──B──C────────M     ← main
       \      /
        D──E         ← feature/notes-git
```

`M` has parents C and E. `git log --first-parent` follows C’s line (good for reading `main`). Default merge is a “true merge.” `git merge --no-ff` always creates `M` even if a fast-forward was possible — some teams want every feature visible as a bubble.

On conflict, Git writes markers into files (Lesson 21). You are **in** a merge until you `git merge --continue` / `git commit` or `git merge --abort`.

**Tip:** Merge **into** the integration branch in a PR on the host, not only on your laptop, so CI and review run. Local merge is for understanding and for integrating `main` *into* your feature before the PR.

**Try it:** Diverge two branches (one commit each on the same file, different lines). Merge and read `git log --oneline --graph`. Then abort a conflicting merge with `--abort`.

---

### Lesson 11. Rebase: replaying your commits on a new base

**Takeaway:** `git rebase main` takes your unique commits, sets your branch to `main`, and **replays** those commits one by one as new SHAs. History looks linear. You rewrote your commits.

**Explain:**

```text
Before
A──B──C           ← main
       \
        D──E      ← feature (HEAD)

After git rebase main
A──B──C           ← main
       \
        D'──E'    ← feature (HEAD)
```

D' and E' have new hashes. The old D and E still exist until GC (reflog can find them).

```powershell
git switch feature/notes-git
git fetch origin
git rebase origin/main
# conflicts: fix, git add, git rebase --continue
# give up:     git rebase --abort
```

`git pull --rebase` is fetch + rebase onto the upstream branch — the usual way to update a **feature** branch you have not shared, or have shared only with yourself.

Never rebase commits that other people have based work on (shared `main`, a teammate’s long-lived branch) unless the team agrees to a coordinated force-push.

**Tip:** Rebase **your** unpushed (or solo) feature onto latest `main`. Merge (PR) **into** `main`. That one rule prevents most history fights.

**Try it:** Put two commits on a feature, add a commit on `main`, rebase the feature. Compare `git log --oneline` hashes before (save them) and after.

---

### Lesson 12. Merge vs rebase: when to use each

**Takeaway:** Rebase to **update a feature** so the PR is a clean stack on current `main`. Merge (or squash-merge on the host) to **integrate** a reviewed feature. Do not rebase shared integration branches.

**Explain:**

| Situation | Prefer |
| --------- | ------ |
| Feature behind `origin/main`, only you use the branch | `git rebase origin/main` |
| Integrate a finished PR into `main` | Merge / squash merge on GitHub |
| Bring a teammate’s branch into yours as a snapshot | Merge (preserves their SHAs) |
| Shared `develop` that five people pull | Merge; no rebase + force-push |
| You already pushed the feature and work alone | Rebase + `push --force-with-lease` |

`git pull` without rebase on a diverged feature creates a merge commit that is just “I synced.” Reviewers hate reading those. `pull.rebase` (or `git pull --rebase`) avoids them on feature branches.

Interactive rebase (`git rebase -i`, Lesson 27) is for cleaning **your** commits before the PR: squash “fix typo,” reorder, reword.

**Tip:** If you have to say “everyone please delete your local `main` and re-clone,” you rebased a shared branch. Use revert instead (Lesson 17).

**Try it:** Write three bullets for your team: when we rebase, when we merge, when we squash. Compare with this repo’s real PR habits if you have them.

---

### Lesson 13. Cherry-pick: copy a commit onto another branch

**Takeaway:** `git cherry-pick <hash>` applies that commit’s patch as a **new** commit on the current branch. Use it for one bugfix, not for a whole feature (that is merge).

**Explain:** You committed a null-check on `feature/login` but production is burning on `hotfix`. Cherry-pick the fix:

```powershell
git switch hotfix
git cherry-pick abc1234
```

The new commit has a new SHA. Author is usually preserved; you are the committer. On conflict: fix, `git add`, `git cherry-pick --continue`. Bail out: `--abort`. `--skip` drops that pick.

```powershell
git cherry-pick abc1234 def5678    # a range of singles
git cherry-pick -m 1 <merge-hash>  # pick a merge commit (mainline parent)
```

**Pitfall:** the same change now exists as two commits. Later merging `feature/login` into a line that already has the pick can conflict or duplicate. If you picked because the commit was on the **wrong** branch, remove or revert the wrong-branch copy so the change lives in one place.

**Tip:** Cherry-pick is a scalpel. If you need five commits that form one feature, merge or rebase the branch instead of picking a grocery list.

**Try it:** Make commit F on branch `a`. On branch `b`, cherry-pick F. Confirm the diff is the same (`git show`) but the hashes differ. Abort a conflicting pick.

---

## Parking work & undoing

### Lesson 14. Stash: park uncommitted work

**Takeaway:** `git stash` shelves uncommitted changes so you can switch branches or pull with a clean tree. Stashes are **local** and easy to lose — prefer a WIP commit if the work should survive the weekend.

**Explain:**

```powershell
git stash push -m "wip header styles"
git stash list
git stash show -p stash@{0}
git stash pop                 # apply + drop
git stash apply stash@{1}     # apply, keep entry
git stash push -u -m "new file too"   # include untracked
git stash push -m "one file" -- src/app/page.tsx
git stash drop stash@{0}
git stash clear               # all of them — dangerous
```

`pop` is the daily command. `apply` is for “I might need this shelf on two branches.” If pop conflicts, you still have to resolve files; the stash entry may remain.

`git stash branch wip-header stash@{0}` creates a branch from the stash’s base and applies it — the escape hatch when a stash is awkward to pop.

Stash vs WIP commit: stash for a five-minute context switch. Commit `WIP: header` on a feature branch when you will push, change machines, or want a SHA in reflog that is obvious.

**Tip:** Always `-m` a reason. `stash@{3}: WIP on local: abc` is how work disappears.

**Try it:** Dirty a file, stash with a message, switch branches, pop. Then stash `-u` with a new untracked file and confirm it comes back.

---

### Lesson 15. Reset: move a branch pointer (soft, mixed, hard)

**Takeaway:** `git reset` moves the current branch (and HEAD) to a target commit. **`--soft`** keeps changes staged, **`--mixed`** (default) keeps edits unstaged, **`--hard`** discards staged and unstaged work.

**Explain:**

```text
Before:  A──B──C   ← branch (HEAD)
git reset HEAD~1
After:   A──B      ← branch (HEAD)
         C still exists (reflog) until GC
```

| Command | HEAD / branch | Index | Working tree |
| ------- | ------------- | ----- | ------------ |
| `git reset --soft HEAD~1` | Back 1 | Changes from C stay **staged** | Unchanged |
| `git reset --mixed HEAD~1` | Back 1 | Cleared | Edits from C remain |
| `git reset --hard HEAD~1` | Back 1 | Cleared | **Matches B — C’s work wiped from disk** |

```powershell
git reset --soft HEAD~1     # undo commit, keep staging (fix message / split)
git reset HEAD~1            # undo commit, keep files unstaged
git reset --hard HEAD~1     # you are sure you do not want those changes
```

`--hard` is the command people regret. It is recoverable via reflog **if** the work was committed (Lesson 19). Uncommitted work wiped by `--hard` is often gone.

Never `reset --hard` a commit you have **pushed to a shared branch**, then force-push, unless the whole team agrees. Use revert (Lesson 17).

**Tip:** `--soft` is the “I committed too soon” tool. `--hard` is the “this experiment is trash” tool. Default mixed is “I want to recut the commit.”

**Try it:** Make a commit. `reset --soft HEAD~1` and inspect `git status`. Redo the commit. Repeat with `--mixed`. In a second clone, try `--hard` on a committed file and recover it with reflog.

---

### Lesson 16. Restore: discard or unstage file contents

**Takeaway:** `git restore` changes **files**, not branch pointers. Restore from the index to discard unstaged edits; restore from HEAD to unstage or to match the last commit.

**Explain:** `restore` was split out of the overloaded `git checkout` so “fix this file” is not confused with “switch branch.”

```powershell
git restore src/app/page.tsx              # working tree ← index (drop unstaged edits)
git restore --staged src/app/page.tsx     # index ← HEAD (unstage, keep disk)
git restore --source=HEAD --staged --worktree src/app/page.tsx
# both index and disk match HEAD
git restore -s main -- src/lib/notes.ts   # take this file from another commit
```

`git checkout -- file` is the old spelling of the first command. Prefer `restore` in new muscle memory.

Restore does **not** create an undo commit. It is the safe daily “I typed garbage in this file.” It will not move `main`. It will not change other files.

To restore a **deleted** tracked file: `git restore path` from the last commit. To restore an old version into the working tree for inspection: `git restore -s abc1234 -- path`.

**Tip:** If you want to undo a **commit** that others might have pulled, `restore` is the wrong tool. That is `revert`.

**Try it:** Stage a file, edit it again, `restore` the unstaged layer, then `restore --staged` and confirm status is clean vs dirty as you expect.

---

### Lesson 17. Revert: undo by adding a new commit

**Takeaway:** `git revert <hash>` creates a **new** commit that applies the opposite patch. History stays linear and shared branches stay safe. The bad commit remains in the log.

**Explain:** Reset **removes** a commit from the tip of a branch (rewrites). Revert **adds** a commit. Collaborators who already have the bad commit can pull the revert as a normal fast-forward.

```powershell
git revert abc1234
git revert HEAD               # undo the latest commit, keep it in history
git revert -m 1 <merge-hash>  # revert a merge (mainline parent)
```

A revert can conflict like any patch. Fix, `git add`, `git revert --continue`. `--abort` cancels.

```text
A──B──C──D──R     R undoes C; B and D stay
```

If you revert a merge and later want the feature back, Git can think the feature is already merged. The recovery is documented and painful — do not revert merges casually; prefer revert of the specific file-level commits when you can.

**Tip:** Interview sound bite: “I restore files, I reset unpublished commits, I revert published ones.”

**Try it:** Commit a change, `git revert HEAD`, confirm the file is back and `git log` has two commits (original + revert). Then revert the revert to re-apply the change.

---

### Lesson 18. Reset vs restore vs revert — pick the right undo

**Takeaway:** **Restore** = files. **Reset** = move this branch’s tip (local / unpublished). **Revert** = new commit that undoes an old one (published / shared).

**Explain:**

```text
Want to throw away uncommitted edits in one file?
  git restore path

Want to unstage but keep editing?
  git restore --staged path

Want to undo the last local commit and recut it?
  git reset --soft HEAD~1     (or --mixed)

Want to pretend the last local experiment never happened?
  git reset --hard HEAD~1     (only if committed or truly disposable)

Want to undo a commit that is already on origin/main?
  git revert <hash>
  # then PR that revert
```

```powershell
# Same end state, different history:
git reset --hard HEAD~1          # C disappears from the branch (local)
git revert HEAD                  # C stays; R undoes it (safe to push)
```

Cursor’s Source Control “Discard” on a file is `restore`. “Unstage” is `restore --staged`. Be careful with any UI button that says “reset” — check whether it is hard.

**Tip:** When panicked, `git status` then `git reflog`. Do not `reset --hard` as a first reflex. You cannot revert a hard reset of **uncommitted** work.

**Try it:** For each of the five “Want to…” lines above, run the command in a toy repo and write one sentence about what `git log` and `git status` show.

---

## Recovery & investigation

### Lesson 19. Reflog: the journal that saves you

**Takeaway:** **Reflog** is a local diary of where HEAD (and sometimes branches) pointed. After a bad reset, rebase, or detached-HEAD loss, find the hash in `git reflog` and check it out or reset back to it.

**Explain:** Reflog is **not** pushed. It lives in your `.git` and expires (typically ~90 days). Another clone will not have your reflog entries.

```powershell
git reflog
git reflog show feature/notes-git
git switch -c rescue abc1234
# or, if you are sure:
git reset --hard abc1234
```

Typical entries: `commit`, `checkout`, `rebase`, `reset`, `clone`. The line right **after** a disaster is often `HEAD@{1}` — where you were before the command.

```powershell
git reset --hard HEAD~3
# panic
git reflog                 # find the pre-reset hash
git reset --hard HEAD@{1}  # if that entry is the one you want — verify the hash
```

Dropped stashes and orphaned commits can also appear as dangling objects (`git fsck --unreachable`). Reflog is the first place to look.

**Tip:** Copy the full hash onto your clipboard before you reset again. `HEAD@{1}` moves every time HEAD moves.

**Try it:** Reset hard one commit, confirm the file change is gone, `git reflog`, reset hard to the old hash, confirm the file is back. This is the muscle memory that makes `--hard` less terrifying.

---

### Lesson 20. Bisect: binary-search for the bad commit

**Takeaway:** `git bisect` checks out a midpoint between a known good commit and a known bad one until it names the first bad commit. Use it when “it worked last week” and the log is long.

**Explain:**

```powershell
git bisect start
git bisect bad              # current commit is broken
git bisect good v1.4.0      # or a hash that worked
# Git checks out a midpoint — build, test, then:
git bisect good             # if this midpoint works
git bisect bad              # if it is broken
# repeat until:
# "abc1234 is the first bad commit"
git bisect reset            # return to the branch you started on
```

Automate if you have a test:

```powershell
git bisect start HEAD v1.4.0
git bisect run npm test
```

`bisect run` exits 0 for good, 1–127 (except 125) for bad. Exit 125 means “skip this commit” (cannot build). The first bad commit is only as accurate as your good/bad labels — test the **same** symptom each time.

Bisect wants a linear-ish history. A messy merge-heavy range still works but takes more steps. This is a reason to keep commits focused (Lesson 3).

**Tip:** Write down the failing assertion before you start. Mid-bisect is a bad time to redefine “broken.”

**Try it:** In a toy repo, add 8 commits; break the app on commit 5. Bisect from HEAD (bad) to the first commit (good) and confirm Git finds commit 5.

---

### Lesson 21. Conflict recovery: markers, abort, and mergetool

**Takeaway:** Conflicts mean the same lines changed on both sides. Git pauses. You edit (or use a mergetool), `git add` the resolved files, then `--continue`. `--abort` returns to the pre-operation state.

**Explain:** Markers:

```text
<<<<<<< HEAD
your current branch's version
=======
the incoming version (merge / rebase / cherry-pick)
>>>>>>> feature/other
```

Delete the markers and keep the combined truth. `git add` the file tells Git “this path is resolved.”

```powershell
# during merge
git status
git diff
# edit files …
git add src/app/page.tsx
git merge --continue          # or git commit

git merge --abort             # give up the merge
```

```powershell
# during rebase
git add src/app/page.tsx
git rebase --continue
git rebase --abort

# during cherry-pick
git cherry-pick --continue
git cherry-pick --abort
```

`git mergetool` opens configured UI (VS Code / Cursor merge editor). In Cursor, the merge editor is the same three-way view: current, incoming, result. Do not close the operation by making a **new** unrelated commit with `git commit` during a rebase — use `--continue` so Git finishes its sequencer.

**Tip:** `git checkout --ours` / `--theirs` is a blunt whole-file pick. During **rebase**, “ours” and “theirs” swap meaning vs merge. Prefer reading the markers.

**Try it:** Conflict a merge on purpose. Resolve with markers, continue. Repeat and `--abort`. Then conflict a rebase and notice `rebase --continue` vs `merge --continue`.

---

### Lesson 22. Recovering lost commits and dangling objects

**Takeaway:** If you still have the hash, you have the commit. Reflog, `git fsck`, and `ORIG_HEAD` are the usual places to find hashes that no branch points at.

**Explain:** After a rebase, the original commits are dangling until GC. After `reset --hard`, the old tip is in reflog. After a failed experiment, `.git/ORIG_HEAD` often records the previous tip of a heavy operation.

```powershell
git reflog
git fsck --lost-found
git show abc1234              # still there?
git branch rescue abc1234
git cherry-pick abc1234       # if you only need that snapshot on another line
```

`git fsck --unreachable` lists objects with no ref. Not every dangling blob is precious — some are leftover from `add` then amend.

Time limits: reflog expire and `gc.pruneExpire` (default two weeks for unreachable objects, longer for reflog). Do not wait a month to recover a hard reset.

If the work was **never committed and never stashed**, Git cannot help. That is why small commits beat a day of unstaged genius.

**Tip:** Before a scary reset or rebase, `git branch backup/before-rebase` — a named ref is clearer than hoping you read reflog correctly.

**Try it:** Rebase a two-commit feature (new SHAs). Find the old tip in reflog, `git show` it, and create `backup/old-feature` pointing at it.

---

## Remotes, hooks & PRs

### Lesson 23. Remotes: fetch, pull, push, and `origin`

**Takeaway:** A **remote** is a named URL (`origin` by convention). **Fetch** updates remote-tracking refs. **Pull** is fetch plus merge or rebase. **Push** sends your commits to the remote branch.

**Explain:**

```powershell
git remote -v
git fetch origin
git log HEAD...origin/main --oneline
git pull --ff-only            # update current branch if possible
git pull --rebase
git push -u origin HEAD       # first push; sets upstream
git push
```

| Command | Moves your branch? | Updates `origin/*`? |
| ------- | ------------------ | ------------------- |
| `git fetch` | No | Yes |
| `git pull` | Yes (merge/rebase) | Yes |
| `git push` | No locally | Yes on the server |

`origin/main` is a **local snapshot** of the last fetch, not a live view of GitHub. Always fetch before you say “main doesn’t have that commit.”

`git clone` creates `origin` and checks out a branch that tracks `origin/main` (or the default). Adding a second remote (`git remote add upstream https://…`) is how forks pull from the source repo.

**Tip:** `git fetch` is always safe. `git pull` can start a merge you did not want. When in doubt, fetch, read `git status` and `git log --graph`, then merge or rebase explicitly.

**Try it:** `git fetch` and `git status` on this notes repo. Read whether you are ahead, behind, or diverged. Do not push unless you mean to.

---

### Lesson 24. Tracking branches and upstream

**Takeaway:** **Upstream** is the remote branch your local branch tracks. `git pull` and `git push` with no arguments use that pair. `git branch -vv` shows it.

**Explain:** After `git push -u origin feature/notes-git`, local `feature/notes-git` tracks `origin/feature/notes-git`. Status then says “ahead 1” or “behind 2” relative to that upstream.

```powershell
git branch -vv
git branch --set-upstream-to=origin/main main
git rev-parse --abbrev-ref --symbolic-full-name @{upstream}
```

`@{u}` or `@{upstream}` is shorthand for the tracked ref:

```powershell
git log --oneline @{u}..HEAD     # what I would push
git log --oneline HEAD..@{u}     # what I would pull
git diff @{u}
```

If upstream is gone (PR merged, branch deleted on the host), `git fetch --prune` then `git branch -vv` shows `[gone]`. Delete the local branch; do not keep pushing to a deleted name.

**Tip:** First push of a feature should be `git push -u origin HEAD` so you never type the branch name twice and never push to the wrong remote branch.

**Try it:** Run `git branch -vv`. For your current branch, interpret ahead/behind. Run the two `@{u}` logs above.

---

### Lesson 25. Pull request workflow from branch to merge

**Takeaway:** A PR is a request to merge a **branch** into a base (`main`). The Git part is: update base, branch, commit, push, open PR, address review, merge on the host, pull and delete the feature branch.

**Explain:**

```powershell
git switch main
git pull --ff-only
git switch -c feature/notes-git
# ... small commits ...
git fetch origin
git rebase origin/main          # keep the PR current
git push -u origin HEAD
# open PR on GitHub / GitLab / Azure DevOps
# after review:
git push                        # more commits, or --force-with-lease after rebase
# after merge on the host:
git switch main
git pull --ff-only
git fetch --prune
git branch -d feature/notes-git
```

PR hygiene: one concern, a description of **why**, screenshots for UI, and a test plan. Do not force-push `main`. Do not commit secrets. Prefer squash or rebase-merge on the host if the team wants a linear `main`.

What you should **never** do on shared branches: `reset --hard` + force-push, amend old commits, rebase `main` onto a feature. What you **may** do on your feature branch: rebase onto `main`, squash WIP, `push --force-with-lease` (refuses if someone else pushed).

**Tip:** `--force-with-lease` is the only force-push you should memorize. Plain `--force` can delete a teammate’s commits.

**Try it:** Open a throwaway repo on GitHub, push a feature branch, open a PR, squash-merge it, then locally `pull` and `branch -d`. Note which commands were Git vs the host UI.

---

### Lesson 26. Hooks: `pre-commit`, `commit-msg`, and `pre-push`

**Takeaway:** Hooks are scripts Git runs on events. **`pre-commit`** can lint staged files, **`commit-msg`** can require a ticket id, **`pre-push`** can run tests. They live in `.git/hooks` (not shared) unless you use a tool like Husky that installs shared hooks.

**Explain:** Sample hooks live in `.git/hooks/*.sample`. A real hook is an executable without `.sample`.

```bash
# .git/hooks/pre-commit  (bash; on Windows Git Bash / WSL)
#!/bin/sh
npm run lint
```

If the script exits non-zero, Git aborts the commit or push. `--no-verify` skips hooks — do not use it to sneak around CI; use it when a hook is broken and you own the fix.

Shared hooks: Husky, `core.hooksPath`, or `lefthook` commit hook **wrappers** into the repo so every clone gets the same checks. CI must still run the same lint/test — hooks only protect people who commit locally.

`commit-msg` receives the path to the message file; you can reject “wip” or require `JIRA-123`. `pre-push` receives ref updates on stdin and can block a push of `main` or a push without tests.

**Tip:** Keep hooks **fast**. A 3-minute test suite in `pre-commit` trains the team to use `--no-verify`. Put the slow suite in `pre-push` or CI only.

**Try it:** Copy `pre-commit.sample` to `pre-commit`, make it `exit 1`, try to commit, then `exit 0`. If the project uses Husky, read `.husky/pre-commit` instead of inventing a second hook system.

---

### Lesson 27. Rewriting local history: amend and interactive rebase

**Takeaway:** `git commit --amend` replaces the latest commit. `git rebase -i` can reword, squash, drop, or reorder a range of **your** commits. Both rewrite SHAs. Safe before anyone else has them; after push, use `--force-with-lease` only on your feature branch.

**Explain:**

```powershell
# forgot a file or typo in the last message (not pushed)
git add src/missed.ts
git commit --amend --no-edit

git rebase -i HEAD~3
# pick / reword / squash / fixup / drop / reorder
```

Interactive rebase opens an editor. `squash` keeps the message to edit; `fixup` discards the extra message. `drop` removes a commit from the replay. Conflicts work like a normal rebase.

Do not amend or rebase commits that are already on `origin/main`. Do not `--amend` after someone pulled that commit — you will fork history and need a force-push they must recover from.

`--autosquash` plus `commit --fixup=abc` is a tidy way to record review fixes and squash them later.

**Tip:** Clean history **before** you ask for review, not after five people commented on hashes you are about to destroy. If the PR is mid-review, prefer new commits unless the team likes force-push rebases.

**Try it:** Make three tiny commits (“add”, “fix typo”, “really fix”). `rebase -i` and squash to one. Confirm one SHA on the branch and the old SHAs still in reflog.

---

### Lesson 28. Daily Git loop, Cursor Git UI, and a recovery checklist

**Takeaway:** The daily loop is status → diff → add → commit → pull/rebase → push. The Cursor / VS Code Source Control panel runs those same commands. When something goes wrong: **status, then reflog, then do not hard-reset uncommitted work.**

**Explain:** Daily loop:

```powershell
git status
git diff
git add -p
git commit -m "Explain the why"
git fetch
git rebase origin/main          # on a feature
git push
```

Cursor Source Control maps roughly like this:

| UI | Git |
| -- | --- |
| Changes / staged | working tree vs index |
| + / stage | `git add` |
| Discard | `git restore` |
| Commit message + ✓ | `git commit` |
| Sync | `git pull` then `git push` (dangerous if diverged — prefer fetch + rebase) |
| Branch picker | `git switch` |
| Merge editor | conflict resolution (Lesson 21) |
| Timeline / Git Graph (if installed) | `git log --graph` |

Sync is safe when you are only ahead or only behind (fast-forward). When **diverged**, do not blindly Sync — you may create a merge commit you did not want. Fetch, rebase your feature, push.

**Recovery checklist**

1. `git status` — merge/rebase in progress? detached? dirty?
2. Uncommitted gold? Stash or commit **before** reset/switch.
3. Lost a commit? `git reflog`, then `git switch -c rescue <hash>`.
4. Wrong commit on a **shared** branch? `git revert`, not reset.
5. Wrong commit on **your** unpushed branch? `git reset` (soft/mixed).
6. Conflict? Fix markers, `add`, `--continue` — or `--abort`.
7. Need one commit from another branch? `cherry-pick`.
8. Need a clean tree to pull? `stash push -m "…"`.

Thirty-second interview sound bite: “Git stores snapshots as commits; branches are pointers; I rebase my feature onto main, merge through a PR, restore files, reset unpublished commits, revert published ones, and reflog is the safety net.”

**Tip:** Practice the recovery checklist in a throwaway clone once. Panic is a poor time to read `reset --hard` docs for the first time.

**Try it:** Walk the daily loop once on a dummy branch. Then in Cursor, stage a hunk from the UI and confirm `git diff --staged` matches. Finish by reading [`/notes/git`](/notes/git) Q31–Q33 and saying the reset/restore/revert distinction out loud.
