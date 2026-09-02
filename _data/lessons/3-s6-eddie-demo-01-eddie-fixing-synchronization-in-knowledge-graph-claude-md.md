---
number: "3.s6.eddie-demo.01"
title: "Eddie: Fixing Synchronization in Knowledge Graph & CLAUDE.md"
chapter: "Chapter 3"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76682098-eddie-fixing-synchronization-in-knowledge-graph-claude"
notionId: "39d3c9323e8681cbb940ea10f92c0e75"
created: "2026-07-14 18:26:32Z"
presenters:
  - "Brad Frost"
tags: []
---
Brad tackles Eddie's 6/10 orchestration score by fixing drift between the actual library source (93 core components, 20 recipes, 13 pages) and what claude.md and Eddie Brain claim (88 components, 12 recipes, 12 pages). Claude Code builds sync checks into the build and CI process, scopes the knowledge graph to the seven core themes (excluding experimental v9 themes), and governs every doc with counts so the artifacts can't silently drift again.
