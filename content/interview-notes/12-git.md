# Git Interview Notes

Concise, say-aloud answers for version-control interviews and daily work. Each card has a **Short definition**, a spoken **Answer**, the command, a follow-up, and a common mistake.

---

## Mental Model

### Q1. What is Git and why do teams use it? [must-know]

**Short definition:** Git is a distributed version control system that records snapshots of a project so people can work in parallel and recover history.

**Answer:** Git stores a full history on every clone, not just on a central server. You commit locally, branch for features, merge or rebase to integrate, and push to share. Interviewers want to hear that Git tracks snapshots over time, enables parallel work without locking files, and lets you undo or recover with reflog. It is the industry default for frontend and full-stack teams.

**Follow-up:** Git vs SVN? — Git is distributed with a full local history; SVN is centralized with linear revision numbers.

**Common mistake:** Calling Git “just a backup tool” or confusing it with GitHub. Git is the tool; GitHub/GitLab/Azure DevOps host remotes.

---

### Q2. What does Git actually store — blob, tree, commit, ref?

**Short definition:** Git’s object model is blob (file contents), tree (directory listing), commit (snapshot + metadata), and ref (pointer such as a branch or tag).

**Answer:** A **blob** is the contents of one file. A **tree** lists which files and folders exist at a path. A **commit** points at a tree plus author, message, and parent commit(s) — that is the snapshot you talk about. A **ref** is a name pointing at a commit: `main`, `HEAD`, or `v1.0.0`. You almost never touch blobs and trees by hand; you move commits and refs.

| Object | What it is                                    |
| ------ | --------------------------------------------- |
| Blob   | Contents of a single file                     |
| Tree   | Directory listing                             |
| Commit | Snapshot: tree + author + message + parent(s) |
| Ref    | Pointer to a commit (branch, tag, HEAD)       |

**Follow-up:** Is a branch a copy of all files? — No. A branch is a movable pointer to a commit.

**Common mistake:** Thinking a commit stores a full file diff only. Git can store snapshots; diffs are computed when you ask.

---

### Q3. What are the four areas of change? [must-know]

**Short definition:** Every change lives in the working directory, the staging area (index), the local repository, or the remote.

**Answer:** You edit files on disk in the **working directory**. `git add` copies those changes into the **staging area**. `git commit` records a snapshot in the **local repository** (`.git`). `git push` sends commits to a **remote** such as `origin`. Fetch and pull bring remote commits back. The daily loop is edit → add → commit → push.

```
Working Directory  →  Staging Area  →  Local Repo  →  Remote
   (your edits)        (git add)       (git commit)    (git push)
```

**Follow-up:** Where is an unstaged edit? — Only in the working directory.

**Common mistake:** Expecting `git commit` to save unstaged files. Commit only records what is staged.

---

### Q4. What is a branch?

**Short definition:** A branch is a movable pointer to a commit, not a full copy of the project.

**Answer:** `main`, `local`, and `feature/auth` are names that point at commits. When you commit on a branch, that pointer moves forward. Creating a branch is cheap because Git does not duplicate files. Switching branches updates your working tree to match the commit the branch points at.

**Follow-up:** What is a detached HEAD? — HEAD points at a commit hash, not a branch name. New commits can be easy to lose unless you create a branch.

**Common mistake:** Treating branches as folders of files instead of pointers.

---

### Q5. What is HEAD?

**Short definition:** HEAD is “where you are now” — usually a pointer to the current branch tip.

**Answer:** In normal work HEAD points at a branch (`ref: refs/heads/local`), and that branch points at a commit. Commands like `git reset`, `git rebase`, and `git checkout` move HEAD. `HEAD~1` means the parent of the current commit. If you check out a raw hash, HEAD is detached.

**Follow-up:** HEAD vs origin/main? — HEAD is your current position; `origin/main` is the last fetched tip of remote `main`.

**Common mistake:** Thinking HEAD is the remote’s latest commit.

---

### Q6. What are origin and upstream?

**Short definition:** `origin` is the default remote name; upstream is the remote branch your local branch tracks.

**Answer:** After `git clone`, the remote is usually named `origin`. Upstream is the tracking pair, for example local `local` tracks `origin/local`. `git push` and `git pull` use that tracking so you do not type the remote and branch every time. `git branch -vv` shows tracking.

**Follow-up:** How do you set upstream on first push? — `git push -u origin feature/login`

**Common mistake:** Assuming `origin` is a special Git feature. It is just the conventional remote name.

---

### Q7. What does fast-forward mean?

**Short definition:** Fast-forward means Git can move your branch pointer forward because you have no unique local commits.

**Answer:** If remote is `A-B-C-D-E` and you are still at `C` with a clean history, pull just moves your pointer to `E`. No merge commit is created. Cursor may show “behind by 5 (fast-forward)”. If you also have local commits the other side does not, histories **diverged** and pull must merge or rebase.

**Follow-up:** What is diverged? — Both sides have commits the other does not.

**Common mistake:** Thinking fast-forward is a different command. It is a type of merge Git can do automatically.

---

## Daily Workflow

### Q8. What does `git status` show?

**Short definition:** Status shows the current branch, staged and unstaged files, and whether you are ahead or behind the remote.

**Answer:** Run `git status` before almost every other command. It lists modified, staged, and untracked files, plus “ahead 1 / behind 5” when tracking is set. If something feels wrong, status is the first check.

```powershell
git status
```

**Follow-up:** What is a short status? — `git status -sb`

**Common mistake:** Skipping status and guessing whether files are staged.

---

### Q9. What is `git diff`?

**Short definition:** Diff shows line-by-line changes between the working tree, the index, or commits.

**Answer:** `git diff` is unstaged changes (working tree vs staging). `git diff --staged` is what will go into the next commit. `git diff main..feature` compares branches. Use it before you commit so you do not ship debug logs.

```powershell
git diff
git diff --staged
git diff -- src/App.tsx
```

**Follow-up:** How do you see a compact history graph? — `git log --oneline --graph --all -20`

**Common mistake:** Using only `git diff` after staging — staged hunks disappear from the unstaged diff.

---

### Q10. How do you stage and commit?

**Short definition:** `git add` marks files for the next snapshot; `git commit` records that snapshot locally.

**Answer:** Stage one file or everything tracked, then commit with a message that says why, not only what. Commit is local until you push. Prefer small, focused commits.

```powershell
git add src/App.tsx
git add .
git commit -m "Explain loading state in App header"
```

**Follow-up:** `git add .` vs `git add -p`? — `.` stages everything in the path; `-p` lets you stage hunks.

**Common mistake:** Committing secrets or `node_modules` because you staged with `.` and never checked status.

---

### Q11. How do you unstage or discard a file?

**Short definition:** `git restore --staged` unstages and keeps edits; `git restore` discards unstaged edits in the working tree.

**Answer:** Unstage when you added the wrong file but still want the edits. Restore without `--staged` throws away unstaged work in that file — that is destructive. For a whole dirty tree you do not want, people use `git reset --hard`, which is even more dangerous.

```powershell
git restore --staged src/App.tsx
git restore src/App.tsx
```

**Follow-up:** What about untracked files? — `git clean -fd` removes them. Preview first with `git clean -fdn`.

**Common mistake:** Using `git restore` when you meant unstage, and losing the edit.

---

### Q12. How do you create and switch branches?

**Short definition:** `git switch` moves you to a branch; `git switch -c` creates and switches.

**Answer:** List with `git branch` or `git branch -vv`. Create and switch in one step with `git switch -c feature/login`. `git switch feature/login` is the modern replacement for `git checkout` when you only want to change branches. Delete a merged local branch with `git branch -d`; force delete with `-D`.

```powershell
git branch
git switch -c feature/login
git switch main
git branch -d feature/login
```

**Follow-up:** Checkout vs switch? — `switch` is for branches; `checkout` can also restore files or detach HEAD.

**Common mistake:** Creating a branch but staying on `main` because you used `git branch name` without switching.

---

### Q13. How do clone, fetch, pull, and push differ? [must-know]

**Short definition:** Clone copies a repo; fetch downloads refs; pull fetches and integrates; push sends your commits.

**Answer:** `git clone <url>` creates a local repo with `origin` set. `git fetch` updates remote-tracking branches and does **not** change your files. `git pull` is fetch plus merge (or rebase with `--rebase`). `git push` publishes local commits. First push of a new branch needs `-u` to set upstream.

```powershell
git clone https://github.com/org/app.git
git fetch
git pull
git push
git push -u origin feature/login
```

**Follow-up:** When should you fetch instead of pull? — When you want to inspect `origin/main` before changing your branch.

**Common mistake:** Thinking fetch updates your working files.

---

### Q14. How do you see remotes?

**Short definition:** `git remote -v` lists remote names and their fetch/push URLs.

**Answer:** Most projects have one remote named `origin`. Forks sometimes add `upstream` for the original repo. You push to your remote and open a PR against upstream.

```powershell
git remote -v
```

**Follow-up:** How do you add a remote? — `git remote add upstream <url>`

**Common mistake:** Editing files to “change the remote.” Use `git remote set-url origin <url>`.

---

## Fetch, Pull, Merge, Rebase

### Q15. What does `git fetch` do?

**Short definition:** Fetch downloads new commits and updates remote-tracking branches without moving your current branch.

**Answer:** After fetch, `origin/main` may move forward while you stay where you are. You can log or diff against `origin/main`, then merge or rebase when ready. Fetch is the safe “look first” command.

```powershell
git fetch
git fetch --prune
git log HEAD..origin/main --oneline
```

**Follow-up:** What does prune do? — Drops stale remote-tracking branches that were deleted on the server.

**Common mistake:** Running fetch and expecting your files to change.

---

### Q16. What does `git pull` do?

**Short definition:** Pull is fetch plus integrate — by default a merge into the current branch.

**Answer:** `git pull` updates remote-tracking refs and then merges (or rebases) them into the branch you are on. If you are a clean fast-forward, the pointer just moves. If you have local commits, Git creates a merge commit unless you rebase. If you have uncommitted edits that overlap incoming changes, pull can refuse or conflict — commit or stash first.

```powershell
git pull
```

**Follow-up:** Pull from another branch? — `git pull origin main`

**Common mistake:** Pulling with a dirty working tree on a branch that is already behind.

---

### Q17. What is `git merge`?

**Short definition:** Merge combines two histories and may create a commit with two parents.

**Answer:** `git merge origin/local` brings that branch’s commits into the current branch. If histories diverged, Git creates a **merge commit** that has two parents and keeps both lines of history. Merge is the safe default on long-lived shared branches because it does not rewrite existing SHAs.

```
Remote:  A — B — C — D — E
Local:   A — B — C — X — Y

After merge:
A — B — C — D — E — M
              \       /
               X — Y
```

**Follow-up:** What is a merge commit? — A commit with two parents that ties both histories together.

**Common mistake:** Merging the wrong way (merging `main` into a feature vs merging the feature via PR).

---

### Q18. What is `git rebase`? [must-know]

**Short definition:** Rebase replays your commits on top of another tip so history looks linear.

**Answer:** `git rebase origin/local` takes your unique commits and reapplies them one by one after the remote tip. The old commits are replaced by new commits with new hashes (`X` becomes `X'`). History is easier to read, but you rewrote commits. Never rebase commits that other people already pulled from a shared branch.

```
After rebase:
A — B — C — D — E — X' — Y'
```

```powershell
git fetch
git rebase origin/local
```

**Follow-up:** Why new hashes? — Rebase creates new commit objects; the originals remain until garbage collection, and reflog can still find them.

**Common mistake:** Rebasing `main` that the whole team uses, then force-pushing.

---

### Q19. `git pull` vs `git pull --rebase`? [must-know]

**Short definition:** Default pull merges remote into your branch; `git pull --rebase` replays your local commits on top of remote.

**Answer:** Use `git pull` when the team merges PRs and you want the safest shared-branch behavior. Use `git pull --rebase` on a personal feature branch when you want a straight line and no extra merge commit. Fast-forward-only situations look similar either way. If rebase hits conflicts, you resolve each commit, then `git rebase --continue`, or `git rebase --abort` to go back.

```powershell
git pull
git pull --rebase
```

**Follow-up:** Can you rebase after a merge pull? — You can, but you may be rewriting merge commits. Prefer choosing the strategy before you pull.

**Common mistake:** Using rebase on a shared branch because “linear history looks nicer.”

---

### Q20. When should you merge vs rebase?

**Short definition:** Merge is safer on shared long-lived branches; rebase is for cleaning unpushed or solo feature-branch commits.

**Answer:** Merge when many people already based work on those commits (`main`, `develop`, `stage`). Rebase when you are still alone on `feature/login` and want to replay onto latest `develop` before the PR. Interactive rebase is for squashing “wip” commits before the first review push. After others have that branch, rebase only if the team agrees and you use `--force-with-lease`.

| Scenario                     | Command                    |
| ---------------------------- | -------------------------- |
| Default safe update          | `git pull`                 |
| Solo feature, linear history | `git pull --rebase`        |
| Shared branch / team PRs     | merge pull                 |
| Inspect only                 | `git fetch`                |
| Dirty tree + behind          | stash or commit, then pull |

**Follow-up:** What is the golden rule? — Do not rebase commits already pushed to a shared branch.

**Common mistake:** Rebasing to “fix” a teammate’s pushed history.

---

### Q21. What is interactive rebase?

**Short definition:** `git rebase -i` lets you reorder, squash, reword, edit, or drop a range of local commits.

**Answer:** `git rebase -i HEAD~3` opens the last three commits. `pick` keeps a commit, `reword` changes the message, `squash` folds it into the previous commit, `drop` removes it, `edit` stops so you can amend. Only do this on commits that are not on a shared remote, or on a branch only you use.

```powershell
git rebase -i HEAD~3
```

**Follow-up:** How do you squash before a PR? — Mark the later commits as `squash`, save, write one combined message.

**Common mistake:** Interactive-rebasing commits that are already on `origin/main`.

---

### Q22. What do you do when you are behind remote and have uncommitted work?

**Short definition:** Do not pull onto overlapping dirty files — commit or stash first, then pull, then continue.

**Answer:** Three safe paths. If the change is ready: commit, then `git pull` (or `--rebase`), fix conflicts, push. If it is not ready: `git stash push -m "wip"`, pull, `git stash pop`, then commit. If you want linear history after a real commit: commit, then `git pull --rebase`. Cursor Sync is risky in the dirty-and-behind case.

```powershell
git stash push -m "wip header"
git pull
git stash pop
```

**Follow-up:** Why can switch or pull fail? — Git refuses to overwrite uncommitted files that incoming commits also touch.

**Common mistake:** Hitting Sync with uncommitted edits while the status bar shows `5↓`.

---

## Cherry-Pick

### Q23. What is git cherry-pick? [must-know]

**Short definition:** Cherry-pick copies one existing commit onto your current branch as a new commit.

**Answer:** You give Git a commit hash from another branch. Git applies that commit’s patch on top of HEAD and creates a **new** commit with a new hash and the same changes (and usually the same message). The original commit stays on the source branch. This is the fix for “I committed on the wrong branch.”

```powershell
git switch local
git cherry-pick 7d8a0562
```

**Follow-up:** Can you cherry-pick a range? — `git cherry-pick A^..B` applies commits after `A` through `B`.

**Common mistake:** Thinking cherry-pick moves the commit off the old branch. It copies; it does not delete.

---

### Q24. When do you cherry-pick instead of merge?

**Short definition:** Cherry-pick brings selected commits; merge brings the whole branch history.

**Answer:** Merge (or a PR) when you want all of `feature/login` on `develop`. Cherry-pick when you need one bugfix commit from `feature/login` onto `hotfix` without the rest of that branch. Also use it to replay a commit you made on `main` by mistake onto the correct feature branch — then reset or revert the wrong-branch copy if needed.

**Follow-up:** What if you later merge the original branch? — Git may see the same change twice and conflict, or create a duplicate. Prefer merge/PR for whole features.

**Common mistake:** Cherry-picking many commits instead of merging, then drowning in duplicates.

---

### Q25. How do you abort or continue a cherry-pick?

**Short definition:** On conflict, fix and `git cherry-pick --continue`; to bail out, `git cherry-pick --abort`.

**Answer:** Cherry-pick applies a patch. If the same lines differ, you get conflict markers. Edit, `git add` the file, then `--continue`. `--abort` returns the branch to the pre-cherry-pick state. `--skip` drops that commit and moves on (rare; you are choosing to lose that patch).

```powershell
git add src/App.tsx
git cherry-pick --continue
git cherry-pick --abort
```

**Follow-up:** Empty cherry-pick? — The change is already in the tree. `--skip` or abort, depending on intent.

**Common mistake:** Running `git commit` as if you were finishing a merge, and leaving cherry-pick in a half-done state. Prefer `--continue`.

---

### Q26. What is the duplicate-commit pitfall with cherry-pick?

**Short definition:** Cherry-pick creates a new SHA, so the same change can exist twice and surprise you at merge time.

**Answer:** The copied commit is not “the same object” as the original. A later merge of the source branch can conflict even though the code looks identical. If the commit was only on the wrong branch and you cherry-picked it to the right one, remove or revert the wrong-branch commit so the change lives in one place.

**Follow-up:** Does cherry-pick keep the original author? — By default yes; you are the committer.

**Common mistake:** Cherry-picking a merge commit without `-m` (parent number). Merge commits need `-m 1` to tell Git which parent is the mainline.

---

## Stash

### Q27. What is git stash? [must-know]

**Short definition:** Stash temporarily shelves uncommitted changes so you can switch context with a clean tree.

**Answer:** `git stash` (or `git stash push -m "reason"`) saves tracked edits and makes the working tree match HEAD. Use it when you must pull or switch branches and are not ready to commit. Stash is local — it is not pushed. Always add a message so `git stash list` is readable.

```powershell
git stash push -m "wip header styles"
git stash list
```

**Follow-up:** How do you stash new untracked files? — `git stash push -u -m "new component"`

**Common mistake:** Stashing without a message and forgetting which stash is which.

---

### Q28. `git stash pop` vs `git stash apply`?

**Short definition:** `pop` applies the stash and deletes that entry; `apply` applies it and keeps the copy.

**Answer:** Daily habit is `pop` for the latest stash. Use `apply stash@{1}` when you want the same shelf on more than one branch or you are unsure it will apply cleanly. If apply/pop conflicts, fix files, `git add`, and drop the stash yourself if pop left it.

```powershell
git stash pop
git stash apply stash@{1}
```

**Follow-up:** How do you inspect a stash first? — `git stash show -p stash@{0}`

**Common mistake:** Popping the wrong stash and thinking it is gone forever — reflog or `git fsck` can still find the commit.

---

### Q29. How do you drop, clear, or recover a stash?

**Short definition:** `drop` deletes one stash; `clear` deletes all; dropped stashes can often be recovered from reflog.

**Answer:** `git stash drop stash@{0}` removes one entry. `git stash clear` wipes the list. If you dropped by mistake, `git reflog` or `git fsck --unreachable` can show the dangling commit; then `git stash apply <hash>`.

```powershell
git stash drop stash@{0}
git reflog
git stash apply <hash>
```

**Follow-up:** Stash only one file? — `git stash push -m "partial" -- src/App.tsx`

**Common mistake:** `stash clear` on a long list of WIP. There is no undo command except recovery from dangling commits.

---

### Q30. Stash vs a WIP commit?

**Short definition:** Stash is a local shelf; a WIP commit is a real snapshot on a branch that you can push.

**Answer:** Stash when you will switch or pull for a few minutes. Commit (even “WIP: header”) when the work should survive a reboot, another machine, or a teammate. Stashes are easier to lose and harder to review in a PR. You can later squash WIP commits with interactive rebase.

**Follow-up:** Can you push a stash? — Not as a stash. You can create a branch from it: `git stash branch wip-header stash@{0}`

**Common mistake:** Living in stash for days instead of committing on a feature branch.

---

## Reset and Undo

### Q31. What is the difference between reset --soft, --mixed, and --hard? [must-know]

**Short definition:** All three move HEAD; they differ in whether the index and working tree keep the undone commit’s changes.

**Answer:** `--soft` moves HEAD back and leaves changes **staged**. `--mixed` (default) moves HEAD and **unstages** but keeps file edits. `--hard` moves HEAD and **wipes** staged and unstaged changes to match the target commit. Use soft to redo a commit message or split a commit. Avoid hard unless you are sure the work is trash — and never hard-reset then force-push a shared branch.

| Command                    | HEAD   | Staging              | Working tree |
| -------------------------- | ------ | -------------------- | ------------ |
| `git reset --soft HEAD~1`  | Back 1 | Keeps changes staged | Unchanged    |
| `git reset --mixed HEAD~1` | Back 1 | Cleared              | Edits remain |
| `git reset --hard HEAD~1`  | Back 1 | Cleared              | **Wiped**    |

**Follow-up:** How do you undo a commit you already pushed? — Do not reset a shared branch. Use `git revert <hash>` to add a new commit that undoes it.

**Common mistake:** `--hard` on `main` because a commit message had a typo.

---

### Q32. Reset vs restore vs revert?

**Short definition:** Restore fixes files; reset moves a branch pointer; revert adds a new commit that undoes an old one.

**Answer:** `git restore` is the safe daily undo for uncommitted work. `git reset` rewrites where the current branch points — fine locally, dangerous if already pushed. `git revert` is the shared-history undo: it keeps the bad commit in history and records the opposite patch. Interviewers listen for “revert on shared, reset only if I have not published.”

```powershell
git restore src/App.tsx
git reset --soft HEAD~1
git revert abc1234
```

**Follow-up:** Revert a merge commit? — `git revert -m 1 <merge-hash>` to name the mainline parent.

**Common mistake:** Using reset and revert as synonyms.

---

### Q33. What is reflog and how do you recover a “lost” commit? [must-know]

**Short definition:** Reflog is a local diary of where HEAD pointed — your safety net for about 90 days.

**Answer:** Every checkout, commit, rebase, and reset is recorded. After a hard reset, `git reflog` still shows the old hash. Recover with `git reset --hard <hash>` or `git switch -c recovered-work <hash>`. Reflog is **not** pushed; it exists only on that machine.

```powershell
git reflog
git switch -c recovered-work abc1234
```

**Follow-up:** Reflog vs `git log`? — Log is reachable history from the current tips; reflog includes commits you dropped off the branch.

**Common mistake:** Assuming a hard reset is unrecoverable. Check reflog first.

---

### Q34. How do you amend the last commit?

**Short definition:** `git commit --amend` replaces the latest commit with a new one that includes extra staged changes or a new message.

**Answer:** Use amend only if that commit has **not** been pushed, or if you are alone on the branch and will force-with-lease. Amending rewrites the SHA. If it is already on a shared remote, make a new commit instead.

```powershell
git add src/App.tsx
git commit --amend -m "Fix header spacing on mobile"
```

**Follow-up:** Amend without changing the message? — `git commit --amend --no-edit`

**Common mistake:** Amending a commit teammates already pulled.

---

## Conflicts

### Q35. What do conflict markers mean? [must-know]

**Short definition:** Markers show the two sides Git could not auto-merge: yours (`HEAD`) and theirs (the incoming commit).

**Answer:** Git pauses and writes the conflict into the file. Everything between `<<<<<<< HEAD` and `=======` is your current branch. Between `=======` and `>>>>>>>` is the incoming side. You must produce one correct result, delete all three marker lines, and stage the file. Leaving markers in source will break the build.

```
<<<<<<< HEAD
Your version
=======
Their version
>>>>>>> origin/local
```

**Follow-up:** Can Git conflict on binary files? — Yes; you choose one version. There are no text markers.

**Common mistake:** Deleting only one marker and shipping `=======` to production.

---

### Q36. How do you finish a conflict in merge vs rebase vs cherry-pick?

**Short definition:** After fixing and `git add`, continue with the command that started the operation.

**Answer:** Merge: `git commit` (or the merge message Git prepared). Rebase: `git rebase --continue` — you may hit another commit next. Cherry-pick: `git cherry-pick --continue`. Stash pop: fix, `git add`, then `git stash drop` if the stash is still listed. Do not start a new merge while one operation is in progress. `git status` tells you which state you are in.

```powershell
git add src/App.tsx
git rebase --continue
```

**Follow-up:** How do you see conflicted files? — `git status` or `git diff --name-only --diff-filter=U`

**Common mistake:** Running `git commit` during a rebase instead of `git rebase --continue`.

---

### Q37. How do you abort merge, rebase, or cherry-pick?

**Short definition:** `--abort` returns the repo to the state before that operation started.

**Answer:** Use abort when the conflict is bigger than you want to solve right now. You do not lose the other branch’s commits — you only cancel the in-progress integrate.

```powershell
git merge --abort
git rebase --abort
git cherry-pick --abort
```

**Follow-up:** What if abort says you are not in a merge? — Check `git status`. You may already have finished or never started one.

**Common mistake:** `reset --hard` to “get out” of a rebase without understanding you can abort cleanly.

---

### Q38. How do you switch branches with uncommitted changes?

**Short definition:** Git allows the switch if the other branch does not overwrite your dirty files; otherwise commit, stash, or discard.

**Answer:** Small unrelated edits often switch cleanly. If both branches touch `src/App.tsx`, Git blocks you. Then: commit on the current branch, or `git stash push -m "wip"`, switch, do the other work, switch back, `git stash pop`. Discard only if you truly do not need the edits (`git restore`).

```powershell
git stash push -m "wip"
git switch feature/login
git switch -
git stash pop
```

**Follow-up:** What is `git switch -`? — Returns to the previous branch, like `cd -`.

**Common mistake:** `reset --hard` just to switch, destroying work you needed.

---

## Tags, Ignore, Branch Flow

### Q39. What are Git tags?

**Short definition:** A tag is a ref that names a commit, usually a release; annotated tags store a message and author.

**Answer:** Lightweight tags are just a name. Annotated tags (`-a`) are preferred for releases because they have metadata. Tags do not move when you commit, unlike branches. Push them explicitly — `git push` does not send tags by default.

```powershell
git tag -a v1.0.0 -m "Release"
git push origin v1.0.0
```

**Follow-up:** How do you delete a remote tag? — `git push origin --delete v1.0.0`

**Common mistake:** Assuming tags travel with a normal push.

---

### Q40. How does `.gitignore` work?

**Short definition:** `.gitignore` lists untracked paths Git should not show or add; it does not untrack files already committed.

**Answer:** Put `node_modules/`, `.env`, `dist/`, and `*.log` in `.gitignore`. If `.env` was already committed, ignoring it is not enough — remove it from the index and keep the local file: `git rm --cached .env`, commit, and confirm it stays ignored.

```
node_modules/
.env
*.log
dist/
```

```powershell
git rm --cached .env
```

**Follow-up:** Global ignore? — `git config --global core.excludesFile ~/.gitignore_global` for OS junk like `Thumbs.db`.

**Common mistake:** Adding `.env` to gitignore after committing it and thinking the secret is gone from history.

---

### Q41. What is a typical feature-branch PR workflow?

**Short definition:** Branch from the integration branch, commit locally, push the feature, open a pull request, merge after review.

**Answer:** Do not commit directly to `main` or `develop` if they are protected. Create `feature/my-fix`, push it, open a PR, address review, merge on the host. Delete the feature branch after merge. Pull the integration branch before you start the next feature.

```
develop  ←  merge PR  ←  feature/my-fix  ←  your commits
```

**Follow-up:** Rebase vs merge on the PR? — Many teams squash-merge or rebase-merge on GitHub so `develop` stays linear. Follow the repo’s setting.

**Common mistake:** Pushing straight to `production` because the fix was “small.”

---

### Q42. What should you never do on shared branches?

**Short definition:** Do not rewrite published history on `main`, `develop`, `stage`, or `production`.

**Answer:** Avoid `git push --force`, `reset --hard` plus force push, and rebasing commits others already pulled. Those commands change SHAs and make teammates’ clones diverge. On **your** unused feature branch, `git push --force-with-lease` after a local rebase is the safer force-push: it fails if the remote moved since you last fetched.

**Follow-up:** Why `--force-with-lease` over `--force`? — Lease refuses to overwrite new remote commits you have not seen.

**Common mistake:** Force-pushing `main` to hide a bad commit instead of reverting.

---

### Q43. What is a good daily command loop?

**Short definition:** Switch to your branch, change, status, add, commit, pull, then push.

**Answer:** Pull (or fetch + merge/rebase) before you push on a shared line of work so you are not surprised on the remote. Agents and teammates should not push for you unless you asked. Protected branches stay PR-only.

```
1. git switch feature/login
2. edit files
3. git status
4. git add <files>
5. git commit -m "..."
6. git pull          (or git pull --rebase)
7. fix conflicts if any
8. git push
```

**Follow-up:** Why pull before push? — You integrate others’ commits locally, where conflicts are easier to see.

**Common mistake:** Pushing first and only then discovering you are behind.

---

## Cursor / VS Code

### Q44. How does the Source Control panel map to Git?

**Short definition:** Cursor’s Git UI runs the same commands: plus is add, Commit is commit, Pull/Push/Fetch match the CLI.

**Answer:** Open it with the branch icon or `Ctrl+Shift+G`. **+** stages (`git add`). **↩** discards (`git restore`). The message box plus **Commit** is `git commit`. The `...` menu has Pull, Pull (Rebase), Push, Fetch, and Sync. Always look at **Staged Changes** — Commit only records what is staged unless smart commit is on.

**Follow-up:** What does the status bar `local*  5↓  0↑` mean? — Branch `local`, dirty tree (`*`), 5 remote commits to pull, 0 local commits to push.

**Common mistake:** Clicking Commit with nothing staged and thinking Git saved the files (unless `git.enableSmartCommit` is on).

---

### Q45. When is Sync safe vs risky?

**Short definition:** Sync pulls then pushes; it is safe on a clean or fully committed tree, risky when you are dirty and behind.

**Answer:** Sync is convenient when status is clean or everything is committed and you accept possible conflicts. If you have uncommitted work **and** the bar shows you are behind, do not Sync blindly — commit or stash, then Pull, then Push. Turn on `git.confirmSync` so Cursor asks first.

**Follow-up:** Sync vs Pull? — Pull only integrates remote. Sync also pushes your commits afterward.

**Common mistake:** Using Sync as the only Git button without reading `↓` / `↑`.

---

### Q46. What is the Cursor merge editor?

**Short definition:** A three-pane conflict UI: incoming, result, and current, instead of editing markers by hand.

**Answer:** Incoming is the other side (often remote). Current is your branch. The center Result is what will be saved. Accept blocks with checkboxes, edit the result, save, then stage. You can still resolve in the file if you prefer markers. Same end state: no markers, file staged, then continue merge/rebase/cherry-pick.

**Follow-up:** Incoming vs current if you are rebasing? — During rebase, “ours/theirs” can feel swapped. Read the labels and the file, not just the words.

**Common mistake:** Accepting all incoming and losing your work without reading the diff.

---

### Q47. Which Cursor Git settings are worth setting?

**Short definition:** Autofetch keeps `↓` accurate; confirmSync prevents surprise pulls; rebaseWhenSync should match the team.

**Answer:** `git.autofetch` true updates remote counts. `git.confirmSync` true asks before Sync. `git.rebaseWhenSync` false unless the team rebases. `git.enableSmartCommit` stages everything if you commit with an empty index — convenient but easy to over-commit. `git.postCommitCommand` can auto-push; leave `none` if you want to pull first.

**Follow-up:** Why autofetch is not pull? — It only fetches. Your files stay put.

**Common mistake:** Enabling rebase-when-sync on a repo that expects merge commits.

---

## Troubleshooting

### Q48. You cannot switch branches because local changes would be overwritten.

**Short definition:** Stash or commit first; Git is protecting files both sides would change.

**Answer:** `git stash push -m "wip"`, switch, do the other task, switch back, `git stash pop`. Or commit on the current branch if the work is real. Do not hard-reset unless you intend to throw the edits away.

**Follow-up:** Untracked files blocking checkout? — Stash with `-u` or add them to gitignore.

**Common mistake:** Copy-pasting files out of the repo as a “backup” and then resetting, instead of stash or a WIP commit.

---

### Q49. You committed on the wrong branch.

**Short definition:** Note the hash, switch to the correct branch, cherry-pick that commit, then remove it from the wrong branch if it is not pushed.

**Answer:** `git log -1` for the hash. `git switch correct-branch` then `git cherry-pick <hash>`. If the bad commit is only local on the wrong branch, `git switch wrong-branch` and `git reset --soft HEAD~1` (or `--hard` if you already cherry-picked and do not need the files there). If it was pushed to a shared branch, revert instead of reset.

```powershell
git log -1 --oneline
git switch feature/login
git cherry-pick 7d8a0562
```

**Follow-up:** Two commits on the wrong branch? — Cherry-pick the range, or merge that branch if the whole thing belongs together.

**Common mistake:** Resetting the wrong branch after someone else pulled that commit.

---

### Q50. `git pull` created a merge commit you did not want.

**Short definition:** Next time pull with rebase; if the merge is not pushed, you can reset it.

**Answer:** If the merge commit is only local, `git reset --soft HEAD~1` may leave you in a mess if it was a real merge — safer is `git reset --hard ORIG_HEAD` immediately after a bad pull, or rebase onto `origin/your-branch` if you understand the state. Going forward: `git pull --rebase`. Set `pull.rebase true` only if the team agrees.

**Follow-up:** How do you see ORIG_HEAD? — Git sets it before pull/merge/reset. `git log -1 ORIG_HEAD`

**Common mistake:** Resetting hard after a pull that already included wanted file changes you had not committed.

---

### Q51. You pushed the wrong commits to your own feature branch.

**Short definition:** Fix locally, then `git push --force-with-lease` — only on a branch nobody else is using.

**Answer:** Interactive rebase or reset to the good tip, then force-with-lease so you do not clobber new remote commits you missed. Never do this on `main`. Tell reviewers if they already checked out the old feature branch.

```powershell
git push --force-with-lease
```

**Follow-up:** Lease failed? — `git fetch` and look at why the remote moved before you force again.

**Common mistake:** `--force` on `develop` after a rebase.

---

### Q52. How do you recover work after `reset --hard`? [must-know]

**Short definition:** Open reflog, find the commit, reset or create a branch at that hash.

**Answer:** `git reflog` — the line before the reset is usually `HEAD@{1}` or a hash you recognize. `git reset --hard <hash>` puts the branch back. Or `git switch -c recovered <hash>` to keep both tips. Uncommitted files that were never staged may be gone for good; the reflog saves commits, not always dirty files.

```powershell
git reflog
git reset --hard HEAD@{1}
```

**Follow-up:** Practice this on a throwaway branch so the muscle memory is there.

**Common mistake:** Making more commits after a bad reset and then resetting to `HEAD@{1}`, which is no longer the lost commit.

---

### Q53. How do you stage only part of a file?

**Short definition:** `git add -p` (or stash `-p`) lets you accept or skip individual hunks.

**Answer:** Use patch mode when a file has a debug log and a real fix together. Cursor can also stage selected lines in the diff view. This keeps commits reviewable.

```powershell
git add -p src/App.tsx
```

**Follow-up:** How do you unstage a hunk? — `git restore --staged -p src/App.tsx`

**Common mistake:** Committing debug and feature together because `git add .` was faster.

---

### Q54. What is `git log --oneline --graph` for?

**Short definition:** It draws a compact branch graph so you can see merges, rebases, and where HEAD is.

**Answer:** Add `--all -20` to see recent tips of every local and remote-tracking branch. This is how you confirm a rebase is linear or a merge created `M`. Use it after pull if the history looks surprising.

```powershell
git log --oneline --graph --all -20
```

**Follow-up:** How do you find a commit by message? — `git log --grep="header"`

**Common mistake:** Reading only the default `git log` pager and missing that you are not on the branch you think.

---

### Q55. What does `git revert` do that reset does not?

**Short definition:** Revert adds a new commit that applies the opposite patch; history stays intact.

**Answer:** After a bad commit is on `origin/main`, revert is the professional fix. The mistake stays visible; the undo is auditable. Reset would drop the commit from the tip and require a force push.

```powershell
git revert abc1234
git push
```

**Follow-up:** Revert a revert to re-apply? — Yes, revert the revert commit.

**Common mistake:** Reverting and then also resetting, doubling the confusion.

---

### Q56. How do you compare your branch to the remote tip?

**Short definition:** Fetch first, then log or diff `HEAD..origin/<branch>`.

**Answer:** `git fetch` then `git log HEAD..origin/local --oneline` shows incoming commits. Reverse the dots for outgoing. `git diff HEAD...origin/local` (three dots) is a useful incoming-change view for PRs.

```powershell
git fetch
git log HEAD..origin/local --oneline
```

**Follow-up:** What are two-dot vs three-dot diffs? — Two-dot is straight comparison of tips; three-dot is changes since the merge base.

**Common mistake:** Diffing without fetch and thinking remote has not moved.

---

### Q57. What should you practice in a throwaway clone?

**Short definition:** Stash/pop, pull with local edits, a rebase conflict, soft reset, and reflog recovery.

**Answer:** Do not learn hard reset on production. In a test clone: stash and pop; stash → pull → pop; create a rebase conflict and `--continue`; `reset --soft HEAD~1`; hard-reset a commit and bring it back with reflog. Those five drills cover 90% of panic moments.

**Follow-up:** Why a separate clone? — You can `reset --hard` freely without risking the real feature branch.

**Common mistake:** Practicing force-push on the company `develop` branch.

---

### Q58. Give a 30-second Git sound bite for interviews. [must-know]

**Short definition:** Git snapshots history locally; branches are pointers; merge keeps both histories; rebase replays yours; cherry-pick copies one commit.

**Answer:** I commit locally, push to share, and fetch or pull to update. I merge on shared branches and rebase only my unpushed feature commits. If I committed on the wrong branch I cherry-pick the hash onto the right one. If I lose a commit I use reflog. I never force-push `main`. I resolve conflicts by editing markers, adding the file, and continuing merge, rebase, or cherry-pick as appropriate.

**Follow-up:** What is your undo ladder? — restore for dirty files, amend/reset for unpushed commits, revert for pushed ones, reflog when it looks gone.

**Common mistake:** Only listing commands with no mental model of working tree, index, and refs.
