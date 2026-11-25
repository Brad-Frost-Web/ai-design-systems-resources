---
term: "Evals"
aliases:
  - "Evaluations"
  - "AI Evals"
  - "LLM as a Judge"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons:
  - number: "3.testing.00"
    chapter: "Chapter 3"
    title: "Deterministic and Agentic Testing with FigmaLint"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76603751-deterministic-and-agentic-testing-with-figmalint"
  - number: "3.testing.01"
    chapter: "Chapter 3"
    title: "Evals Testing"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76603841-evals-testing"
references:
  - label: "Anthropic — Demystifying evals for AI agents"
    url: "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents"
tags:
  - "ai"
  - "quality"
  - "testing"
---

Repeatable tests that score AI output against a standard, so you know whether your setup works instead of judging it by feel. The course pairs deterministic pass/fail checks (does it use real components and tokens?) with an LLM acting as a judge for subjective scoring on top. Jam sessions have pushed the idea into tiers: scripted checks, adherence to the system's rules, and human judgment of taste, which an AI alone can't be trusted to grade.
