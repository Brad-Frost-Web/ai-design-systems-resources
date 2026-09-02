---
term: "llms.txt"
aliases:
  - "llms.txt file"
  - "llms-full.txt"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons: []
status: "in-progress"
tags:
  - "ai"
  - "design systems"
  - "documentation"
---
A plain-text file published at the root of a site (like robots.txt, but for language models) that gives AI agents a curated, machine-readable map of the documentation. Rather than making an agent crawl and guess at a docs site built for humans, llms.txt hands it an organized index of what exists and where to find it. Mature design systems publish several narrower slices (components, styling, theming, migration) alongside a full dump, so agents with limited context can pull only what they need. The strongest implementations generate this file automatically on every release rather than maintaining it by hand, because hand-written agent documentation goes stale the moment the system changes.
