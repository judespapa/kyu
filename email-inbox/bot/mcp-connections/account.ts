import { defineConnection } from "@grok/agent-sdk/connections";

// Forwards Cursor-account connectors (install the Gmail plugin, then
// connect it under Deployed Agents / MCP). optional so local validate
// and smoke evals still run before Gmail is linked.
export default defineConnection({
  cursorAccount: true,
  servers: ["gmail", "Gmail"],
  advertiseTools: true,
  optional: true,
});
