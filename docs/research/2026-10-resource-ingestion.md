# Why Slack resource ingestion stopped

Investigated October 27, 2026. This is an incident finding and a proposed replacement, not a deployed ingestion service. September–October Slack coverage remains unverified; no private-channel backfill was performed during this investigation.

## Verified findings

The Slack importer was a **Claude Cowork scheduled task**, `sync-slack-to-resources`, configured for 8 a.m. and 4 p.m. Its local registry still says `enabled: true`, but the last recorded run started **September 2 at 12:09:16 UTC** (8:09 a.m. Eastern). An enabled flag is not evidence of a healthy schedule.

| Evidence | Finding |
| --- | --- |
| [August 31 resource commit](https://github.com/Brad-Frost-Web/ai-design-systems-resources/commit/ef7e551d476915573065b8fd5e360df9e88730a8) | Last successful Slack resource import found in repository history; newest Slack resource date is August 30. |
| September 1 afternoon Cowork audit | Git push failed because the shell had no HTTPS GitHub credentials. The fallback GitHub MCP action required approval and was denied after approximately 30 minutes. |
| September 2 Cowork audit, session `local_827244e3-e4d5-4800-8cb5-9c51e7864013` | Same authentication failure. A GitHub MCP permission request at 12:10:37 UTC was denied at 12:40:41 UTC. |
| Cowork scheduled-task registry | September 2 is the last recorded run. Its preapproved GitHub tool identifier differs from the GitHub tool requested by that run. |
| [bf-brain automation registry](https://github.com/Brad-Frost-Web/bf-brain/blob/main/src/data/automations.json) | No registration for `sync-slack-to-resources`; bf-brain could not monitor this task's missing runs. |
| [October 27 Notion sync run](https://github.com/Brad-Frost-Web/ai-design-systems-resources/actions/runs/40502566066) | A separate importer failed to push its rolling branch with `stale info`. That workflow reads Notion; repairing it does not recover missing Slack links. |

The decisive error in the September 2 audit was:

```text
fatal: could not read Username for 'https://github.com': No such device or address
```

The audit then records an attempted fallback through a GitHub MCP connector, followed by a denied permission response. This made an unattended process depend on an interactive approval.

**Account suspension is not a proven cause of the first failure.** The logs establish the authentication/approval failure and the absence of later recorded runs. They do not establish why scheduling stopped after September 2 or when the suspension began. The task depended on an available Cowork account, so it was vulnerable to that interruption regardless.

Local evidence came from Claude's `local-agent-mode-sessions` scheduled-task registry, September 1–2 `audit.jsonl` files, and an archived task `SKILL.md`. The configured skill path is now absent; that does not establish that it was absent when the task last ran. Historical instructions were treated as evidence, not authorization to execute them.

## Why simply restarting the task is insufficient

The recovered prompt described a conversational agent that cloned this repository, read Slack, fetched titles, generated tags and summaries, pushed directly to `main`, and created Notion records.

- **The checkpoint was the newest filename across all resources.** It was not a Slack-specific successful-coverage cursor. Restarting against the current October 19 resource could skip September and early October messages.
- **Required capture depended on model execution and connector approval.** GitHub authentication failure stopped persistence; AI enrichment was part of the same sequence.
- **Git and Notion were separate writes.** September 1 records show repairs for missing Notion copies and already-duplicated resources. There was no single durable transaction across destinations.
- **There was no registered health receipt.** Neither an enabled task nor the newest resource date proves every Slack page was checked successfully.

The local design branch now distinguishes Notion freshness from unverified Slack coverage. Its Notion workflow lease repair is also local; neither change restores the missing Slack data.

## Proposed owned replacement

Use a deterministic worker with owned credentials and scheduling. **bf-brain should own registration, checkpoints, run receipts, and health monitoring. Resource content should remain in this resources repository.** bf-brain's data-placement policy makes it the control system, not a second CMS.

Existing infrastructure to extend:

- [Direct Slack link collection](https://github.com/Brad-Frost-Web/bf-brain/blob/main/src/agents/impl/newsletter-producer/loaders/slack-links.ts) uses Slack's API without a model and accepts an explicit channel allowlist.
- Existing `infra/launchd/` jobs and secret-loading scripts provide an owned scheduling pattern.
- [Scheduled liveness monitoring](https://github.com/Brad-Frost-Web/bf-brain/blob/main/src/agents/impl/health-commander/scheduled-liveness.ts) distinguishes alive, missing, unknown, and paused tasks. Register the worker and its actual run evidence there.

**Do not reuse the current Slack adapter unchanged.** It fetches a single history page of up to 200 messages, does not traverse replies, and returns an empty array for Slack API errors. Those behaviors can turn incomplete coverage into apparent success. The replacement needs full pagination, reply coverage, and explicit failures. Slack documents pagination for [history](https://docs.slack.dev/reference/methods/conversations.history/) and [replies](https://docs.slack.dev/reference/methods/conversations.replies/); verify the chosen app/token's access to both before enabling the job.

### Collection and persistence

1. Configure approved channel IDs and least-privilege Slack/GitHub credentials through the existing secret store. Validate access before scheduling. Never fall back to an interactive connector.
2. Read the complete requested window, including relevant thread replies. Retry rate limits using server guidance. Authentication, missing access, and pagination errors fail the run visibly.
3. Persist links and stable source identifiers in a durable private queue. Maintain a per-channel successful-coverage cursor; advance it only after the full window is fetched and persisted. Use overlap and deterministic deduplication. Explicitly cover new replies to older threads rather than assuming a recent parent-message window includes them.
4. Validate public metadata, preserve editorial overrides, and publish through the repository's reviewed contribution process. Track publication separately from capture so a GitHub outage leaves candidates queued. Do not push directly to `main` or merge this design branch into integration.
5. Make model summaries and suggested tags optional enrichment. Collection must work with no Claude, Jev, or other AI account. Failed enrichment is retryable and never blocks saving the URL.

Private Slack messages, identities, and conversation summaries should not be copied into this public repository by default. Establish approved publication fields and keep private provenance in the owned queue. No new Notion dual-write is needed; any change to Notion's existing editorial role requires an explicit decision.

### Coverage and operations

Each run should record start/end times, source coverage boundaries, pages/messages inspected, URLs found, accepted/duplicate/skipped counts, pending publication count, errors, and the last successful cursor. Zero results is valid only if the source was successfully checked.

Derive the website's Slack coverage from this receipt, never the newest resource date. Route missed schedules and failures through the existing health monitor and notification policy.

An owned `launchd` job still depends on its host being awake and connected. Use an always-on owned host if collection must continue during travel or laptop sleep. Ownership removes the conversational-account dependency; host and upstream API monitoring still matter.

## Migration and acceptance

1. Register the implementation and evidence path in bf-brain, retaining this incident as context. This investigation did not file a new bf-brain issue.
2. Implement durable capture, per-source cursors, explicit errors, and publication retry before connecting enrichment.
3. After private-channel access is authorized, backfill from August 30 with overlap through the present. Do not start at October 19. Reconcile source coverage and deduplicated links before declaring the collection current.
4. Verify the cases below, then enable the owned schedule and retire the Cowork task after reconciliation.

Acceptance checks:

- More than 200 messages and multiple pages are fully collected.
- Links in replies, including new replies to older threads, are covered.
- Rate limits retry; invalid authentication or incomplete pagination never advances coverage.
- Repeated windows create no duplicates; editorial metadata survives.
- GitHub publication failure leaves recoverable candidates and visible pending/error status.
- Collection succeeds with all model credentials absent.
- Missed runs and expired credentials produce health findings; zero links differs from a failed read.
- Website coverage matches a completed receipt; publication progress is reported separately.

**Current status:** investigation complete; replacement, private-channel backfill, scheduler changes, and production deployment have not been performed.
