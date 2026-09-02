---
term: "Context budgeting"
aliases:
  - "Progressive disclosure"
  - "Curated context"
  - "Lazy-loaded context"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons: []
status: "in-progress"
tags:
  - "ai"
  - "context"
  - "documentation"
---
Structuring documentation so an agent pulls only the slice it needs, instead of loading everything and drowning. A full design system docs dump can run hundreds of kilobytes; a well-budgeted version might load ten or twenty on demand, with each reference tagged by the condition that should trigger reading it. Techniques include slicing context files by concern, routing through a compact index that points to detail files, and returning an overview plus a table of contents when a response would otherwise be enormous. The payoff is that expensive model reasoning goes toward judgment rather than reading, and quality tends to go up rather than down when you give the model less.
