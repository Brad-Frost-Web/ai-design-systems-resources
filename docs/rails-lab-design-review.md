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

## Remove the narrative band

Brad rejected the persistent step headline, explanation, missing-piece panel and
separate legend. Those elements and their styling are removed. The existing
step buttons carry optional native hover text; the slider and live region
still announce the current step. Human/AI/check labels remain on the stations.

The process heading is now “Process,” without the scroll instruction. The page
uses Eddie’s supported `--ed-layout-container-max-width: 100%` with the `wide`
variant removed (that variant overrode the custom property with an 80rem cap).
The installed Eddie version does not expose a `full` variant.

## Restore authored timeline cards

Timeline copy now comes directly from the original HTML, including all nine
kickers, titles, explanations, tool lists and “Prevents” footers, plus prompt,
launch and feedback cards. Wording, emphasis and code spans are preserved.
Cards restore the original structure, pale surfaces, numbered badges, human
treatment and wider metallic Steel Curtain, using Eddie tokens and title-sm.
All explanations are inline; clicking a heading only highlights connections.
The five connectors from 4–5 through 8–9 use Eddie’s refresh-cw sync glyph.

Brad’s explicit request to match the original card treatment is the authority
for primitive Eddie radius tokens (the BFW theme radii are square) and neutral
Eddie tokens for the Steel Curtain material. Eddie validation flags these as
tier-one warnings; they are deliberate, scoped recipe styling, not raw values.

## Restore system copy and section bands

Eddie and bfw-process now read their original copy directly from the authored
HTML: six knowledge-graph files, all ten packages, section introductions, the
complete process explanation, six phases, two gates, and eight chips. System
descriptions remain visible; the settings toggle controls concept descriptions.
The previously omitted boilerplates and website packages enter with installation
at rung 3; existing package and knowledge-file thresholds are preserved.

Concepts, Eddie, and bfw-process each use an Eddie band outside the layout
container, with one full-width layout container inside. Eddie uses the knockout
variant with matching knockout passages and icons. Empty bands still disappear
until their contents are in play. Original demo files are unchanged.

The recipe opts into Eddie's `data-bleed` main-child convention so the bands
reach both viewport edges. Browser checks at 1280px and 385px confirm no page
overflow; rungs 0, 1, 3, 4, 8 and 10 preserve progressive disclosure. The concept
toggle still works without hiding the restored system descriptions. Build and
all 12 tests pass; independent Spec and Standards reviews report no new findings.

## Seven-level spectrum

Brad approved replacing the eleven tool/activity rungs with seven infrastructure
levels: Prompted, Instructed, System-grounded, System-composed, Automatically
checked, Process-governed, and Connected back to the system. The existing recipe
and state helpers carry this change; no new framework or UI pattern is needed.
Settings and rule files consolidate into Instructed; packages and authoritative
knowledge into System-grounded; workflow and release gates into Process-governed.

The resulting UI and human review now appear at every level, in that order.
The output copy describes intended use and limits at each level rather than
claiming increasing visual quality. The human feedback loop stays explicit.
Specification precedes building in the governed levels; CI and merge approval
follow human review; shipping is a separate downstream event. Existing sync
connectors and the product/system feedback loop remain.

Original system-section and concept source copy remain intact. The review card
loses its obsolete step-six dependency; the early rules card describes guidance
until governance appears. The Hooks example's station numeral follows the actual
Steel Curtain badge. Visible process actions renumber independently of the seven
levels. URLs remain zero-indexed (`rung=0` through `6`); an old `rung=10` clamps
to the complete system. Keyboard numbers 1–7 match the displayed level labels.

Build and 14 tests pass, including rendered-template order checks at all seven
levels. Browser verification confirms universal result/review, hidden future
pieces, level-specific output, Home/number/slider keys, descriptions, and matching
station references. Independent Spec and Standards findings were corrected and
re-reviewed. Local preview only; original demo files and dependencies unchanged.
The existing feature branch remains five commits behind remote main deliberately
to keep unrelated base changes out of this review iteration.

## Interface and human visual materials

The Resulting UI card now resembles a browser window: decorative window controls,
an address field, a navigation rail, and interface blocks sit behind an opaque
copy panel. The art is static, pointer-inert, and hidden from assistive technology.
It illustrates the type of output without claiming to show a real generated UI.

Human prompting, specification, review, and merge approval use warm paper-like
surfaces, a strong gold top edge, and enlarged circular actor icons. Existing
human labels and explanatory copy remain, so the distinction is not color alone.
AI steps and the Steel Curtain retain their separate treatments. This extends
the existing token-backed diagram recipe; no new component or dependency.

Build and the existing 14 tests pass. Desktop rendering confirms readable output
copy and the shared human treatment across the governed process. Independent
review corrected a decorative dot's token role and physical positioning; the
final styling uses logical positioning and inherits the existing card radius.

Brad's follow-up simplifies the interface metaphor: retain the browser top bar,
remove the sidebar, background widgets and cream overlay, and place the icon and
Resulting UI title in a boxed blue hero with the unchanged explanation beneath.
All content now uses normal flow. Browser inspection confirms the copy surface
is transparent, the hero precedes the text, and the page does not overflow.
Build, 14 existing tests, and independent Spec/Standards reviews pass; no new
validation findings. Human treatments remain unchanged.

### Course robot and prompt composer — 2026-10-25

Brad approved using the course robot on agent steps and cycling the three authored examples inside a faux chat composer. The existing entry card and recipe carry this change; the static list becomes one example at a time when enhanced. No chat service, new form, or library is needed.

The current course homepage no longer includes the robot. Recovered its original SVG geometry from `ai-design-systems-course-website` at `2067b05^:_includes/robot.njk` (the commit that removed the theme-prompt robot). `images/course-robot.svg` exposes it as an Eddie icon sprite symbol; fill colors inherit Eddie tokens. AI steps and the model-directed spectrum endpoint use it; human and automated validation symbols retain their distinct meanings.

Examples rotate every 4.5 seconds. Pause/Play and Next are real Eddie buttons; Next pauses rotation for inspection. Reduced motion starts paused, keyboard focus inside the composer stops rotation, hidden tabs stop timers, and disconnect cancels them. All three original examples remain readable without JavaScript. The composer uses the existing radius-16 primitive to preserve the rounded chat shape; BFW semantic radius tokens are zero. This extends the previously approved illustrative radius treatment by one validator warning.

Verification: production build; 16 passing tests including cycling/wraparound, manual pause/next, reduced motion, keyboard focus, tab visibility and disconnect. Browser check on port 8081 confirms original robot rendering, automatic cycling, pause and manual next. Original demo and source copy unchanged. Independent spec and standards reviews run separately before the closing commit.

### Ambient composer, header hierarchy, and aligned slider — 2026-10-25

Brad directed removing the example count and playback controls, resolving the competing robot header, and aligning the spectrum. The composer now contains only prompt text and decorative plus/send artwork, with no interactive controls. The animation switch moved into existing Settings; reduced motion starts it off, and timers still stop on hidden tabs and disconnect. AI headers put the number and label together, with the original robot reduced to 32px and aligned at the far right.

The seven label columns remain equal-width. The native slider now has an explicit token-sized thumb and inset travel matching their centers. Browser measurements at 1280px found a maximum center discrepancy below 0.007px across all seven positions. WebKit and Firefox thumb/track styles are specified. A standards review caught the inactive track's subtle-border contrast (2.68:1); changed it to the default border token. Spec review caught the animation setting's missing visible slot label; fixed and browser-verified. Build and all 16 tests pass; no Eddie validator errors, with the same 15 documented primitive-token warnings. Original demo unchanged.

### Workshop cleanup — 2026-10-28

P1.0–P2.2: resumed issue #33's approved feature branch in the managed
`rails-workshop` checkout; the primary checkout's unrelated design work is intact.
Fetched origin, retained the existing branch (six commits behind main) deliberately.
Read the pinned 0.24.0 rules and recorded Brad's approved punch-list amendment.

P3.2–P3.3: upgraded Eddie components, recipes and tokens to 0.72.1. Removed the
masthead, settings panel, endpoint labels, footer and redundant review-loop copy.
Concept title buttons toggle all descriptions; packages use a default-collapsed
Eddie accordion. Main section headings are centered, numbered cards square, and
human header icons use the same right-aligned 32px size as robots. The slider uses
background-role utility knockout tokens for its red-to-green gradient. Steel code
uses the existing neutral palette (two additional primitive-token warnings; removing
the card radius drops one, leaving 16 warnings total and no validation errors).

Prompts crossfade in a shared grid cell, preserving the tallest example's height.
The composer itself toggles pause with click/tap or Enter/Space; Escape pauses.
No playback controls are shown. Its accessible description follows the active
prompt; reduced motion starts paused and hidden tabs/disconnect stop timers.

The inline eddie-brain introduction and concise bfw-process copy reduce overhead.
Page template metadata was verified in Eddie's component index builder and MCP
server: `components.json` contains `ed-p-*` entries, discovered by `list_pages` and
read with `get_component`; `recipes.json` contains composition recipes. DESIGN.md
is described as an option, outside Brad's setup example.

P4.1: 17 tests pass, production build succeeds, template/JS validate without issues,
CSS has zero errors and 16 documented visual-treatment warnings. Independent Spec
and Standards reviews passed after fixing gradient token roles and prompt pause
accessibility. Browser checks on 8081 confirm global description toggling, keyboard
activation, package expansion/collapse, 32px human icons, neutral Steel code,
constant 72px prompt region across all three examples, no page overflow at 1280px,
and no console errors. No new narrow-viewport or no-JS browser run was performed;
existing responsive rules and unenhanced prompt content remain intact.

P4.2–P4.3: local workshop preview only; ship gate, PR, merge and deployment are not
part of this request. P5.1: this record supersedes the earlier settings/controls and
human-header descriptions. Original demo source and authored source data remain
unchanged; the shared Eddie dependency upgrade applies site-wide as requested.

### Shipped UI, review narrative and graph connections — 2026-10-28

P2.1/P3.3: Brad authorized three refinements. Resulting UI and Shipped UI now share
one interface-card macro; the shipped description remains authored source copy.
Human review has seven similarly sized descriptions (140–200 characters), moving
from frustrating repeated prompting to ingredient/pattern checks, automatic checks,
approved specifications, and feedback from real use. The existing rung renderer
updates this copy with textContent. Design-system stations now include relevant
brain-components/brain-tokens/brain-recipes IDs in their connection data; feedback
links to learning/adoption/activity. Existing highlight logic and styles carry it.

P4.1: 18 tests and production build pass. Separate Spec and Standards reviews
report no findings; template and JS validate with zero issues. Browser checked
all seven review states, visible Consult graph highlights, and the complete
Shipped UI card. No console errors. P5.1: original source and original demo intact;
local preview only, no ship gate or deployment requested.
