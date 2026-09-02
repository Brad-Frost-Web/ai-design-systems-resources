---
term: "Validation loop"
aliases:
  - "Self-healing loop"
  - "Validation gate"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons: []
status: "in-progress"
tags:
  - "ai"
  - "quality"
  - "workflow"
---
A mandatory check that runs after an agent generates code, producing a pass or fail the agent must respond to before the work counts as done. Linters, type checkers, accessibility audits, and test runs all work: the key property is that a shell command with an exit code is not something a model can talk its way around. This is the most widely adopted anti-drift technique across mature design systems, and the reason is simple — deterministic tools give the model an undeniable repair signal, where prose guidance only gives it a suggestion. The strongest versions make validation a precondition rather than a recommendation, so the task is not complete until the checks are green.
