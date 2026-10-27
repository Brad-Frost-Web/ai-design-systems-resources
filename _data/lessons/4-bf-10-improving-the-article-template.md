---
number: "4.bf.10"
title: "Improving the article template"
chapter: "Chapter 4"
url: "https://courses.bradfrost.com/courses/take/ai-design-systems-course/lessons/77342989-bradfrost-com-improving-the-article-template"
notionId: "3b93c9323e86815fb6f2c6fb7a0ffb00"
created: "2026-08-11T00:27:00.000Z"
presenters:
  - "Brad Frost"
tags:
  - "eddie"
  - "components"
  - "claude"
  - "code"
---
Brad overrides the adoption plan's wave two, arguing from years of publisher work that the article page is the star of the show, and reprioritizes it ahead of the listing pages. Specifies the page header component for title and byline, the large text passage variant for legibility, hardening of embeds (YouTube, SoundCloud, SlideShare, Spotify, CodePen, figures) and old HTTP references, and Eddie tags in place of blue hyperlinks. Claude crawls the archive, defines done as the Atomic Design post and other embed-heavy posts rendering correctly under a verify script, and delivers a far more legible article — shown as a progression from the broken WordPress render to now. Tags surface a real Eddie gap: the tag component only knows dismissible chips, not links.
