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
