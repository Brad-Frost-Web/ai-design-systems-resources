---
term: "Component registry"
aliases:
  - "Registry metadata"
  - "Machine-readable registry"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons: []
status: "in-progress"
tags:
  - "design systems"
  - "ai"
  - "tooling"
---
A machine-readable index of everything in a design system — components, props, slots, events, tokens, icons — published as structured data an agent can query instead of guessing. Once a registry exists, an agent no longer has to reason about whether a prop is called 'variant' or 'kind'; it looks it up and gets a definitive answer, often with a JSON Schema attached so invalid values fail immediately. Registries turn component APIs from something a model has to remember into something it can verify, which is why they are one of the strongest anti-hallucination moves available. They also double as the source for generated documentation and context files, so the same data serves humans and machines.
