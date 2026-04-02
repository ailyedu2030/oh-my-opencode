import type { PluginInput } from "@opencode-ai/plugin"
import { log } from "../../shared/logger"
import { addSessionEntry, readLearningState, updateSessionEntry } from "../../features/learning-persistence"
import { HOOK_NAME } from "./hook-name"

export function createLearningPersistenceHook(ctx: PluginInput) {
  return async ({ event }: { event: { type: string; properties?: unknown } }) => {
    const props = event.properties as Record<string, unknown> | undefined

    if (event.type === "session.created") {
      const sessionID = props?.sessionID as string | undefined
      if (!sessionID) return

      log(`[${HOOK_NAME}] session.created`, { sessionID })
      addSessionEntry(ctx.directory, {
        sessionId: sessionID,
        startedAt: new Date().toISOString(),
      })
      return
    }

    if (event.type === "session.idle") {
      const sessionID = props?.sessionID as string | undefined
      if (!sessionID) return

      log(`[${HOOK_NAME}] session.idle`, { sessionID })
      updateSessionEntry(ctx.directory, sessionID, {
        endedAt: new Date().toISOString(),
      })
      return
    }

    if (event.type === "session.deleted") {
      const sessionInfo = props?.info as { id?: string } | undefined
      if (sessionInfo?.id) {
        log(`[${HOOK_NAME}] session.deleted`, { sessionID: sessionInfo.id })
        updateSessionEntry(ctx.directory, sessionInfo.id, {
          endedAt: new Date().toISOString(),
        })
      }
      return
    }
  }
}
