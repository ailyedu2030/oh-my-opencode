import type { CompactConfig, CompactResult, Message, SystemMessage, TextPart } from "./compact-config"

const SUMMARY_PROMPT = `<analysis>
[Chain-of-thought analysis - stripped from final output]
</analysis>

<summary>
1. Primary Request and Intent: [user's main ask]
2. Key Technical Concepts: [technical concepts involved]
3. Files and Code Sections: [files modified/created]
4. Errors and Fixes: [any errors encountered]
5. Problem Solving: [approach taken]
6. All User Messages: [compressed history]
7. Pending Tasks: [unfinished work]
8. Current Work: [in-progress items]
9. Optional Next Step: [suggested next action]
</summary>`

export async function autoCompact(
  messages: Message[],
  _config: CompactConfig,
): Promise<CompactResult> {
  const preCompactTokens = estimateTokens(messages)
  const summaryMessages = buildSummaryMessages(messages)
  const boundaryMarker = createBoundaryMarker(summaryMessages)
  const postCompactTokens = estimateTokens(summaryMessages)

  return {
    boundaryMarker,
    summaryMessages,
    preCompactTokens,
    postCompactTokens,
  }
}

export function shouldAutoCompact(
  messages: Message[],
  model: string,
  config: Pick<CompactConfig, "reservedForSummary" | "autoThresholdBuffer">,
): boolean {
  const tokens = estimateTokens(messages)
  const contextLimit = getModelContextLimit(model)
  const effectiveWindow = contextLimit - config.reservedForSummary
  const threshold = effectiveWindow - config.autoThresholdBuffer

  return tokens >= threshold
}

export function getModelContextLimit(model: string): number {
  const modelLimits: Record<string, number> = {
    "claude-opus-4-6": 200_000,
    "claude-sonnet-4-6": 200_000,
    "claude-haiku-4-5": 200_000,
    "gpt-4o": 128_000,
    "gpt-4o-mini": 128_000,
    "gpt-5.2": 128_000,
    "gpt-5.3-codex": 128_000,
  }

  const lowerModel = model.toLowerCase()
  for (const [key, limit] of Object.entries(modelLimits)) {
    if (lowerModel.includes(key.toLowerCase())) {
      return limit
    }
  }

  return 100_000
}

function buildSummaryMessages(messages: Message[]): Message[] {
  const userMsgs = messages.filter((m) => m.role === "user")
  const assistantMsgs = messages.filter((m) => m.role === "assistant")

  const summaryText = buildSummaryText(userMsgs, assistantMsgs)

  return [
    {
      id: `summary-${Date.now()}`,
      sessionID: messages[0]?.sessionID ?? "unknown",
      role: "user" as const,
      time: { created: Date.now() },
      content: [{ type: "text" as const, text: summaryText }],
    },
  ]
}

function buildSummaryText(
  userMsgs: Message[],
  assistantMsgs: Message[],
): string {
  const lines: string[] = []

  lines.push("## Conversation Summary\n")

  if (userMsgs.length > 0) {
    lines.push(`**User Messages:** ${userMsgs.length}`)
    const firstUser = extractUserContent(userMsgs[0])
    if (firstUser) {
      lines.push(`- First request: ${firstUser.substring(0, 200)}...`)
    }
  }

  if (assistantMsgs.length > 0) {
    lines.push(`**Assistant Messages:** ${assistantMsgs.length}`)
  }

  lines.push("\n" + SUMMARY_PROMPT)

  return lines.join("\n")
}

function extractUserContent(msg: Message): string {
  const content = msg as Record<string, unknown>
  if (Array.isArray(content.content)) {
    const textPart = (content.content as TextPart[]).find((p) => p.type === "text")
    return textPart?.text ?? ""
  }
  return ""
}

function createBoundaryMarker(_summaryMessages: Message[]): SystemMessage {
  return {
    type: "system",
    content: [
      {
        type: "text",
        text: "--- Earlier conversation summarized ---",
      },
    ],
  }
}

export function estimateTokens(messages: Message[]): number {
  if (messages.length === 0) return 0
  const text = JSON.stringify(messages)
  return Math.ceil(text.length / 4)
}

export function formatCompactStats(result: CompactResult): string {
  const freed = result.preCompactTokens - result.postCompactTokens
  const pct = ((freed / result.preCompactTokens) * 100).toFixed(1)
  return `Compacted ${result.preCompactTokens}→${result.postCompactTokens} tokens (${freed} freed, ${pct}%)`
}