---
number: "4.bf.06"
title: "Keeping Product On The Eddie Rails: Multi-Phase bfw-process, Settings, Rules, & Validation"
chapter: "Chapter 4"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/77065460-bradfrost-com-keeping-product-on-the-eddie-rails-multi-phase-bfw-process-settings-rules-validation"
notionId: "3ad3c9323e86811bbdc9ed6d0ce78d27"
created: "2026-07-30T00:16:00.000Z"
presenters:
  - "Brad Frost"
tags:
  - "eddie"
  - "context engineering"
  - "process"
  - "mcp"
  - "testing"
---
Brad asks Claude to diagram every mechanism that keeps it from hallucinating UI, then walks the left-to-right pipeline. bfw-process is the versioned rulebook (full mode's phased gates or quick mode for prototyping); his global Claude settings hard-code the non-negotiables — Eddie is the UI layer, no custom components, no Tailwind or shadcn, tokens only; project rule files and agents.md frame the context; a mandatory preamble forces an Eddie Brain check-health before any markup; the brain answers from the knowledge graph with real props, slots, and tokens; composition starts from page templates; a post-generation hook runs validate-file and a headless-browser visual check; deterministic CI gates guard main; and the new Eddie Reporter package feeds adoption data back upstream. Closes by converting the diagram page itself into an Eddie-powered version as a live demonstration.
