---
number: "1.31"
title: "Subagents"
chapter: "Chapter 1"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74427462-subagents"
notionId: "34a3c9323e868180aa37e448364d9f0e"
created: "2026-04-22 19:36:53Z"
presenters:
  - "TJ Pitre"
tags:
  - "agents"
  - "terminology"
  - "ai-architecture"
  - "southleft"
---
Subagents are agents spun up by another agent. A parent agent receives a prompt, splits the work into discrete tasks, and delegates each to subagents running independently in the background; their responses flow back to the parent. TJ ties this to the multi‑step, milestone‑driven checklists familiar from spec‑driven, large‑scale AI‑generated projects — with subagents specialized for code review, accessibility, QA, full‑stack engineering, UX/UI design, etc., deployed based on the task at hand.
