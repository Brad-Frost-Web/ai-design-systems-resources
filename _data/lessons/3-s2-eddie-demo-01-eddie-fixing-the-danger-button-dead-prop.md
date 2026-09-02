---
number: "3.s2.eddie-demo.01"
title: "Eddie: Fixing the Danger Button Dead Prop"
chapter: "Chapter 3"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/76655958-eddie-fixing-the-danger-button-dead-prop"
notionId: "39d3c9323e86816c9c58f1d2c0f65c59"
created: "2026-07-14 18:27:14Z"
presenters:
  - "Brad Frost"
tags: []
---
Brad tackles Eddie's biggest Station 2 fix: the ed-button's variant="danger" dead prop, declared in TypeScript but with no styles or Storybook presence — the kind of paper cut that erodes trust in a design system. Using Claude in Warp, he wires up the danger variant with button-specific tier-three tokens that fall back to tier-two semantic error tokens via CSS custom properties, catches Claude improperly reaching for knockout tokens, corrects it to the default error tokens, and files follow-up issues for a strong utility token variant.
