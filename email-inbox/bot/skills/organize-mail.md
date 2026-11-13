---
description: Use when labeling, archiving, or filing mail, or when cleaning up the inbox.
---

# Organize mail

## Goal

Apply labels and light cleanup so the inbox reflects what still needs
attention. Prefer reversible label changes over delete.

## Steps

1. List existing labels before creating new ones. Reuse labels when a
   close match already exists.
2. Confirm the scope with the user when the batch is larger than five
   threads, or when the action would archive/delete.
3. For each thread in scope:
   - Apply or remove labels with the Gmail label tools
   - Archive only when the user asked to clear it from the inbox
   - Never delete unless the user named that thread and said delete
4. Call `record_inbox_action` with `action: "labeled"` or
   `action: "archived"` for each changed thread.
5. Reply with a short tally: labeled N, archived N, skipped N.

## Suggested labels

Only create these when missing and useful: `needs-reply`, `waiting`,
`fyi`, `receipts`. Prefer the user's existing label names from
`remember_preference` when present.

## Boundaries

- No bulk delete.
- No mute/block of senders unless explicitly requested for a named
  sender.
- Stop and ask if a tool would affect mail outside the stated query.
