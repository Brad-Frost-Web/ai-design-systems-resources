---
term: "Tool-gating"
aliases:
  - "Tool gating"
  - "Capability gating"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons: []
status: "in-progress"
tags:
  - "ai"
  - "mcp"
  - "design systems"
---
Restricting what an AI agent can do by exposing only approved operations as callable tools, usually through an MCP server. The logic is blunt and effective: an agent cannot hallucinate a component that was never exposed as something it can call. In practice this looks like requiring a lookup before any component can be used, capping how many results come back so the context stays bounded, and refusing to answer at all until the agent has searched the real system. Tool-gating shifts the design system from something the model recalls to something it must consult, which is the difference between a confident guess and a verified answer.
