# Keep AI on the Rails: sibling teaching demo

Local route: `/demos/keep-ai-on-the-rails-lab/`, port 8081.
Branch: `feature/33-rails-visual-sibling`. Continues issue #33; this is a local
teaching-design pass, not a production release or completion of the parent epic.

## Assessment and sources

The original Claude artifact has the stronger explanatory material: definitions,
concrete examples, readable human-versus-machine roles, and explicit retry loops.
Its horizontally scrolling nine-station pipeline is difficult to present as one
coherent picture. Source: `_data/resources/keep-ai-on-the-rails-claude.html`.

The first Eddie stepper improves progressive disclosure with eleven rungs, but
its large header and introduction delay the diagram, its similar-looking boxes
flatten roles, and the short labels lose much of the original's teaching depth.
At 1280px wide the original stepper's pipeline begins around 550px down the page;
the first sibling pass began around 300px. Brad’s follow-up restores horizontal
bands and an unbroken process row, prioritizing left-to-right teaching order.

The lesson transcript reinforces the distinction between instructions, system
knowledge, repeatable workflows, executable checks, and human decisions:
[lesson 4.bf.06 transcript](https://app.notion.com/p/3ad3c9323e86811bbdc9ed6d0ce78d27).
Required checks provide evidence; green checks do not supply human approval.

## Implementation

- Eleven-step spectrum retained, with a compact current-beat explanation.
- Concepts above a single left-to-right pipeline, with Eddie ingredients and
  organizational process beneath, matching Brad’s requested reference layout.
  The pipeline never wraps; narrow screens scroll within its own region.
- Human decisions are gold/user icons, AI steps blue, automated checks dark.
  Labels carry the distinction as well as color.
- Select a station to read its explanation and highlight its dependencies. The
  final feedback loop highlights reporter, brain, and process together.
- Settings reveal the original concept explanations and examples verbatim, plus
  original Eddie package explanations. Upcoming pieces are optional and labeled.
- Present reduces chrome; arrows, Home, End, and number keys navigate. The native
  range retains its native keyboard behavior. Escape exits presentation.
- URLs retain rung, descriptions, and presentation settings.
- The server renders the complete lesson; JavaScript progressively filters it.

`aids-rails-lab` is a product-local diagram recipe. Eddie supplies application
chrome, layout, typography, icons, toggles, and actions. The native discrete
spectrum and diagram stations are the local recipe's controls. Styling is scoped
to the sibling and uses Eddie tokens. The original template, data, recipe, and
stylesheet remain unchanged. Eddie dependencies remain at the existing 0.70.0
baseline for comparison; no dependency upgrade or deployment is included.

## Verification

- Production build and all 10 Node tests pass.
- Local Eddie MCP `eddie_validate_file`: zero issues in template, CSS, recipe JS,
  data, and shared import entry. Remote MCP cannot read this Mac's paths; the
  same MCP tool was called via the installed Eddie server, not the narrower CLI.
- Browser exercised all eleven rungs, settings, native slider keys, presentation
  keyboard navigation, Escape, station selection, final-loop connections, and
  deep-linked settings. No horizontal overflow at 385px and 1280px widths.
- Measured station text contrast: AI 17.14:1, checks 18.59:1, humans 9.53:1.
- Eleventy live refresh initially exposed a connection-order bug. Deferring
  enhancement one animation frame fixes it; controls verified after live refresh.
- Independent Standards review: fixed low-contrast upcoming text and missing
  descriptive mobile step labels.
- Independent Spec review: fixed keyboard navigation after Present and made
  the final feedback loop selectable. Original package explanations also restored.

Limitations: descriptions intentionally expand the page; the demo explains the
process rather than running a model or presenting fabricated captured results.
This is not a comprehensive accessibility audit or a shipping-gate verdict.

## Horizontal-layout follow-up

Brad explicitly requested the other version’s general layout on 2026-10-25.
Removed the workspace sidebars and the wrapped station grid. Prompt, nine
stations, result, and feedback now share one horizontal row. Concepts and Eddie
packages occupy full-width bands above and below. Descriptions and connection
highlighting remain intact. Keyboard focus can scroll within the pipeline without
changing the selected lesson rung. No original-demo files changed.

## Active pieces only

Brad requested that inactive pieces disappear entirely. The sibling now removes
the upcoming setting and its labels, ignores legacy `future=1` links, and hides
empty concepts/Eddie bands. The automated-check key and connection hint appear
only when relevant steps are active. The original demo remains unchanged.
