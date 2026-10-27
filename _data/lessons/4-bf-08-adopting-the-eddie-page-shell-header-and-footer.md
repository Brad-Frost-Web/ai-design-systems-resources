---
number: "4.bf.08"
title: "Adopting the Eddie page shell, header, and footer"
chapter: "Chapter 4"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/77342916-bradfrost-com-adopting-the-eddie-page-shell-header-and-footer"
notionId: "3b93c9323e86813f8b41eeec85eeb470"
created: "2026-08-11T00:27:00.000Z"
presenters:
  - "Brad Frost"
tags:
  - "eddie"
  - "components"
  - "claude"
  - "code"
---
Brad starts full Eddie adoption from the outside in with the page shell. Shows Eddie's existing page templates (article, dashboard, form, grid, homepage), then asks Claude Code to adopt the page shell, header, footer, and main while preserving the current positioning. The browser-default nav links become the Eddie primary navigation and header; a second pass rebuilds the footer from sections, a three-up card grid for courses, the newsletter form, link lists, and a media block for the Carbon ad. The process surfaces a link-list rendering bug, filed automatically against Eddie, and a plan to turn the JavaScript-injected Carbon ad into its own recipe. With the shell systematized, the guts of the pages are next.
