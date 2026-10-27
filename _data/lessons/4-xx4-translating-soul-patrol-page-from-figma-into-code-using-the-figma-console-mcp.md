---
number: "4.xx4"
title: "Translating Soul Patrol Page from Figma into Code Using the Figma Console MCP"
chapter: "Chapter 4"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/75818496-translating-soul-patrol-page-from-figma-into-code-using-the-figma-console-mcp"
notionId: "3c23c9323e8681bb80c7d4ebee191240"
created: "2026-08-20T01:39:00.000Z"
presenters:
  - "Ian Frost"
tags:
  - "figma console mcp"
  - "storybook"
  - "code"
  - "soul patrol"
  - "claude"
---
Ian translates the design-approved Soul Patrol donate page from Figma into code with Figma Console MCP, passing a link to the Figma selection for context and leaning on component, recipe, and token docs the MCP had written earlier. Explains why not Story UI here: the design already exists and has been reviewed, so translating the actual Figma nodes keeps design and development aligned. Claude scaffolds donate.ts, an SCSS file, and a stories file; after a Storybook restart the page matches Figma, using the site header recipe, band, buttons, and the title-large heading, with responsive behavior inherited from the components. Under five minutes versus the copy-paste-from-Storybook manual path, with a full-width button prop as the only obvious tweak.
