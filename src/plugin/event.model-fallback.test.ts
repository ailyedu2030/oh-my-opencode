/// <reference types="bun-types" />
import { afterEach, beforeEach, describe, expect, test, spyOn } from "bun:test"

import { createEventHandler } from "./event"
import { createChatMessageHandler } from "./chat-message"
import { _resetForTesting, setMainSession } from "../features/claude-code-session-state"
import { createModelFallbackHook, clearPendingModelFallback } from "../hooks/model-fallback/hook"
import * as connectedProvidersCache from "../shared/connected-providers-cache"

type EventInput = Parameters<ReturnType<typeof createEventHandler>>[0]

describe("createEventHandler - model fallback", () => {
  let cacheSpy: { mockRestore: () => void } | undefined

  beforeEach(() => {
    cacheSpy?.mockRestore?.()
    cacheSpy = spyOn(connectedProvidersCache, "readConnectedProvidersCache").mockReturnValue([
      "anthropic",
      "github-copilot",
      "opencode",
    ]) as any
  })
  const createHandler = (args?: { hooks?: any }) => {
    const abortCalls: string[] = []
    const promptCalls: string[] = []

    const handler = createEventHandler({
      ctx: {
        directory: "/tmp",
        client: {
          session: {
            abort: async ({ path }: { path: { id: string } }) => {
              abortCalls.push(path.id)
              return {}
            },
            prompt: async ({ path }: { path: { id: string } }) => {
              promptCalls.push(path.id)
              return {}
            },
          },
        },
      } as any,
      pluginConfig: {} as any,
      firstMessageVariantGate: {
        markSessionCreated: () => {},
        clear: () => {},
      },
      managers: {
        tmuxSessionManager: {
          onSessionCreated: async () => {},
          onSessionDeleted: async () => {},
        },
        skillMcpManager: {
          disconnectSession: async () => {},
        },
      } as any,
      hooks: args?.hooks ?? ({} as any),
    })

    return { handler, abortCalls, promptCalls }
  }

  afterEach(() => {
    cacheSpy?.mockRestore?.()
    _resetForTesting()
  })

  test("triggers retry prompt for assistant message.updated APIError payloads (headless resume)", async () => {
    //#given
    const sessionID = "ses_message_updated_fallback"
    const { handler, abortCalls, promptCalls } = createHandler()

    //#when - test payload uses extended event shape for model-fallback logic
    await handler({
      event: {
        type: "message.updated",
        properties: {
          info: {
            id: "msg_err_1",
            sessionID,
            role: "assistant",
            time: { created: 1, completed: 2 },
            error: {
              name: "APIError",
              data: {
                message:
                  "Bad Gateway: {\"error\":{\"message\":\"unknown provider for model claude-opus-4-6-thinking\"}}",
                isRetryable: true,
              },
            },
            parentID: "msg_user_1",
            modelID: "claude-opus-4-6-thinking",
            providerID: "anthropic",
            mode: "Sisyphus (Ultraworker)",
            agent: "Sisyphus (Ultraworker)",
            path: { cwd: "/tmp", root: "/tmp" },
            cost: 0,
            tokens: { input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
          },
        },
      },
    } as unknown as EventInput)

    //#then
    expect(abortCalls).toEqual([sessionID])
    expect(promptCalls).toEqual([sessionID])
  })

  test("triggers retry prompt for nested model error payloads", async () => {
    //#given
    const sessionID = "ses_main_fallback_nested"
    setMainSession(sessionID)
    const { handler, abortCalls, promptCalls } = createHandler()

    //#when - test payload uses extended error shape for model-fallback logic
    await handler({
      event: {
        type: "session.error",
        properties: {
          sessionID,
          error: {
            name: "UnknownError",
            data: {
              error: {
                message:
                  "Bad Gateway: {\"error\":{\"message\":\"unknown provider for model claude-opus-4-6-thinking\"}}",
              },
            },
          },
        },
      },
    } as unknown as EventInput)

    //#then
    expect(abortCalls).toEqual([sessionID])
    expect(promptCalls).toEqual([sessionID])
  })

  test("triggers retry prompt on session.status retry events and applies fallback", async () => {
    //#given
    const sessionID = "ses_status_retry_fallback"
    setMainSession(sessionID)
    clearPendingModelFallback(sessionID)

    const modelFallback = createModelFallbackHook()

    const { handler, abortCalls, promptCalls } = createHandler({ hooks: { modelFallback } })

    const chatMessageHandler = createChatMessageHandler({
      ctx: {
        client: {
          tui: {
            showToast: async () => ({}),
          },
        },
      } as any,
      pluginConfig: {} as any,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
      },
      hooks: {
        modelFallback,
        stopContinuationGuard: null,
        keywordDetector: null,
        claudeCodeHooks: null,
        autoSlashCommand: null,
        startWork: null,
        ralphLoop: null,
      } as any,
    })

    await handler({
      event: {
        type: "message.updated",
        properties: {
          info: {
            id: "msg_user_status_1",
            sessionID,
            role: "user",
            time: { created: 1 },
            content: [],
            modelID: "claude-opus-4-6-thinking",
            providerID: "anthropic",
            agent: "Sisyphus (Ultraworker)",
            path: { cwd: "/tmp", root: "/tmp" },
          },
        },
      },
    } as unknown as EventInput)

    //#when
    await handler({
      event: {
        type: "session.status",
        properties: {
          sessionID,
          status: {
            type: "retry",
            attempt: 1,
            message:
              "Bad Gateway: {\"error\":{\"message\":\"unknown provider for model claude-opus-4-6-thinking\"}}",
            next: 1234,
          },
        },
      },
    } as unknown as EventInput)

    const output = { message: {}, parts: [] as Array<{ type: string; text?: string }> }
    await chatMessageHandler(
      {
        sessionID,
        agent: "sisyphus",
        model: { providerID: "anthropic", modelID: "claude-opus-4-6-thinking" },
      },
      output,
    )

    //#then
    expect(abortCalls).toEqual([sessionID])
    expect(promptCalls).toEqual([sessionID])
    expect(output.message["model"]).toEqual({
      providerID: "anthropic",
      modelID: "claude-opus-4-6",
    })
    expect(output.message["variant"]).toBe("max")
  })

  test("advances main-session fallback chain across repeated session.error retries end-to-end", async () => {
    //#given
    const abortCalls: string[] = []
    const promptCalls: string[] = []
    const toastCalls: string[] = []
    const sessionID = "ses_main_fallback_chain"
    setMainSession(sessionID)
    clearPendingModelFallback(sessionID)

    const modelFallback = createModelFallbackHook()

    const eventHandler = createEventHandler({
      ctx: {
        directory: "/tmp",
        client: {
          session: {
            abort: async ({ path }: { path: { id: string } }) => {
              abortCalls.push(path.id)
              return {}
            },
            prompt: async ({ path }: { path: { id: string } }) => {
              promptCalls.push(path.id)
              return {}
            },
          },
        },
      } as any,
      pluginConfig: {} as any,
      firstMessageVariantGate: {
        markSessionCreated: () => {},
        clear: () => {},
      },
      managers: {
        tmuxSessionManager: {
          onSessionCreated: async () => {},
          onSessionDeleted: async () => {},
        },
        skillMcpManager: {
          disconnectSession: async () => {},
        },
      } as any,
      hooks: {
        modelFallback,
      } as any,
    })

    const chatMessageHandler = createChatMessageHandler({
      ctx: {
        client: {
          tui: {
            showToast: async ({ body }: { body: { title?: string } }) => {
              if (body?.title) toastCalls.push(body.title)
              return {}
            },
          },
        },
      } as any,
      pluginConfig: {} as any,
      firstMessageVariantGate: {
        shouldOverride: () => false,
        markApplied: () => {},
      },
      hooks: {
        modelFallback,
        stopContinuationGuard: null,
        keywordDetector: null,
        claudeCodeHooks: null,
        autoSlashCommand: null,
        startWork: null,
        ralphLoop: null,
      } as any,
    })

    const triggerRetryCycle = async () => {
      await eventHandler({
        event: {
          type: "session.error",
          properties: {
            sessionID,
            providerID: "anthropic",
            modelID: "claude-opus-4-6-thinking",
            error: {
              name: "UnknownError",
              data: {
                error: {
                  message:
                    "Bad Gateway: {\"error\":{\"message\":\"unknown provider for model claude-opus-4-6-thinking\"}}",
                },
              },
            },
          },
        },
      } as unknown as EventInput)

      const output = { message: {}, parts: [] as Array<{ type: string; text?: string }> }
      await chatMessageHandler(
        {
          sessionID,
          agent: "sisyphus",
          model: { providerID: "anthropic", modelID: "claude-opus-4-6-thinking" },
        },
        output,
      )
      return output
    }

    //#when - first retry cycle
    const first = await triggerRetryCycle()

    //#then - first fallback entry applied (prefers current provider when available)
    expect(first.message["model"]).toEqual({
      providerID: "anthropic",
      modelID: "claude-opus-4-6",
    })
    expect(first.message["variant"]).toBe("max")

    //#when - second retry cycle
    const second = await triggerRetryCycle()

    //#then - second fallback entry applied (chain advanced)
    expect(second.message["model"]).toEqual({
      providerID: "opencode",
      modelID: "kimi-k2.5-free",
    })
    expect(second.message["variant"]).toBeUndefined()
    expect(abortCalls).toEqual([sessionID, sessionID])
    expect(promptCalls).toEqual([sessionID, sessionID])
    expect(toastCalls.length).toBeGreaterThanOrEqual(0)
  })
})
