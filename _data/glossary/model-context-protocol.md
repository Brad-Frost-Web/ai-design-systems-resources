---
term: "Model Context Protocol"
aliases:
  - "MCPs"
  - "MCP"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons:
  - number: "1.08"
    chapter: "Chapter 1"
    title: "A Brief History of AI"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74925327-a-brief-history-of-ai"
  - number: "1.10"
    chapter: "Chapter 1"
    title: "LLM Demo"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74964390-llms-in-action"
  - number: "1.32"
    chapter: "Chapter 1"
    title: "MCPs"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74427610-mcps"
  - number: "1.33"
    chapter: "Chapter 1"
    title: "Why MCPs Matter"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74427618-why-mcps-matter"
  - number: "1.35"
    chapter: "Chapter 1"
    title: "How It All Connects"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74427654-how-it-all-connects"
  - number: "1.36"
    chapter: "Chapter 1"
    title: "AI Tools Recap"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74427656-ai-tools-recap"
tags:
  - "ai"
  - "tooling"
  - "mcp"
---

A standard way to connect AI tools to external data and services, originally invented by Anthropic (Claude was one of the first models to use it). The course's favorite analogy is that an MCP is 'like a USB port' — a universal interface for AI integrations — with APIs as a looser analogy. The AI communicates with a connected application through the MCP: when the AI asks the connected platform to do something (e.g. update a variable), the MCP may have a tool for it or bridge to the platform's API, and the result or an error comes back to the AI. The course leans on MCPs heavily, with examples including the Slack, Figma (the big one), Google Drive, and GitHub MCPs.
