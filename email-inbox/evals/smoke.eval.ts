import { defineEval } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  description: "Saves an inbox preference through the remember_preference tool.",
  async test(t) {
    await t.send(
      'Save my inbox preference key "default_tone" to "concise and friendly" using the remember_preference tool. Do not touch Gmail.',
    );
    t.succeeded();
    t.calledTool("remember_preference", {
      input: {
        key: "default_tone",
        value: "concise and friendly",
      },
    });
  },
});
