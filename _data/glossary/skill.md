---
term: "Skill"
aliases:
  - "skills"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons:
  - number: "1.34"
    chapter: "Chapter 1"
    title: "Skills"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74427623-skills"
  - number: "1.35"
    chapter: "Chapter 1"
    title: "How It All Connects"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74427654-how-it-all-connects"
  - number: "1.36"
    chapter: "Chapter 1"
    title: "AI Tools Recap"
    url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/74427656-ai-tools-recap"
references:
  - label: "Agent Skills specification"
    url: "https://agentskills.io/specification"
tags:
  - "ai"
  - "tooling"
  - "skills"
---

A reusable instruction set that teaches an AI how to do a specific, repeatable task, encoding best practices, templates, and domain expertise. A skill is usually a markdown file, sometimes paired with Python or JavaScript tools depending on its purpose. The course's example is a 'create a proposal' skill that knows your brand, colors, format, and tone. The thesis: skills turn general-purpose AI into a specialized collaborator, especially valuable for menial, repetitive, or tedious work. Skills have since become an open format supported across many agent tools, not just Claude. They load by progressive disclosure: an agent sees only each skill's name and summary until a task calls for the full instructions, which keeps the context window lean.
