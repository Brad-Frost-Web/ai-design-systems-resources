---
station: 1
name: Coverage & gaps
quality: Complete (quality 1 of 5)
question: Does your design system contain the necessary ingredients your products need, present across design, code, and docs?
---

# Station 1 — Coverage & gaps

**Quality: Complete.** Before you can judge quality, find what's simply missing — whole components, states, variants, tokens, docs — and whether what exists is evenly represented across the three-legged stool: design library, code library, documentation.

## Evidence to gather

| What to look at | Best source | Fallbacks |
|---|---|---|
| Component inventory (design) | Live design-tool bridge: list components/variants | Pasted component list · screenshot of assets panel · interview |
| Component inventory (code) | Repo: component directory, exports/barrel file, published package | Pasted directory listing · package README |
| Token system | Repo token files (JSON/SCSS/CSS vars) + design variables | Pasted token export · screenshot of variables panel |
| Documentation coverage | Docs site/Storybook: page-per-component check | Pasted sitemap/nav · interview |
| Product needs | Product screenshots or URLs, team's "most requested" list | Interview: "what do teams keep asking for or rebuilding?" |

## Inspection procedure

1. **Build the three-column inventory.** List components in design, in code, in docs. Sample honestly if the library is large (say what you sampled). The money finding is the *misalignment*: things in code but not design, design but not code, either without docs.
2. **Check the meat-and-potatoes set.** Compare against the common core most product UIs need: button, link, input set (text/select/checkbox/radio), form patterns + validation, card, table, modal/dialog, tabs, accordion, alert/toast, badge, avatar, pagination, breadcrumb, navigation, tooltip, loading/empty/error states. Missing common staples means teams are rolling their own.
3. **Check state & variant depth.** For 3–5 core interactive components: hover/focus/active/disabled/error states present in both design and code? Variants matched across the two?
4. **Check token completeness.** Are color, typography, spacing, radii, elevation all tokenized — or color only? Is there a tier structure (primitive → semantic → component) or one flat pile? Spot-check components for hardcoded hex/px where tokens should be.
5. **Check docs existence** (existence only — quality is Station 2): does each sampled component have *any* documentation? Is there any high-level guidance (a11y, i18n, getting started)?
6. **Check distribution.** Is there a published, versioned artifact teams can actually consume (npm package, published Figma library) — or do people copy-paste from a file?

## Warning lights

- Design components with no code counterpart (or vice versa)
- Whole categories missing, so teams roll their own
- Partial or untiered tokens (color but no spacing/type; no primitive → semantic → component tiers)
- Hardcoded hex/px values where tokens should be
- Components missing states or variants
- Thin or missing docs — no descriptions, guidelines, or onboarding
- No published, distributed artifact

## Scoring anchors

- **Red (0–3):** Major staples missing or the three legs badly uneven — e.g. a code library with no design counterpart, no real token system, no distribution.
- **Yellow (4–7):** Core set mostly present, but meaningful gaps: missing variants/states, token tiers half-built, docs spotty, some design/code mismatch.
- **Green (8–10):** The team can honestly say: *"We have the majority of what's needed to build most core flows of most core products"* — evenly represented in design, code, and docs, with tokens tiered and an artifact published. (A system is never "done" — green means confidence, not 100% coverage.)

## Turning off the light

- Feed the three-column inventory to an LLM for a **gap analysis with proposed priorities** — then the team decides which holes are worth filling. Not every gap deserves a component.
- Use AI to **generate the missing pieces in your system's shape**: a new pagination component in the same style as your existing components; translate a code-only card into a proper design counterpart (or vice versa); draft missing docs and stub token tiers.
- Run a token audit (FigmaLint or similar) to catch every hardcoded value; converting them into your token tiers is highly automatable.
- Related deep tools: Design System Ops `component-audit`, `token-audit`, `docs-coverage`.

## Station record

```markdown
### Station 1 — Coverage & gaps: <RED|YELLOW|GREEN> (<n>/10)
- Inventory: <n> in design · <n> in code · <n> documented (sampled: <scope>)
- Evidence level: <live / export / screenshot / interview, per asset>
- Findings:
  - [verified|reported] <finding + evidence>
- Not inspected: <what and why>
- Deviations noted: <intentional gaps>
- First move: <single highest-leverage fix>
```
