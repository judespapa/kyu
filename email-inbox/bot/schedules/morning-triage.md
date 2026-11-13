---
cron: "0 16 * * 1-5"
---

Run weekday morning inbox triage for the connected Gmail account.

Load the `inbox-triage` skill. Search unread and recent inbox mail from
the last 7 days, excluding promotions and social when the tools allow.
Produce a short Needs reply / FYI / Noise summary. Do not send mail.
Do not create drafts unless a thread is clearly urgent and a draft
would help; if you draft, say so. Call `record_inbox_action` for each
thread you classify. If Gmail tools are unavailable, reply that the
Gmail connector must be connected in Cursor and stop.
