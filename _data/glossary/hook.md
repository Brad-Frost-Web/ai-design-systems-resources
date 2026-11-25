---
term: "Hook"
aliases:
  - "Hooks"
  - "Validation Hook"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons:
  - number: "4.bf.06"
    chapter: "Chapter 4"
    title: "Keeping Product On The Eddie Rails: Multi-Phase bfw-process, Settings, Rules, & Validation"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/77065460-bradfrost-com-keeping-product-on-the-eddie-rails-multi-phase-bfw-process-settings-rules-validation"
references:
  - label: "Claude Code — Hooks reference"
    url: "https://code.claude.com/docs/en/hooks"
tags:
  - "ai"
  - "agents"
  - "tooling"
  - "quality"
---

A script the harness runs automatically at a specific moment in an agent's work, such as right before a tool call or right after a file is written. Unlike instructions in a prompt, hooks are deterministic: they always run. The course's example validates every generated file against the design system's standards the moment it's written, feeding violations back to the agent and creating a self-correcting loop.
