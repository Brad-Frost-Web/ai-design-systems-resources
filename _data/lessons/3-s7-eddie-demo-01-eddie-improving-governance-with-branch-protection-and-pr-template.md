---
number: "3.s7.eddie-demo.01"
title: "Eddie: Improving Governance with Branch Protection and PR Template"
chapter: "Chapter 3"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76682204-eddie-improving-governance-with-branch-protection-and-pr-template"
notionId: "39d3c9323e8681398e91f6863e4718dd"
created: "2026-07-14 18:26:32Z"
presenters:
  - "Brad Frost"
tags: []
---
Eddie scored 7/10 on governance and version control, and the inspection flagged two easy fixes: no branch protection on main and no PR template. Brad adds a GitHub branch protection rule requiring a pull request plus passing build, test (unit, Storybook, accessibility), and validation status checks — skipping required approvals since GitFlow routes work through develop — then creates a simple PR template wired to the contributing guidelines, branching model, and code guidelines.
