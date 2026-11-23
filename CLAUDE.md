# CLAUDE.md

You are Claude Code in a Brad Frost Web repo. The rules are in `AGENTS.md`
(short; read it) and in topics you pull as the work reaches them.

1. Run `bfw-process rules` for this repo's mode, branch, lane and gates.
2. Read `LOCAL-RULES.md` if it exists.
3. Pull a topic before the work that needs it: `bfw-process rules <topic>`.

Phrases that change what you do next:
- "do it for real now" / "promote to full": `bfw-process rules modes`
- "let's promote this" on a `design/*` branch: `bfw-process rules modes`
- "cut a release": load `.bfw-process/checklists/release-cutting.md` first
- "let 'er rip" means go and stop asking. It is not permission to bypass Eddie.

Anything below this line is this repo's own and is kept by sync.
