---
number: "2.71"
title: "Publish repository to GitHub"
chapter: "Chapter 2"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/75162818-publishing-respository-to-github"
notionId: "3663c9323e8681d6a58cfc2d3f4adc72"
created: "2026-05-20T16:30:00.000Z"
presenters:
  - "Brad Frost"
tags:
  - "code"
  - "claude"
  - "agents"
  - "workflow"
---
Brad publishes the repository to GitHub the agentic way. Instead of clicking New repository on github.com, he opens Claude Code in the project directory and asks it to create a repo in the Brad Frost Web organization and push the code. Claude drives GitHub CLI: checks gh auth status, asks for a name and public/private, then creates and pushes github.com/bradfrostweb/learning-git in seconds. An agent writing commands against the CLI, on his behalf, in his account.
