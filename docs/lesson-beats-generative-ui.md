# Recording beats — generative UI on the resources site

Screen recording on `http://localhost:8888` (`netlify dev`, one server only).
Hover the bottom-right corner for the prompter; click a line to copy it, paste
it into the field, press Enter. Each beat: what's on screen, then the cue.
Cues are riff prompts, not a script.

Before you hit record: `More options` closed, both engine switches off, hard
reload once. The first Claude ask after a restart takes ~15s while the prompt
cache warms; every one after is 7–9s. Consulting eddie-brain live is ~16s.

---

## 1. The ask

**On screen** - type `Figma Console MCP`, Enter. The video strip, the glossary
strip, then the links.

**Cue** - This is the resource site for the course. Instead of a results
list, the page composes an answer out of design system components: TJ's
videos first, the glossary terms, then the links. Point at the strips — three
different kinds of thing, three different shapes.

## 2. The shape follows the question

**On screen** - paste `Month by month, how many resources were added in 2026?`
→ a bar chart. Paste `The Figma plugin ecosystem is overwhelming. Which tools
are worth it?` → a table. Paste `How do I keep design and code components in
sync with AI?` → TJ's sync videos lead.

**Cue** - The question leads the way. A numbers question gets a chart, a
comparison gets a table, a how-do-I question gets the lessons. Same site,
same components, different shape every time. This is the whole point of
generative UI — the interface is composed for the question, not designed
ahead of time for every question we could think of.

## 3. The agent speaks JSON, not code

**On screen** - open `The messages — the agent speaks JSON, not code
(A2UI-shaped)`. Scroll the JSON slowly; land on `beginRendering`,
`surfaceUpdate`, `dataModelUpdate`.

**Cue** - This is A2UI, Google's agent-to-UI protocol, in miniature. Three
messages. Begin rendering names the surface. Surface update is a flat list of
components and ids — the shapes, in order. Data model update is the actual
lessons and links those shapes bind to. The agent never writes HTML. It names
shapes from a catalog and points at data. That's what keeps this safe.

## 4. The catalog comes from the design system

**On screen** - open `The catalog — what the engine may ask for (from
eddie-brain)`. Read the header line aloud: generated from eddie-brain at
ds.bradfrost.com. Then trace one row across: shape → Eddie components → when
the engine reaches for it → Eddie says do → Eddie says don't.

**Cue** - Nine shapes, and I didn't type this list. The site asked
eddie-brain — the design system's machine-readable brain — for each
component's intent and guidelines. Look at the last two columns. That's the
DOs and DON'Ts page from every design system doc site you've ever seen. Same
guidance, same words, except now something other than a human reads it
before choosing a component. The docs stop being a reference and become an
input. Right? (`ed-table` row is the clean one: don't use tables for layout.)

## 5. Why am I seeing this

**On screen** - open `Why am I seeing this?`.

**Cue** - Every view explains itself. Which topics it detected, which
glossary terms it recognized, why lessons come first, which links are marked
recommended. And the honesty rule: under 50% confidence it says so instead of
guessing. Ephemeral — composed for this ask, never stored.

## 6. Two engines, one contract

**On screen** - `More options` → switch on `Compose with Claude`. Paste `How
do I use AI and a design system to build adaptive, dynamic UIs with MCP?`
Enter. The on-device view appears instantly with the "Asking Claude…" box
above it; ~8s later the view is replaced and the chip flips to Claude, with a
summary paragraph in the model's own words.

**Cue** - Everything so far ran in your browser on keyword rules — no
server saw the ask. That's the floor. Flip the switch and the same ask goes
to Claude with the same catalog, and back comes the same three messages.
Different agent, identical contract. The design system is what makes the
swap possible: the model can only ask for what Eddie offers.

## 7. The design system as a live participant

**On screen** - switch on `Consult eddie-brain live`. Paste `How do I keep
design and code components in sync with AI?` Enter. ~16s. Open `Why am I
seeing this?` — the trace line shows `eddie_search` with the query Claude
sent and what came back.

**Cue** - Now Claude doesn't just read the catalog, it asks the design
system mid-answer: "what's the right component for a learning path?" That's
an MCP call to eddie-brain, live, in the middle of composing a page. The
DOs and DON'Ts aren't a page anymore. They're a colleague you can ask.

## 8. Recap

**On screen** - back to the top, `Figma Console MCP` one more time.

**Cue** - So: the question sets the shape. The agent speaks JSON, not code.
The catalog comes from the design system's own machine-readable docs, DOs
and DON'Ts included. And the design system is the guardrail — off-catalog
requests get refused, on-catalog requests look like your product because
they are your product. Generative UI on design system rails.

---

## The copy-paste list (also in the hover prompter)

1. `Figma Console MCP`
2. `How do I use AI and a design system to build adaptive, dynamic UIs with MCP?`
3. `How do I connect my React design system to Figma Make via MCP?`
4. `How do I keep design and code components in sync with AI?`
5. `Skills vs rules vs agents.md vs MCP: when do I use which?`
6. `The Figma plugin ecosystem is overwhelming. Which tools are worth it?`
7. `Month by month, how many resources were added in 2026?`
8. `What's new this month?`

Typing a variant works too — "Tell me about Figma Console MCP" resolves to
the same view, and the why-panel says so.
