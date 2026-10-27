---
number: "4.bf.07"
title: "Fixing the most urgent inspection issues with Declarative Shadow DOM"
chapter: "Chapter 4"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/77342876-bradfrost-com-fixing-the-most-urgent-inspection-issues-with-declarative-shadow-dom"
notionId: "3b93c9323e8681b59770f08ce4b76790"
created: "2026-08-11T00:27:00.000Z"
presenters:
  - "Brad Frost"
tags:
  - "eddie"
  - "code"
  - "accessibility"
  - "claude"
  - "architecture"
---
Brad tackles the work order's top red, the site not fitting on phones, and finds it isn't a CSS bug but a flash of unstyled content: Playwright screenshots before JavaScript renders the web components' styles. Rather than the full architectural overhaul, he asks Claude Code for a quick win and lands declarative shadow DOM via an Eleventy plugin, demonstrating before and after with JavaScript disabled — alerts, buttons, and text fields now render without JS. Has Claude validate the fix through bfw-process at 320 and 375 viewports, close the site and Eddie issues, then file issues to bake declarative shadow DOM into bfw-process and every Eddie boilerplate so all future projects get it for free. Systems thinking in action, and the validation gates are now in place for the adoption work ahead.
