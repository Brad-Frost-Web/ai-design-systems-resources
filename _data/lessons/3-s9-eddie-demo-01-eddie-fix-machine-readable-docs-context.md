---
number: "3.s9.eddie-demo.01"
title: "Eddie: Fix Machine-Readable Docs & Context"
chapter: "Chapter 3"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76682274-eddie-fix-machine-readable-docs-context"
notionId: "39d3c9323e868107bd4cfc4d9438bb20"
created: "2026-07-14T18:26:00.000Z"
presenters:
  - "Brad Frost"
tags:
  - "eddie"
  - "mcp"
  - "documentation"
  - "claude"
---
Eddie scored 8/10 on machine-readable docs and context, but the Eddie Brain MCP validate-file tool was misinterpreting slots in child components — returning 34 false-positive issues on homepage.ts — and some component metadata marked optional props as required. Brad has AI fix the validator tools and metadata accuracy via a PR, reconnects the MCP, and re-runs Eddie validate file to confirm an issue count of zero end-to-end.
