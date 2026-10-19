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

Repeatable tests that score AI output against a standard, so you know whether your setup works instead of judging it by feel. The course layers them: deterministic pass/fail checks first (does it use real components and tokens?), then adherence to the system's rules, then human judgment of taste. An LLM can act as a judge for subjective scoring on top of the hard checks, but using AI alone to judge taste risks slop judging slop.
