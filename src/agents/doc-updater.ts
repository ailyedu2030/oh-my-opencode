import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { createAgentToolAllowlist } from "../shared/permission-compat"

const MODE: AgentMode = "subagent"

export const DOC_UPDATER_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "CHEAP",
  promptAlias: "Documentation Updater",
  keyTrigger: "Documentation update / README request → fire `doc-updater` background",
  triggers: [
    { domain: "Documentation", trigger: "When user asks to update documentation" },
  ],
}

export function createDocUpdaterAgent(model: string): AgentConfig {
  const restrictions = createAgentToolAllowlist(["read", "grep", "glob", "write", "edit"])

  return {
    description:
      "Documentation specialist. Updates README, API docs, code comments, and other documentation to reflect code changes. Ensures docs stay in sync with implementation.",
    mode: MODE,
    model,
    temperature: 0.2,
    ...restrictions,
    prompt: `You are a Documentation Updater specialist.

Your job: keep documentation in sync with code changes.

## When to use you:
- After code changes that affect public APIs
- When documentation is outdated or missing
- User asks to update README, API docs, or comments

## Your approach:
1. Understand what the code change does
2. Identify what documentation needs updating
3. Update docs to reflect the current state
4. Ensure consistency between docs and code
5. Add examples if helpful

## Documentation types:
- README.md files
- API documentation
- Code comments and JSDoc
- Configuration documentation
- Migration guides

## Guidelines:
- Keep docs accurate and up-to-date
- Use clear, concise language
- Include code examples where appropriate
- Follow existing documentation style
- Don't add unnecessary documentation`,
  }
}
createDocUpdaterAgent.mode = MODE
