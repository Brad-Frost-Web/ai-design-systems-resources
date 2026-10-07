# Phase 1 — Understand & Scope

> **Goal:** Know what you're building, who it's for, and what type of project it is, before you write a single character of code or spec.

## Inputs

- A project brief (written, verbal, or chat message)
- Prior context from Notion or related repos (if any)
- This repo's existing state (is there already a `SPEC.md`? a `config.json`? prior commits?)

## Activities

1. **Read the project brief carefully.** Understand what is being built, who it's for, and what problem it solves. Re-read it. Brief-reading is where half of Phase 1 errors originate.
2. **Run `eddie_check_health`.** If this project touches Eddie at all (most do), start with the current Eddie catalog health summary. The numbers (components, recipes, pages, themes, learning loop) tell you how much to trust the catalog before you plan against it. A thin recipe corpus means you'll compose from primitives; a rich one means you can reach for canonical patterns. Make this output part of your Phase 1 working context.
3. **Pull relevant context.** Check Notion (if available) for existing project pages, SOPs, prior decisions. Check related BFW repos for patterns that might apply.
4. **Clarify ambiguities.** Surface every unknown before you start speccing. Don't assume. Ask questions in plain language. If you're an agent and the user is available, ask them. If the user is asleep, log the questions for when they return — don't paper over them.
5. **Identify project type.** Pick one:
   - **Content / CMS site** → Eleventy + Eddie + Netlify
   - **App with auth / state / realtime** → Nuxt + Eddie + Netlify
   - **Component or recipe** → Eddie monorepo only
   - **Script or automation** → Vanilla Node/Python, no UI framework
6. **Confirm the mode.** Full or Quick? Check `.bfw-process/config.json` if it exists. If not, assume Full unless the brief explicitly says "let's just prototype" / "teaching demo" / "quick sketch".
7. **Is this a design exploration?** If the brief is genuinely exploratory — "I'm not sure what this should be yet," "let's sketch some directions," "play with the idea before we commit" — the right path is a **design branch**, not a Phase 2 spec. Open a `design-exploration` issue (template in `.github/ISSUE_TEMPLATE/`), branch as `design/<N>-<slug>`, skip ahead to sketching, and revisit Phase 2 at promotion time. See AGENTS.md §5.3. If the brief is "build X" with X reasonably well-defined, stay on the main rails and proceed to Phase 2.
8. **If the task is "improve this codebase", scope it from history — not intuition.** When there's no feature brief (*"harden this"*, *"pay down debt here"*), pick the target by walking the commit log for hot spots **before reading any code**: `git log --since='3 months ago' --name-only --pretty=format: | sort | uniq -c | sort -rn | head -30`, then `git log --oneline --grep='^fix' -- <path>` on the leaders. Deepening work pays off in proportion to how often the code changes, so churn — and fix-commit density especially — is the signal. Record the evidence alongside the chosen scope so the next reader can check the reasoning. See AGENTS.md §6.1.
9. **Name the content's tone — and the theme energy it needs.** Every brief has a tone: playful, urgent, editorial, celebratory, utilitarian. Write it down as part of Phase 1 output. Eddie's theming exists to express tone — a check-engine-light metaphor wants energy; a legal-archive page wants restraint. Naming the tone now gives Phase 3 something to match a theme against, instead of defaulting to whatever theme happens to be active. Token-compliant and on-tone are different bars; this step is where the second one gets set.

## Checklist

See `checklists/phase-1-scope.md`.

## Output

- Confirmed project type
- Confirmed mode (quick / full)
- A list of clarifying decisions either answered or flagged as open questions
- For improvement work: the chosen target plus the churn evidence that picked it (§6.1)
- Readiness to move to Phase 2 — **or**, if this is a design exploration, readiness to open a `design/*` branch and skip ahead to sketching (see AGENTS.md §5.3)

## What NOT to do in Phase 1

- Don't start writing a `SPEC.md` yet. That's Phase 2.
- Don't start picking file names or library versions. That's Phase 3.
- Don't start coding "just a little." That's Phase 4, and it's the single most common failure mode. Phase 1 exists because skipping it costs more time than it saves.

## Quick mode note

In Quick mode, Phase 1 still happens — it's just compressed. You still need to know what you're building and what type of project it is. You can skip §2 (Notion context pull) and §3 (formal clarifying questions) if the human is right there and iterating with you in real time.
