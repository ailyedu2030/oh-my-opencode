/// <reference types="bun-types" />

import { describe, it, expect } from "bun:test"
import { microCompact, countToolResults } from "./micro-compact"
import type { Message } from "./compact-config"

function createMessage(
  role: "user" | "assistant",
  createdAt: number,
  toolResults?: unknown,
): Message {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sessionID: "test-session",
    role,
    time: { created: createdAt },
    ...(toolResults !== undefined ? { toolResults } : {}),
  } as Message
}

describe("microCompact", () => {
  it("keeps recent messages regardless of age", () => {
    const now = Date.now()
    const recent = createMessage("user", now - 1000)
    const messages = [recent]

    const result = microCompact(messages, {
      gapThresholdMinutes: 60,
      keepRecentCount: 5,
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(recent)
  })

  it("removes tool results beyond keepRecentCount", () => {
    const now = Date.now()
    const oldToolResult = createMessage(
      "assistant",
      now - 120 * 60 * 1000,
      [{ type: "tool_result", text: "result" }],
    )
    const recentUser = createMessage("user", now - 1000)

    const result = microCompact(
      [oldToolResult, recentUser],
      {
        gapThresholdMinutes: 60,
        keepRecentCount: 0,
      },
    )

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(recentUser)
  })

  it("keeps up to keepRecentCount tool results", () => {
    const now = Date.now()
    const messages: Message[] = [
      createMessage("assistant", now - 120 * 60 * 1000, [{ type: "tool_result", text: "1" }]),
      createMessage("assistant", now - 130 * 60 * 1000, [{ type: "tool_result", text: "2" }]),
      createMessage("assistant", now - 140 * 60 * 1000, [{ type: "tool_result", text: "3" }]),
      createMessage("user", now - 1000),
    ]

    const result = microCompact(messages, {
      gapThresholdMinutes: 60,
      keepRecentCount: 2,
    })

    expect(result.filter((m) => m.role === "assistant")).toHaveLength(2)
  })

  it("keeps non-tool-result messages", () => {
    const now = Date.now()
    const oldUser = createMessage("user", now - 120 * 60 * 1000)
    const recentUser = createMessage("user", now - 1000)

    const result = microCompact(
      [oldUser, recentUser],
      {
        gapThresholdMinutes: 60,
        keepRecentCount: 5,
      },
    )

    expect(result).toHaveLength(2)
  })
})

describe("countToolResults", () => {
  it("counts messages with toolResults", () => {
    const messages: Message[] = [
      createMessage("user", Date.now()),
      createMessage("assistant", Date.now(), [{ type: "tool_result" }]),
      createMessage("assistant", Date.now()),
      createMessage("assistant", Date.now(), [{ type: "tool_result" }]),
    ]

    expect(countToolResults(messages)).toBe(2)
  })

  it("returns 0 for empty array", () => {
    expect(countToolResults([])).toBe(0)
  })

  it("returns 0 when no assistant messages", () => {
    const messages = [
      createMessage("user", Date.now()),
      createMessage("user", Date.now()),
    ]
    expect(countToolResults(messages)).toBe(0)
  })
})
