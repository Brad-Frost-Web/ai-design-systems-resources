---
number: "3.docs.01"
title: "Generating documentation from Figma with Company Docs"
chapter: "Chapter 3"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76168184-generating-documentation-from-figma-with-company-docs"
notionId: "39d3c9323e86812b8d8cff5af73c74bc"
created: "2026-07-14 18:27:44Z"
presenters:
  - "TJ Pitre"
tags: []
---
TJ demos generating text area component docs from Figma in Warp using the Generate Docs tool: it pulls the component's 13 variants, annotations, and house-style reference, runs a code parity check against the codebase's text area TypeScript file, and outputs robust markdown with front matter, anatomy, states, token specs, usage guidelines, and accessibility rules. A release command then pushes the docs to both Company Docs (a Supabase vector database) and Mintlify, with Zeroheight also able to consume the markdown.
