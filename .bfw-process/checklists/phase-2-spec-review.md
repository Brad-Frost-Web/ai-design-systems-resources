# Phase 2 Spec Review Checklist

Use this when reviewing a `FEATURE-SPEC.md` before promoting it to `status: approved`.

**Check you're reviewing the right document.** This is the branch-scoped feature spec (AGENTS.md §4.1). The project's `SPEC.md` is a different artifact — durable, amended rather than rewritten — and approving it authorises no work.

## Did this need a spec at all?

- [ ] The work meets the §4.3 threshold (new capability, changes a convention or public API, spans several subsystems, or "what should this do?" has more than one defensible answer)
- [ ] If it didn't, say so and skip the ceremony — a spec written for work that didn't need one teaches everyone the gate is theatre

## Frontmatter

- [ ] `status` is `draft`
- [ ] `issue` names the issue this branch closes
- [ ] `branch` matches the branch actually being worked on
- [ ] `owners` list is correct
- [ ] `last_updated` is today's date

## Required sections (all must be present and filled in)

- [ ] **Origin** — links the parent initiative and states explicitly what THIS spec is limited to
- [ ] **What it is** — one paragraph, plain English
- [ ] **Who it's for** — target users, use context
- [ ] **Goals** — outcomes, not feature lists
- [ ] **Non-goals** — explicit scope boundaries
- [ ] **User flows** — key journeys in plain English
- [ ] **Data model** — key entities and relationships (or "N/A" with explanation)
- [ ] **Tech decisions** — stack choices and rationale for any non-defaults
- [ ] **Accessibility requirements** — any specific WCAG targets beyond baseline
- [ ] **Open questions** — unknowns needing human input

## Quality checks

- [ ] Goals are outcomes, not feature lists
- [ ] Non-goals are explicit and specific (not just "we won't build unrelated things")
- [ ] User flows read like sentences a non-engineer can follow
- [ ] Every non-default tech decision has a written rationale
- [ ] Every open question is actually answerable (not rhetorical)
- [ ] No section says `TODO` or is empty
- [ ] The spec describes *this branch's work*, not the project — if it reads like a project charter, it belongs in `SPEC.md`
- [ ] Scope is narrow enough that "done" is unambiguous
- [ ] No hidden assumptions (e.g., "we'll figure out auth later" is either scoped in or listed as non-goal)

## Promotion

When every item above is checked:

1. Frontmatter `status: draft` → `status: approved`
2. Commit the spec
3. Phase 3 can begin
