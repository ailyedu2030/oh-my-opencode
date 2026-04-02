import type { PluginInput } from "@opencode-ai/plugin";
import { log } from "../../shared/logger";

export interface SessionContextData {
  sessionId: string;
  startTime: number;
  fileOperations: number;
  agentSwitches: number;
  toolsUsed: Set<string>;
  errors: number;
}

const HOOK_NAME = "sessionContextTracker";
const sessionContexts = new Map<string, SessionContextData>();

export function createSessionContextTrackerHook(ctx: PluginInput) {
  return {
    name: HOOK_NAME,
    hooks: {
      "session.created": async (params: { sessionId: string }) => {
        const { sessionId } = params;
        sessionContexts.set(sessionId, {
          sessionId,
          startTime: Date.now(),
          fileOperations: 0,
          agentSwitches: 0,
          toolsUsed: new Set(),
          errors: 0,
        });
        log(`[${HOOK_NAME}] Session context initialized`, { sessionId });
      },
      "tool.execute.after": async (params: { sessionId: string; tool?: string }) => {
        const { sessionId, tool } = params;
        const context = sessionContexts.get(sessionId);
        if (context && tool) {
          context.toolsUsed.add(tool);
          if (["write", "edit", "multiedit", "delete"].includes(tool)) {
            context.fileOperations++;
          }
        }
      },
      "session.error": async (params: { sessionId: string }) => {
        const { sessionId } = params;
        const context = sessionContexts.get(sessionId);
        if (context) {
          context.errors++;
        }
      },
      "session.deleted": async (params: { sessionId: string }) => {
        const { sessionId } = params;
        sessionContexts.delete(sessionId);
        log(`[${HOOK_NAME}] Session context cleaned up`, { sessionId });
      },
    },
  };
}

export function getSessionContext(sessionId: string): SessionContextData | undefined {
  return sessionContexts.get(sessionId);
}

export function getAllSessionContexts(): SessionContextData[] {
  return Array.from(sessionContexts.values());
}
