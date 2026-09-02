---
number: "4.50"
title: "Using Figma MCP to Generate a DS-Powered Login Page"
chapter: "Chapter 4"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/75501133-using-figma-mcp-to-generate-a-ds-powered-login-page"
notionId: "3c23c9323e8681e49f20ef63e0ea6570"
created: "2026-08-20T01:39:00.000Z"
presenters:
  - "TJ Pitre"
tags:
  - "figma"
  - "mcp"
  - "skills"
  - "claude"
  - "southleft"
---
TJ runs the figma-generate-design skill from Claude Code, pointing it at a blank page in the Eventz demo file and asking for a user login form. While it works (close to ten minutes on Opus 4.7 at high effort), he reads through the open-source skill file: front matter, the mandatory pairing with figma-use as the plugin-API workhorse, hard gates that forbid mutating the canvas before component keys, variables, and styles are collected, and the screenshot round trip it uses to check its own work. The result uses real library components — heading, inputs, checkbox, text link, button — bound to real variables with sensibly named layers, and the skill even spots and investigates a stray label background on its own. Recommends far more specific prompts for real work.
