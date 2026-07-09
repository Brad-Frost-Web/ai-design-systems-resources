---
term: "Figma Console MCP"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons:
  - number: "1.10"
    chapter: "Chapter 1"
    title: "LLM Demo"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74964390-llms-in-action"
  - number: "1.10 Appendix"
    chapter: "Chapter 1"
    title: "Appendix: Full LLM Demo"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74966906-llms-in-action-full-session"
  - number: "3.xx4"
    chapter: "Chapter 3"
    title: "Soul Patrol Figma Console MCP Setup"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74979165-figma-console-mcp-install-into-claude-code"
  - number: "3.xx5"
    chapter: "Chapter 3"
    title: "Figma Console MCP Assess and Synchronize"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74979195-figma-console-mcp-assessing-component-synchronization-in-design-and-code"
  - number: "3.xx6"
    chapter: "Chapter 3"
    title: "Using the Figma Console MCP to make changes"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74979217-figma-console-mcp-bidirectional-figma-and-code-component-changes-from-assessment"
tags:
  - "ai"
  - "figma"
  - "tooling"
  - "mcp"
---

An MCP (installed via an npx local-get setup plus a Figma desktop bridge plugin and a personal access token) that, like the Figma MCP, sits in the seam between design and code. The course uses it to run a cross-check audit of a component in both Figma and code at once, flagging misalignments such as styles that never reach the input, inconsistent variant property sets, missing focus rings, and wrong selectors, separating critical blockers from minor cleanup. Beyond auditing, it can make changes in both places, fixing code and adding missing variants in the Figma file in the same run, and its findings can be turned into GitHub issues or Jira tickets to catch problems upstream before publishing the library.
