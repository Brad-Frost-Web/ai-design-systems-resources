---
number: "3.s3.eddie-demo.01"
title: "Eddie: Fixing Modal Focus Trap"
chapter: "Chapter 3"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76656769-eddie-fixing-modal-focus-trap"
notionId: "39d3c9323e8681d69a95d994c042534f"
created: "2026-07-14 18:27:14Z"
presenters:
  - "Brad Frost"
tags:
  - "eddie"
  - "accessibility"
  - "claude"
  - "components"
---
Brad fixes the highest-priority issue from Eddie's inspection: the modal and drawer lack real focus management. After demonstrating the broken keyboard behavior against the W3C's no-keyboard-trap guidance, he has Claude Code run a discovery pass on writing from accessibility experts (Sara Soueidan, Hidde de Vries, Marcy Sutton, Eric Bailey, Scott O'Hara, Heydon Pickering), which lands on "don't build a focus trap — use the platform": migrating from div role="dialog" to the native dialog element with a dialog controller handling initial focus placement and focus return, plus Lit/shadow DOM wrinkles, all verified in Storybook.
