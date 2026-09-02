---
term: "Code Connect"
aliases:
  - "Figma Code Connect"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons: []
status: "in-progress"
tags:
  - "figma"
  - "design systems"
  - "tooling"
---
A Figma feature that maps design components to their real code counterparts, so when an agent pulls a frame from Figma it gets your actual component and props rather than a generic guess. Mappings live in the codebase as .figma.tsx or .figma.ts files, which keeps them versioned alongside the components they describe. Code Connect is one of the few genuine bridges between the design and code halves of a system, and it remains rare in practice — most teams write mapping guides or property tables instead. It matters most in AI workflows, where the gap between "this looks like a button" and "this IS our Button component" is the whole difference between usable output and cleanup work.
