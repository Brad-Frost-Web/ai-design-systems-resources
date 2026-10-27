---
number: "4.xx5"
title: "Add Dark Mode To Soul Patrol Across Platforms With Figma Console MCP, Skills, and Scripts"
chapter: "Chapter 4"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76048298-add-dark-mode-to-soul-patrol-across-platforms-with-figma-console-mcp-skills-and-scripts"
notionId: "3c23c9323e8681468c1fd5fd5bd00f4b"
created: "2026-08-20T01:39:00.000Z"
presenters:
  - "Ian Frost"
tags:
  - "figma console mcp"
  - "design tokens"
  - "skills"
  - "soul patrol"
  - "storybook"
---
Ian ships dark mode for Soul Patrol across Figma, Storybook, and a React Native music app in one prompt, powered by a Theme Orchestrator skill and a create-theme script. The skill already knows the tier one, two, and three token architecture, steers toward muted palettes instead of naive inversions, and audits for WCAG AA before output; the script derives a Soul Patrol Dark preset JSON and builds it through the code pipeline. Storybook's theme switcher and the React Native app pick it up immediately; Figma takes longest, gaining a dark tier one collection and dark modes on tiers two and three, applied after publishing the token library and updating the component file. Notes the demo skipped proper SemVer package publishing, and pitches the same flow for rebrands and multi-platform token distribution.
