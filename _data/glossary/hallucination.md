---
term: "Hallucination"
aliases:
  - "Hallucinations"
  - "hallucinating"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons:
  - number: "1.13"
    chapter: "Chapter 1"
    title: "What's Hard About AI"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/75002391-what-s-hard-about-ai"
  - number: "1.25"
    chapter: "Chapter 1"
    title: "What Are LLMs and How Do They Work?"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74426931-what-are-llms-and-how-do-they-work"
  - number: "1.26"
    chapter: "Chapter 1"
    title: "What LLMs Are Not"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74426993-what-llms-are-not"
  - number: "1.33"
    chapter: "Chapter 1"
    title: "Why MCPs Matter"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74427618-why-mcps-matter"
  - number: "4.bf.06"
    chapter: "Chapter 4"
    title: "Keeping Product On The Eddie Rails: Multi-Phase bfw-process, Settings, Rules, & Validation"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/77065460-bradfrost-com-keeping-product-on-the-eddie-rails-multi-phase-bfw-process-settings-rules-validation"
tags:
  - "ai"
  - "llm"
---

When an LLM confidently produces incorrect information and states it as if it were true — the course's example is an LLM insisting that 'strawberry' has only two R's. The risk of hallucination rises during longer, multi-step interactions, and the course notes it is one reason live data access (such as via MCPs) matters: a steady, real-time connection to a platform lowers the chance of hallucination. Later chapters teach a fuller stack of countermeasures: rule files like AGENTS.md, a mandatory lookup before generating, a knowledge graph of what actually exists, validation hooks, and CI gates. See Tool-Gating and Self-Healing Loop.
