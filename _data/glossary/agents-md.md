---
term: "AGENTS.md"
aliases:
  - "CLAUDE.md"
  - "Context Files"
  - "Rules Files"
  - ".cursorrules"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons:
  - number: "3.s6.eddie-demo.01"
    chapter: "Chapter 3"
    title: "Eddie: Fixing Synchronization in Knowledge Graph & CLAUDE.md"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76682098-eddie-fixing-synchronization-in-knowledge-graph-claude"
  - number: "4.bf.02"
    chapter: "Chapter 4"
    title: "Reviewing the project SPEC"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76793225-bradfrost-com-reviewing-the-project-spec"
  - number: "4.bf.06"
    chapter: "Chapter 4"
    title: "Keeping Product On The Eddie Rails: Multi-Phase bfw-process, Settings, Rules, & Validation"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/77065460-bradfrost-com-keeping-product-on-the-eddie-rails-multi-phase-bfw-process-settings-rules-validation"
references:
  - label: "agents.md"
    url: "https://agents.md"
tags:
  - "ai"
  - "agents"
  - "tooling"
---

A Markdown file at the root of a repository that briefs every coding agent session: what the project is, its conventions, its non-negotiables, and how to build and test it. AGENTS.md is the vendor-neutral name; CLAUDE.md, .cursorrules, and copilot-instructions.md are tool-specific equivalents. There's no canonical file to download: yours should say what's true of your system. Keep it short, since it loads into every session's context window, and govern it like any other source of truth so it doesn't drift.
