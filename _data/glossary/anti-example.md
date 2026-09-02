---
term: "Anti-example"
aliases:
  - "Allowlist with anti-examples"
  - "Naming your hallucinations"
source:
  type: "course"
  name: "AI & Design Systems Course"
lessons: []
status: "in-progress"
tags:
  - "ai"
  - "design systems"
  - "example"
---
Explicitly listing the components a model keeps inventing that do not exist in your system, alongside the list of the ones that do. Models trained on the whole internet have absorbed thousands of component libraries, so they reach for generic names like Box, Stack, Container, and Heading whether or not you have them. Naming those fabrications out loud is remarkably effective and takes about twenty minutes to implement. It also demonstrates a broader principle: negative, imperative framing ("NEVER use this") survives model summarization far better than preference language ("prefer this other thing"), so the guidance most likely to be ignored is the politely worded kind.
