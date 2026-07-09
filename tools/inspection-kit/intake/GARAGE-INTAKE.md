# Garage Intake — Check the Vehicle In

Before any inspection, check the vehicle in. This step builds `ds-inspection/GARAGE.md`: a profile of the design system and a map of what evidence the agent can actually reach. Every station reads this file first — good intake is what makes the inspection specific instead of generic.

**Agent:** work through the sections below conversationally — a few questions at a time, not a wall of forms. Wherever you have live access (design-tool bridge, repo, docs URL), *discover* the answer yourself and confirm it instead of asking. Aim for 10–15 minutes, not an interrogation. Then write `GARAGE.md` using the template at the bottom and read it back for confirmation.

## 1. The vehicle

- Design system name, and the organization/product landscape it serves
- Team: how many people run the system? Dedicated or side-of-desk? Design/eng/docs mix?
- Consumers: how many product teams / properties use it?
- Age & mileage: how old is the system? Any major rebuilds or migrations?
- Why now: what prompted this inspection? (Sold to leadership? Post-incident? AI-readiness push? Routine service?)

## 2. The assets (the three-legged stool + AI surface)

For each, capture *what exists* and *where it lives*:

- **Design library** — tool (Figma/Penpot/Sketch/other), file organization, variables/styles setup, published libraries
- **Code library** — framework(s), repo location(s), package name(s), how it's distributed, token pipeline (Style Dictionary etc.)
- **Documentation** — platform (Storybook/Zeroheight/Supernova/custom site/wiki), URL, what it covers
- **Process ephemera** — issue tracker, contribution docs, changelog, Slack/Teams support channel, meeting notes
- **AI surface** — anything already in place: MCP servers, llms.txt, Code Connect, component metadata, agent rules files

## 3. Evidence access map (the critical part)

For each asset, establish what the agent can reach **right now**, and record it honestly:

| Asset | Access level to record |
|---|---|
| Design library | `live` (a design-tool MCP/bridge is connected — name it) / `export` (user will paste variable/token/component exports) / `screenshot` / `interview` |
| Code library | `live` (repo open or reachable) / `export` (pasted files) / `interview` |
| Documentation | `live` (fetchable URL or local files) / `export` / `interview` |
| Process ephemera | `live` (tracker/APIs reachable) / `export` (pasted lists) / `interview` |

**Agent: test, don't assume.** If a design bridge appears connected, make one real call and confirm you can see the user's actual library. If repo access seems available, read one real file. Record what worked. If everything lands on `interview`, say so plainly: the inspection will run, findings will be `[reported]`, and the first work-order item should be getting the agent better access.

## 4. Known symptoms

Ask like a mechanic: *"What's it doing? When did it start?"*

- Where does the team already suspect the check engine light is coming from?
- Recent complaints from product teams? Recurring support questions?
- Anything the team is proud of (probable greens — worth verifying and celebrating)?
- Any intentional deviations from common practice the inspection should respect?

## 5. Scope & frame

- Which stations matter most right now? All 10, or a subset?
- Team-size frame for scoring (solo / small team / platform org)
- Anything explicitly out of scope this pass?

---

## GARAGE.md template

```markdown
# GARAGE.md — <System Name>
_Checked in: <date> · Re-confirm at next inspection_

## Vehicle
- System: <name>, serving <org/products>
- Team: <size, shape> · Consumers: <n teams>
- Age: <years, major rebuilds>
- Reason for service: <why now>

## Assets
- Design library: <tool, files, variables setup>
- Code library: <framework, repo, packages, token pipeline>
- Docs: <platform, URL, coverage>
- Process: <tracker, contribution docs, changelog, support channel>
- AI surface: <MCP / llms.txt / Code Connect / metadata / none yet>

## Evidence access map
| Asset | Access | Verified how |
|---|---|---|
| Design library | live / export / screenshot / interview | <e.g. "Figma bridge call returned the real library"> |
| Code library | live / export / interview | <e.g. "read src/tokens/color.json"> |
| Docs | live / export / interview | <…> |
| Process | live / export / interview | <…> |

## Known symptoms
- <suspected reds/yellows, complaints, support themes>

## Probable greens
- <what the team believes is healthy>

## Intentional deviations
- <deliberate, documented departures the inspection should respect>

## Scope & frame
- Stations this pass: <all / subset> · Scoring frame: <solo / small team / platform org>
- Out of scope: <…>
```
