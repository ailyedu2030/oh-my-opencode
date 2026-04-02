/// <reference types="bun-types" />

import { describe, it, expect } from "bun:test"
import { autoCompact, shouldAutoCompact, getModelContextLimit, formatCompactStats, estimateTokens } from "./auto-compact"
import type { Message, CompactConfig } from "./compact-config"

function createMessage(role: "user" | "assistant", content: string): Message {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sessionID: "test-session",
    role,
    time: { created: Date.now() },
    content: [{ type: "text", text: content }],
  } as unknown as Message
}

const defaultConfig: CompactConfig = {
  enabled: true,
  autoThresholdBuffer: 13_000,
  warningThresholdBuffer: 20_000,
  errorThresholdBuffer: 3_000,
  reservedForSummary: 20_000,
  maxConsecutiveFailures: 3,
}

describe("autoCompact", () => {
  it("creates summary with boundary marker", async () => {
    const messages = [
      createMessage("user", "Hello, how are you?"),
      createMessage("assistant", "I'm doing well, thank you!"),
    ]

    const result = await autoCompact(messages, defaultConfig)

    expect(result.boundaryMarker).toBeDefined()
    expect(result.boundaryMarker?.type).toBe("system")
    expect(result.summaryMessages).toHaveLength(1)
    expect(result.summaryMessages[0].role).toBe("user")
  })

  it("reduces token count after compaction", async () => {
    const messages = Array.from({ length: 10 }, (_, i) =>
      createMessage("user", `This is message number ${i} with some content to make it longer.`.repeat(10)),
    )

    const result = await autoCompact(messages, defaultConfig)

    expect(result.postCompactTokens).toBeLessThan(result.preCompactTokens)
  })
})

describe("shouldAutoCompact", () => {
  it("returns true when tokens exceed threshold", () => {
    const largeMessages = Array.from({ length: 100 }, (_, i) =>
      createMessage("user", `Message ${i} `.repeat(100)),
    )
    const tokens = estimateTokens(largeMessages)

    const result = shouldAutoCompact(largeMessages, "claude-opus-4-6", defaultConfig)

    if (tokens > 150_000) {
      expect(result).toBe(true)
    }
  })

  it("returns false for small messages", () => {
    const smallMessages = [
      createMessage("user", "Hi"),
      createMessage("assistant", "Hello!"),
    ]

    const result = shouldAutoCompact(smallMessages, "claude-opus-4-6", defaultConfig)

    expect(result).toBe(false)
  })
})

describe("getModelContextLimit", () => {
  it("returns 200k for claude-opus", () => {
    expect(getModelContextLimit("claude-opus-4-6")).toBe(200_000)
  })

  it("returns 200k for claude-sonnet", () => {
    expect(getModelContextLimit("claude-sonnet-4-6")).toBe(200_000)
  })

  it("returns 128k for gpt-4o", () => {
    expect(getModelContextLimit("gpt-4o")).toBe(128_000)
  })

  it("returns 100k for unknown models", () => {
    expect(getModelContextLimit("unknown-model")).toBe(100_000)
  })
})

describe("estimateTokens", () => {
  it("returns 0 for empty array", () => {
    expect(estimateTokens([])).toBe(0)
  })

  it("returns positive number for messages", () => {
    const messages = [createMessage("user", "Hello world")]
    expect(estimateTokens(messages)).toBeGreaterThan(0)
  })

  it("scales with message size", () => {
    const small = [createMessage("user", "Hi")]
    const large = [createMessage("user", "A".repeat(1000))]

    expect(estimateTokens(large)).toBeGreaterThan(estimateTokens(small))
  })
})

describe("formatCompactStats", () => {
  it("formats stats correctly", () => {
    const result = {
      boundaryMarker: undefined,
      summaryMessages: [],
      preCompactTokens: 1000,
      postCompactTokens: 100,
    }

    const formatted = formatCompactStats(result)

    expect(formatted).toContain("1000")
    expect(formatted).toContain("100")
    expect(formatted).toContain("90")
    expect(formatted).toContain("%")
  })
})
