import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  model: {
    id: "grok-4.7",
    params: [
      { id: "reasoning_effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
  // Gmail tools ride the Cursor account connector; keep hosting open
  // for Google MCP hosts if a remote Gmail connection is added later.
  hosting: {
    egressDomains: [
      "gmailmcp.googleapis.com",
      "gmail.googleapis.com",
      "oauth2.googleapis.com",
      "accounts.google.com",
      "www.googleapis.com",
    ],
  },
});
