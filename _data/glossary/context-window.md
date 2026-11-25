---
term: "Context Window"
aliases:
  - "Context Limit"
  - "Context Rot"
source:
  type: "industry"
  name: "Industry"
references:
  - label: "Claude docs — Context windows"
    url: "https://docs.claude.com/en/docs/build-with-claude/context-windows"
tags:
  - "ai"
  - "llm"
  - "context"
---

The maximum amount of text, measured in tokens, a model can consider at once: its working memory for a task. Everything competes for that space: instructions, AGENTS.md, tool results, documentation, and the conversation so far. Recall tends to degrade as the window fills, which is why subagents, skills that load only when needed, and just-in-time hooks help.
