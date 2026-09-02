---
number: "3.xx8"
title: "Installing Story UI into Soul Patrol Design System"
chapter: "Chapter 3"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/75130758-installing-story-ui-into-soul-patrol-design-system"
notionId: "3663c9323e86818daafac762d0df0d31"
created: "2026-05-20T16:35:00.000Z"
presenters:
  - "Brad Frost"
tags:
  - "storybook"
  - "soul patrol"
  - "tools"
  - "claude"
---
Brad installs Story UI into Soul Patrol's web components package, where Storybook actually lives. Runs the install and init wizard, which detects a Vite web component Storybook with 58 stories, auto-configures the components path, and asks for the generated-stories location, MCP port, AI provider (Claude), and an API key. Reviews the resulting storyui.config.js, then hits a syntax error the wizard introduced in Storybook's main.ts, fixes the missing and stray commas, and gets Storybook running with the Story UI generator panel visible.
