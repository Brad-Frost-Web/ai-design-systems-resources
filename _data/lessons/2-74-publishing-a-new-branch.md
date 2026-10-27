---
number: "2.74"
title: "Publishing A New Branch"
chapter: "Chapter 2"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/75162832-publishing-a-new-branch"
notionId: "3663c9323e868101a524f1c4608e2884"
created: "2026-05-20T16:30:00.000Z"
presenters:
  - "Brad Frost"
tags:
  - "code"
  - "workflow"
  - "governance"
---
Brad hits Publish branch in GitHub Desktop and hits a wall he decides to keep in: the evil-twin account has no write access to a repo owned by his main organization — a good thing, since random accounts shouldn't be able to push to company codebases. Fixes it the legitimate way, adding the twin as a collaborator under Settings, then publishes successfully and shows both branches on GitHub. Explains feature branches as the mechanism for unlimited experiments while main stays stable, merged only when reviewed and ready.
