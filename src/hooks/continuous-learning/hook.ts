import type { PluginInput } from "@opencode-ai/plugin";
import { log } from "../../shared/logger";
import { HOOK_NAME } from "./hook-name";
import {
  readLearningState,
  updateContext,
} from "../../features/learning-persistence";

interface ToolExecuteAfterInput {
  tool: string;
  sessionID: string;
  callID: string;
}

interface ToolExecuteAfterOutput {
  title: string;
  output: string;
  metadata: unknown;
}

export function createContinuousLearningHook(ctx: PluginInput) {
  return {
    "tool.execute.after": async (
      input: ToolExecuteAfterInput,
      output: ToolExecuteAfterOutput
    ) => {
      const { tool, sessionID } = input;
      log(`[${HOOK_NAME}] tool.execute.after`, { tool, sessionID });
      const state = readLearningState(ctx.directory);
      const toolUsage = (state?.context.toolUsage as Record<string, number>) || {};
      toolUsage[tool] = (toolUsage[tool] || 0) + 1;
      updateContext(ctx.directory, "toolUsage", toolUsage);
    },
    "experimental.chat.messages.transform": async (
      input: Record<string, never>,
      output: { messages: Array<{ info: unknown; parts: Array<{ type: string; text?: string }> }> }
    ) => {
      log(`[${HOOK_NAME}] experimental.chat.messages.transform`);

      const state = readLearningState(ctx.directory);
      const toolUsage = state?.context.toolUsage as Record<string, number> | undefined;
      if (toolUsage && Object.keys(toolUsage).length > 0) {
        const toolUsageText = Object.entries(toolUsage)
          .map(([tool, count]) => `- ${tool}: ${count}`)
          .join("\n");
        const textPart = {
          type: "text",
          text: `\n---\n## Learned Patterns\n### Tool Usage:\n${toolUsageText}\n---\n`,
        };
        if (output.messages.length > 0) {
          output.messages[output.messages.length - 1].parts.push(textPart);
        }
      }
    },
  };
}
