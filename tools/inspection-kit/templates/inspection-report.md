# Multi-Point Inspection Report — <System Name>

_Inspected: <date> · Technician: <agent + model> · Previous inspection: <date or "first inspection">_
_Vehicle profile: `ds-inspection/GARAGE.md` (checked in <date>)_

## The short version

<Three to five plain-language sentences: overall condition, the most load-bearing problems, and the single most important thing to do next. Write it for a teammate who reads nothing else.>

**Overall: <n>/100** — a conversation starter, not a grade. Fix the reds, schedule the yellows, re-run on a cadence.
<If any station is N/I: "Score is /<max> pro-rata — <n> station(s) not inspected for lack of evidence access.">

## Inspection sheet

| # | Station | Quality | Light | Score |
|---|---|---|---|---|
| 1 | Coverage & gaps | Complete | 🔴/🟡/🟢 | /10 |
| 2 | Best practices | Sound | 🔴/🟡/🟢 | /10 |
| 3 | Accessibility | Sound | 🔴/🟡/🟢 | /10 |
| 4 | Shared language | Sound | 🔴/🟡/🟢 | /10 |
| 5 | Testing & validation | Sound | 🔴/🟡/🟢 | /10 |
| 6 | Orchestration | Synchronized | 🔴/🟡/🟢 | /10 |
| 7 | Governance & version control | Extensible | 🔴/🟡/🟢 | /10 |
| 8 | Feedback & adoption | Extensible | 🔴/🟡/🟢 | /10 |
| 9 | Machine-readable docs & context | AI-Ready | 🔴/🟡/🟢 | /10 |
| 10 | Agent access | AI-Ready | 🔴/🟡/🟢 | /10 |

**Key:** 🔴 Red (0–3) — broken or missing; the light is ON · 🟡 Yellow (4–7) — drift or gaps; schedule a fix · 🟢 Green (8–10) — healthy, no action needed · **N/I** — not inspected (no evidence access; never guessed)

## Evidence basis

- Access used this pass: <live tools / exports / screenshots / interview, per asset>
- Findings tagged `[verified]`: <n> · `[reported]`: <n>
- <If reported-heavy: "Large share of findings are [reported] — improving agent access (see work order) will make the next inspection sharper.">

## Station records

<Append each station's completed Station Record block here, in order.>

## What changed since last inspection

<Re-inspections only: score movement per station, lights turned off, new lights, work-order items completed/still open. Delete for first inspections.>

## Next service

- Work order: `ds-inspection/work-orders/<date>-work-order.md`
- Recommended cadence: deep inspection <quarterly>; everyday checks to wire into CI: <stations>
- Re-inspect by: <date>
