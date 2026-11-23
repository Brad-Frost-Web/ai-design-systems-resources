# AGENTS.md — Brad Frost Web build rules (experiment)

This is a BFW experiment: built to learn from, free to throw away. Four rules still hold, and the rest is one command away.

## Always

1. **Eddie is the UI layer.** Build with `@brad-frost-web/eddie-web-components` and `eddie-recipes`.
2. **Tokens only.** Every color, space and type value is an `--ed-*` custom property.
3. **Accessible as you go.** WCAG 2.1 AA, on every branch, in every mode.
4. **`BFW_OWNER_OVERRIDE=1` is an owner's call**, never yours.

## Before you start

- Run `bfw-process rules`: this repo's mode, branch, lane and gates.
- Read `LOCAL-RULES.md` if this repo has one. Where it differs from a topic, it wins here.

## Pull the rule when the work reaches it

`bfw-process rules <topic>` prints one topic; `bfw-process rules --list` names them all. No shell? Read `node_modules/@brad-frost-web/bfw-process/rules/<topic>.md`.

<!-- topics:start -->
- `eddie`: you write or change any UI
- `libraries`: you want a third-party library, or are deciding where a package lives
- `accessibility`: you build or review anything a person uses
- `dependencies`: you add, bump or run a dependency
- `sessions`: you are starting cold or closing out
- `modes`: you are in Quick mode, on a design branch, or promoting
<!-- topics:end -->

When in doubt, stop and ask. If the experiment starts to matter, say so: promoting it is a human's decision (`bfw-process rules modes`).
