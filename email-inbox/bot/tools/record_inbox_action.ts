import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

type InboxActionLog = {
  actions: Array<{
    threadId: string;
    action: string;
    note?: string;
    at: string;
  }>;
};

const KEY = "inbox:actions";

export default defineTool({
  description:
    "Record that a Gmail thread was triaged, drafted, labeled, archived, or skipped so later turns can avoid duplicates.",
  effect: "idempotent",
  inputSchema: z.object({
    threadId: z.string().min(1).describe("Gmail thread id."),
    action: z
      .enum(["triaged", "drafted", "labeled", "archived", "skipped", "sent"])
      .describe("What you did for this thread."),
    note: z
      .string()
      .max(240)
      .optional()
      .describe("Short note such as bucket or label names."),
  }),
  async execute({ threadId, action, note }, ctx) {
    const existing =
      ((await ctx.host.kv.get(KEY)) as InboxActionLog | null) ?? {
        actions: [],
      };
    const entry = {
      threadId,
      action,
      note,
      at: new Date().toISOString(),
    };
    const withoutDup = existing.actions.filter(
      (a) => !(a.threadId === threadId && a.action === action),
    );
    withoutDup.push(entry);
    const actions = withoutDup.slice(-200);
    await ctx.host.kv.put(KEY, { actions });
    return { recorded: true, threadId, action, total: actions.length };
  },
});
