import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

type PrefStore = Record<string, string>;

const KEY = "inbox:preferences";

export default defineTool({
  description:
    "Save or update a durable inbox preference (VIP senders, label names, tone, quiet hours).",
  effect: "idempotent",
  inputSchema: z.object({
    key: z
      .string()
      .min(1)
      .max(64)
      .describe("Preference key, e.g. vip_senders or default_tone."),
    value: z
      .string()
      .min(1)
      .max(1000)
      .describe("Preference value as plain text."),
  }),
  async execute({ key, value }, ctx) {
    const store = ((await ctx.host.kv.get(KEY)) as PrefStore | null) ?? {};
    store[key] = value;
    await ctx.host.kv.put(KEY, store);
    return { saved: true, key, value };
  },
});
