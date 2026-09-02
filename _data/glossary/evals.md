---
term: "Evals"
aliases:
  - "Eval"
  - "Evaluation suite"
  - "LLM-as-judge"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons: []
status: "in-progress"
tags:
  - "ai"
  - "design systems"
  - "quality"
---
Repeatable tests that measure whether an AI agent actually follows your design system's rules, rather than assuming it does because you wrote the rules down. An eval gives the agent a task, then scores the output against known-good criteria — often with a second model acting as the judge. Because language models are non-deterministic, a rule that works in one session can quietly fail in the next, so a one-time spot check proves nothing. This is the engine light for AI-assisted work: without evals you know your guardrails exist, but you have no idea whether they held. The teams furthest ahead run evals on every pull request and publish their failures alongside their wins.
