# Refresh ed-code highlighting when dynamic content changes

Draft for Brad-Frost-Web/eddie-design-system; publication awaits user approval.

In AI & Design Systems Resources' design/13-chameleon-resources demo, `<ed-code language="json">` displays an old request after Lit updates its text content for a subsequent live response. The installed Eddie 0.60 implementation captures `_rawCode` only in connectedCallback; the refreshed light-DOM text and highlighted shadow-DOM snippet disagree.

Expected: changing code content updates the visible highlighted snippet and its accessible representation. Add a supported reactive content API or observe content changes, with coverage for successive API responses.

Consumer workaround: key the existing ed-code element by the current spec so each response mounts a fresh instance. No component fork. Both run evidence and A2UI messages use this workaround.

Found while verifying real Claude/Jev activity; stale receipts undermine that proof. Consumer tracking: Brad-Frost-Web/ai-design-systems-resources#13. Prepared from chat.
