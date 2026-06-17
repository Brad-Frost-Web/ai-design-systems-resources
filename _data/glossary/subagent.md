---
term: "Subagent"
aliases:
  - "subagents"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons:
  - number: "1.31"
    chapter: "Chapter 1"
    title: "Subagents"
    url: "https://app.notion.com/p/34a3c9323e868180aa37e448364d9f0e"
  - number: "1.36"
    chapter: "Chapter 1"
    title: "AI Tools Recap"
    url: "https://app.notion.com/p/34a3c9323e8681af8285de6af3470c11"
tags:
  - "ai"
  - "agents"
  - "tooling"
---

Agents that are spun up by another (parent) agent. The parent agent takes an incoming prompt, splits the work into one or more discrete tasks, and delegates each to subagents that run independently in the background and report their responses back to the parent you're interfacing with. The course ties this to the multi-step, milestone-based checklists seen in spec-driven, large-scale AI-generated projects, where subagents are specialized for tasks like code review, accessibility, QA, full-stack engineering, and UX/UI design — deployed based on the project's needs. They let an agent parallelize and delegate work.
