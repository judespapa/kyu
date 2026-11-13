import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

type PrefStore = Record<string, string>;

const KEY = "inbox:preferences";

export default defineTool({
  description: "Read saved inbox preferences.",
  effect: "read",
  inputSchema: z.object({}),
  async execute(_input, ctx) {
    const store = ((await ctx.host.kv.get(KEY)) as PrefStore | null) ?? {};
    return { preferences: store };
  },
});
