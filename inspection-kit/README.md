# Design System Multi-Point Inspection Kit

**Pop the hood. Roll up your sleeves. Figure out what's causing that check engine light.**

This kit turns the AI & Design Systems course's multi-point inspection (Chapter 3) into a real, runnable inspection you can point at *your* design system. An AI agent walks your system through 10 inspection stations — the same ones from the course — and hands you back a red/yellow/green inspection report plus a prioritized work order.

It checks the five qualities of a healthy, AI-ready design system:

| Quality | Question | Stations |
|---|---|---|
| **1. Complete** | Does your system have what products need? | 1. Coverage & gaps |
| **2. Sound** | Is what's in the system actually good? | 2. Best practices · 3. Accessibility · 4. Shared language · 5. Testing & validation |
| **3. Synchronized** | Are assets connected & orchestrated? | 6. Orchestration |
| **4. Extensible** | Can you reliably improve, extend, and evolve the system? | 7. Governance & version control · 8. Feedback & adoption |
| **5. AI-Ready** | Can AI successfully use the design system? | 9. Machine-readable docs & context · 10. Agent access |

## Tool-agnostic by design

This kit is plain markdown. There is no required tool, plugin, or vendor. Every station gathers evidence through a fallback chain:

1. **Live tool access** — if your agent can reach your design file (any Figma MCP — Figma's official server, Figma Console MCP, or another bridge), your repo, or your docs site, it inspects directly.
2. **Exports** — no live access? Paste or attach exports: token JSON, variable exports, a component inventory, package metadata.
3. **Screenshots** — a picture of your Figma layers panel or docs page is real evidence.
4. **Interview** — no artifacts at all? The station asks you the questions and records your answers.

Every finding is tagged **[verified]** (the agent saw it directly) or **[reported]** (you described it). Both count; only one is proof. A report full of `[reported]` findings is your cue to get the agent better access next time.

## Quick start

**Claude Code / Cursor / Windsurf / any coding agent:** copy this `inspection-kit/` folder into your design system repo (or `~/.claude/skills/` for Claude Code), open your agent in the repo, and say:

> Run the design system multi-point inspection. Start with intake.

**Claude Cowork / desktop chat:** drag the folder (or just `SKILL.md` + the station files you need) into the conversation and say the same thing.

**Any plain LLM chat:** paste `intake/GARAGE-INTAKE.md` first, answer its questions, then paste any station file to run that station.

### The three ways to run it

| Mode | Say | What happens |
|---|---|---|
| **Full inspection** | "Run the full multi-point inspection" | Intake (if needed) → all 10 stations → inspection report + work order |
| **Single station** | "Run station 3" / "Inspect our accessibility" | One station, one station record appended to your latest report |
| **Re-inspection** | "Re-inspect" / "Run station 4 again" | Same checks, compared against your previous report — what changed, what didn't |

## What it leaves behind

The inspection writes to a `ds-inspection/` folder in your project:

```
ds-inspection/
├── GARAGE.md                     ← your system's profile ("the vehicle on the lift")
├── reports/
│   └── 2026-07-08-inspection.md  ← dated inspection reports (red/yellow/green, /100 score)
└── work-orders/
    └── 2026-07-08-work-order.md  ← prioritized fixes: reds first, yellows scheduled
```

Keep these in version control. The dated reports are how you see drift over time — the whole point is a cadence, not a one-time event. Deep inspection quarterly; wire the everyday checks (stations 1–6) into CI so problems surface the moment they appear.

## The score is a conversation starter, not a grade

Each station scores 0–10 (red 0–3, yellow 4–7, green 8–10), summing to a /100. Fix the reds first, schedule the yellows, count your greens, and re-run on a cadence. Scale the frame to your team — a two-person system and a 200-person platform hit different bars for green.

## Relationship to Design System Ops

[Design System Ops](https://designsystemops.com/) by Murphy Trueman is an excellent, MIT-licensed Claude Code skill pack for design system practitioners — 40 deep operational skills (token audits, deprecation plans, codemods, stakeholder briefs). This kit is not a replacement for it, and deliberately doesn't reinvent it.

The difference in shape: Design System Ops is a **toolbox** — you pick the right skill for the job. This kit is a **diagnostic frame** — one repeatable inspection, in the course's five-qualities/ten-stations language, that tells you *where* your check engine light is coming from. Several stations point to Design System Ops skills as great "turn off the light" follow-ups. Use both.

## Provenance

Built for the [AI & Design Systems course](https://aidesignsystems.com) by Brad Frost, Ian Frost, and TJ Pitre. The station definitions mirror the course's Chapter 3 inspection checklist. MIT licensed — take it, adapt it, run it on your own garage.
