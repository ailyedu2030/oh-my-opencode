import type { AssistantMessage, UserMessage } from "@opencode-ai/sdk"

export interface ForkSubagentResult {
  messages: (UserMessage | AssistantMessage)[]
  toolUseIds: string[]
}

export function buildForkedMessages(
  directive: string,
  assistantMessage: AssistantMessage,
): (UserMessage | AssistantMessage)[] {
  const clonedAssistant: AssistantMessage = {
    ...assistantMessage,
    id: generateUUID(),
  }

  const forkBoilerplate = `<FORK_BOILERPLATE>${directive}</FORK_BOILERPLATE>`

  const userMessage: UserMessage = {
    id: generateUUID(),
    sessionID: assistantMessage.sessionID,
    role: "user",
    time: { created: Date.now() },
    agent: "",
    model: { providerID: "", modelID: "" },
  }

  return [clonedAssistant, userMessage]
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getForkCacheKey(directive: string, model: string): string {
  return `fork:${model}:${directive.substring(0, 100)}`
}
