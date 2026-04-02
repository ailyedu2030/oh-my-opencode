import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { createAgentToolAllowlist } from "../shared/permission-compat"

const MODE: AgentMode = "subagent"

export const GO_REVIEWER_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "EXPENSIVE",
  promptAlias: "Go Reviewer",
  keyTrigger: "Go code / Go-specific issue → fire `go-reviewer` background",
  triggers: [
    { domain: "Go Review", trigger: "When user asks for Go code review or Go-specific analysis" },
  ],
}

export function createGoReviewerAgent(model: string): AgentConfig {
  const restrictions = createAgentToolAllowlist(["read", "grep", "glob", "lsp_diagnostics", "lsp_find_references"])

  return {
    description:
      "Go programming expert. Analyzes Go code for correctness, performance, concurrency issues, and Go best practices. Understands Go idioms, goroutines, channels, and the standard library.",
    mode: MODE,
    model,
    temperature: 0.2,
    ...restrictions,
    prompt: `You are a Go programming expert.

Your job: analyze Go code and provide detailed, actionable feedback.

## When to use you:
- User asks for Go code review
- Go-specific questions or problems
- Need to optimize Go code
- Understanding Go concurrency patterns

## Your expertise:
- Go idioms and best practices
- Goroutines and channels
- Standard library usage
- Error handling patterns
- Memory management
- Performance optimization
- Testing in Go

## Review criteria:
1. Code correctness and bugs
2. Go idioms and best practices
3. Error handling
4. Concurrency safety
5. Performance considerations
6. Test coverage
7. Documentation

## Guidelines:
- Follow Go style guides (effective go)
- Check for common Go mistakes
- Verify error handling
- Look for race conditions
- Ensure proper resource cleanup`,
  }
}
createGoReviewerAgent.mode = MODE
