import type { Message } from "./compact-config"

export interface MicroCompactOptions {
  gapThresholdMinutes: number
  keepRecentCount: number
}

export function microCompact(
  messages: Message[],
  options: MicroCompactOptions,
): Message[] {
  const now = Date.now()
  const gapMs = options.gapThresholdMinutes * 60 * 1000
  const result: Message[] = []
  let staleCount = 0

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    const isRecent = i === messages.length - 1
    const timeDiff = now - msg.time.created

    if (isRecent || timeDiff < gapMs) {
      result.unshift(msg)
      continue
    }

    const isToolResult = isToolResultMessage(msg)
    if (isToolResult && staleCount < options.keepRecentCount) {
      result.unshift(msg)
      staleCount++
    } else if (!isToolResult) {
      result.unshift(msg)
    }
  }

  return result
}

function isToolResultMessage(msg: Message): boolean {
  if (msg.role !== "assistant") return false
  const assistantMsg = msg as Record<string, unknown>
  return Array.isArray(assistantMsg.toolResults) && assistantMsg.toolResults.length > 0
}

export function countToolResults(messages: Message[]): number {
  return messages.filter((m) => m.role === "assistant" && isToolResultMessage(m)).length
}