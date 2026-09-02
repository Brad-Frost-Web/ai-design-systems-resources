---
term: "Structural coercion"
aliases:
  - "Coercion technique"
  - "Structural constraint"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons: []
status: "in-progress"
tags:
  - "ai"
  - "design systems"
  - "principles"
---
Designing the task so that the wrong output is impossible, rather than instructing the model not to produce it. Telling an agent "please use our design system" is a suggestion it can summarize away; making raw CSS a type error, or refusing to expose a component that does not exist, is a wall it cannot walk through. The ladder runs roughly from weakest to strongest: instruction, then explicit prohibition, then naming the specific hallucinations, then gating capability behind tools, then type and compile enforcement, then a mandatory validation loop. Most teams are stuck on the first rung. This is the design systems argument in new clothing — constraints are not the boring part of the work, they are the product.
