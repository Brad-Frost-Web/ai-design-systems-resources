# Phase 1 Scope Checklist

Use this before declaring Phase 1 complete.

- [ ] Project brief has been read in full
- [ ] Notion / related repos have been checked for prior context
- [ ] Project type has been identified (content-site / app / recipe / script)
- [ ] Mode is confirmed (full / quick)
- [ ] All obvious ambiguities in the brief have been surfaced as questions
- [ ] Questions that can't be answered without a human have been logged
- [ ] If the mode is Full, the human has been told Phase 2 is next and `SPEC.md` is needed
- [ ] If the mode is Quick, the human knows the quick-mode contract (§2 rules stay on, everything else is relaxed)

## Improvement work — when there's no feature brief (§6.1)

Only applies when the task is "improve / harden / clean up this codebase" rather than "build X".

- [ ] The commit log was walked for hot spots **before** any code was read
- [ ] Churn ranking captured: `git log --since='3 months ago' --name-only --pretty=format: | sort | uniq -c | sort -rn | head -30`
- [ ] Fix-commit density checked on the leading paths: `git log --oneline --grep='^fix' -- <path>`
- [ ] The chosen target is justified by that evidence, not by intuition or recall
- [ ] The evidence is written down alongside the scope so the next reader can check it

## What "done" means

You can answer in one sentence: "This is a `<type>` project in `<mode>` mode that does `<thing>` for `<users>`, with these open questions: `<list>`."
