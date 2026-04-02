import type { Message } from "./compact-config"

export interface SnipCompactOptions {
  removeZombies: boolean
  mergeAdjacent: boolean
}

export function snipCompact(
  messages: Message[],
  options: SnipCompactOptions,
): Message[] {
  let result = removeZombieMessages(messages)

  if (options.mergeAdjacent) {
    result = mergeAdjacentMessages(result)
  }

  return result
}

function removeZombieMessages(messages: Message[]): Message[] {
  return messages.filter((msg) => {
    if (msg.role !== "assistant") return true
    const assistantMsg = msg as Record<string, unknown>
    if (assistantMsg.to === undefined && assistantMsg.avatar === undefined) {
      return true
    }
    return (assistantMsg.content as unknown[])?.length > 0
  })
}

function mergeAdjacentMessages(messages: Message[]): Message[] {
  if (messages.length === 0) return messages

  const result: Message[] = []
  let currentUserMsg: Message | null = null

  for (const msg of messages) {
    if (msg.role === "user" && currentUserMsg) {
    } else if (msg.role === "user") {
      currentUserMsg = msg
    } else {
      if (currentUserMsg) {
        result.push(currentUserMsg)
        currentUserMsg = null
      }
      result.push(msg)
    }
  }

  if (currentUserMsg) {
    result.push(currentUserMsg)
  }

  return result
}

export function getMessageChainLength(messages: Message[]): number {
  let count = 0
  for (const msg of messages) {
    if (msg.role === "user" || msg.role === "assistant") {
      count++
    }
  }
  return count
}