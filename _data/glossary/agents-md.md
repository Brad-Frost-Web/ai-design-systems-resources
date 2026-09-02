---
term: "AGENTS.md"
aliases:
  - "CLAUDE.md"
  - "agent instruction file"
  - "repo agent files"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons: []
status: "in-progress"
tags:
  - "ai"
  - "design systems"
  - "workflow"
---
A markdown file at the root of a repository that tells AI coding agents the rules of the project: what to use, what never to use, how to run checks, and what conventions to follow. AGENTS.md is the vendor-neutral name; CLAUDE.md is the Claude-specific equivalent, and different tools look for different filenames. The most effective ones state plainly that the instructions outrank the surrounding code, which matters in older codebases where the existing patterns are exactly what you are trying to move away from. Plain text survives context-window compression and model summarization better than comments buried in source files, which is why this humble format has become the standard place to encode a design system's hard rules.
