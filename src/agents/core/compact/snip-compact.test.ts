/// <reference types="bun-types" />

import { describe, it, expect } from "bun:test"
import { snipCompact, getMessageChainLength } from "./snip-compact"
import type { Message } from "./compact-config"

function createMessage(role: "user" | "assistant"): Message {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sessionID: "test-session",
    role,
    time: { created: Date.now() },
  }
}

describe("snipCompact", () => {
  describe("removeZombies", () => {
    it("removes zombie messages", () => {
      const normalUser = createMessage("user")
      const zombieMessage = {
        ...createMessage("assistant"),
        to: "someone",
        avatar: "bot",
      } as unknown as Message

      const result = snipCompact([zombieMessage, normalUser], {
        removeZombies: true,
        mergeAdjacent: false,
      })

      expect(result).toHaveLength(1)
      expect(result[0]).toBe(normalUser)
    })

    it("keeps messages with content", () => {
      const msgWithContent = {
        ...createMessage("assistant"),
        content: [{ type: "text", text: "hello" }],
      } as unknown as Message

      const result = snipCompact([msgWithContent], {
        removeZombies: true,
        mergeAdjacent: false,
      })

      expect(result).toHaveLength(1)
    })
  })

  describe("mergeAdjacent", () => {
    it("merges adjacent user messages", () => {
      const user1 = createMessage("user")
      const user2 = createMessage("user")
      const assistant = createMessage("assistant")

      const result = snipCompact([user1, user2, assistant], {
        removeZombies: false,
        mergeAdjacent: true,
      })

      expect(result).toHaveLength(2)
      expect(result[0]).toBe(user1)
      expect(result[1]).toBe(assistant)
    })

    it("does not merge different roles", () => {
      const user = createMessage("user")
      const assistant = createMessage("assistant")

      const result = snipCompact([user, assistant], {
        removeZombies: false,
        mergeAdjacent: true,
      })

      expect(result).toHaveLength(2)
    })
  })

  it("handles empty array", () => {
    const result = snipCompact([], {
      removeZombies: true,
      mergeAdjacent: true,
    })

    expect(result).toHaveLength(0)
  })

  it("handles single message", () => {
    const msg = createMessage("user")
    const result = snipCompact([msg], {
      removeZombies: true,
      mergeAdjacent: true,
    })

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(msg)
  })
})

describe("getMessageChainLength", () => {
  it("counts user and assistant messages", () => {
    const messages = [
      createMessage("user"),
      createMessage("assistant"),
      createMessage("user"),
      createMessage("assistant"),
    ]

    expect(getMessageChainLength(messages)).toBe(4)
  })

  it("excludes system messages", () => {
    const messages = [
      createMessage("user"),
      { ...createMessage("assistant"), role: "system" as unknown as "assistant" },
      createMessage("assistant"),
    ]

    expect(getMessageChainLength(messages)).toBe(2)
  })

  it("returns 0 for empty array", () => {
    expect(getMessageChainLength([])).toBe(0)
  })
})
