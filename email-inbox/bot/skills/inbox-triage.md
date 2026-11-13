---
description: Use when scanning the inbox, summarizing unread mail, or deciding what needs a reply today.
---

# Inbox triage

## Goal

Produce a short triage list: what needs a reply, what can wait, and what
to archive or label. Do not send mail during triage.

## Steps

1. Search recent mail that still needs eyes. Prefer queries like:
   - `in:inbox is:unread newer_than:7d -category:promotions -category:social`
   - `in:inbox newer_than:14d` when the user asks for a broader pass
2. For each promising thread, fetch the thread. Note From, Subject, Date,
   labels, and whether the last message is from the user.
3. Skip threads already recorded by `record_inbox_action` in this session
   unless the user asks to revisit them.
4. Classify each thread into exactly one bucket:
   - **needs_reply** — someone else wrote last and a response is owed
   - **fyi** — useful context, no reply needed
   - **noise** — promo, social, receipt, or automated notice
   - **waiting** — user already replied; ball is in their court
5. For `needs_reply`, one line on why it matters and a suggested next
   step (reply, schedule, forward, or defer).
6. Call `record_inbox_action` with `action: "triaged"` for each thread
   you classified.
7. Reply with three short sections: Needs reply, FYI, Noise/waiting.
   Cap each section at five items unless the user asks for more.

## Boundaries

- Do not create drafts during triage unless the user asked for drafts.
- Do not apply labels during triage unless the user asked to organize.
- Never invent senders, subjects, or thread ids.
