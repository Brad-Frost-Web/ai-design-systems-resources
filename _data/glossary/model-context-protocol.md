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
    url: "https://app.notion.com/p/3563c9323e8681db8393e822e6b02667"
  - number: "1.10"
    chapter: "Chapter 1"
    title: "LLM Demo"
    url: "https://app.notion.com/p/3573c9323e8681428d74d0461a7c31b1"
  - number: "1.32"
    chapter: "Chapter 1"
    title: "MCPs"
    url: "https://app.notion.com/p/34a3c9323e8681f78c7ddb47643b968a"
  - number: "1.33"
    chapter: "Chapter 1"
    title: "Why MCPs Matter"
    url: "https://app.notion.com/p/34a3c9323e8681ea86d3d176c3794dc2"
  - number: "1.35"
    chapter: "Chapter 1"
    title: "How It All Connects"
    url: "https://app.notion.com/p/34a3c9323e8681e5a811f6aa16ad5fd7"
  - number: "1.36"
    chapter: "Chapter 1"
    title: "AI Tools Recap"
    url: "https://app.notion.com/p/34a3c9323e8681af8285de6af3470c11"
tags:
  - "ai"
  - "tooling"
  - "mcp"
---

A standard way to connect AI tools to external data and services, originally invented by Anthropic (Claude was one of the first models to use it). The course's favorite analogy is that an MCP is 'like a USB port' — a universal interface for AI integrations — with APIs as a looser analogy. The AI communicates with a connected application through the MCP: when the AI asks the connected platform to do something (e.g. update a variable), the MCP may have a tool for it or bridge to the platform's API, and the result or an error comes back to the AI. The course leans on MCPs heavily, with examples including the Slack, Figma (the big one), Google Drive, and GitHub MCPs.
