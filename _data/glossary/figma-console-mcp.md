---
term: "Figma Console MCP"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons:
  - number: "1.10"
    chapter: "Chapter 1"
    title: "LLM Demo"
    url: "https://app.notion.com/p/3573c9323e8681428d74d0461a7c31b1"
  - number: "1.10 Appendix"
    chapter: "Chapter 1"
    title: "Appendix: Full LLM Demo"
    url: "https://app.notion.com/p/3573c9323e86815eb28ec654ed61fb81"
  - number: "3.xx4"
    chapter: "Chapter 3"
    title: "Soul Patrol Figma Console MCP Setup"
    url: "https://app.notion.com/p/3663c9323e868111bb6ee818641ca8c2"
  - number: "3.xx5"
    chapter: "Chapter 3"
    title: "Figma Console MCP Assess and Synchronize"
    url: "https://app.notion.com/p/3663c9323e8681bc9b98f125e0a90c8b"
  - number: "3.xx6"
    chapter: "Chapter 3"
    title: "Using the Figma Console MCP to make changes"
    url: "https://app.notion.com/p/3663c9323e86817e9a55e71bfb3df9fc"
tags:
  - "ai"
  - "figma"
  - "tooling"
  - "mcp"
---

An MCP (installed via an npx local-get setup plus a Figma desktop bridge plugin and a personal access token) that, like the Figma MCP, sits in the seam between design and code. The course uses it to run a cross-check audit of a component in both Figma and code at once, flagging misalignments such as styles that never reach the input, inconsistent variant property sets, missing focus rings, and wrong selectors, separating critical blockers from minor cleanup. Beyond auditing, it can make changes in both places, fixing code and adding missing variants in the Figma file in the same run, and its findings can be turned into GitHub issues or Jira tickets to catch problems upstream before publishing the library.
