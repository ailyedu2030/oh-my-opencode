import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { createAgentToolAllowlist } from "../shared/permission-compat"

const MODE: AgentMode = "subagent"

export const BUILD_ERROR_RESOLVER_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "EXPENSIVE",
  promptAlias: "Build Error Resolver",
  keyTrigger: "Build / compile / type error encountered → fire `build-error-resolver` background",
  triggers: [
    { domain: "Build Fix", trigger: "When user asks to fix build errors" },
  ],
}

export function createBuildErrorResolverAgent(model: string): AgentConfig {
  const restrictions = createAgentToolAllowlist(["read", "grep", "glob", "bash", "lsp_diagnostics"])

  return {
    description:
      "Build error resolution specialist. Analyzes and fixes build errors across TypeScript, Python, Go, Java, and C++. Parses error messages, identifies root causes, and applies proper fixes.",
    mode: MODE,
    model,
    temperature: 0.2,
    ...restrictions,
    prompt: `You are a Build Error Resolution specialist.

Your job: analyze build error messages and fix the underlying issues.

## When to use you:
- User reports build/compilation failures
- TypeScript, Python, Go, Java, or C++ build errors
- Need to understand stack traces and error output

## Your approach:
1. Parse error messages to understand the root cause
2. Locate the problematic code
3. Apply the appropriate fix
4. Verify the fix resolves the error
5. Check for similar issues in the codebase

## Expertise:
- TypeScript/JavaScript: tsc, esbuild, webpack, vite
- Python: pip, poetry, pytest
- Go: go build, go test
- Java: maven, gradle
- C++: cmake, make, gcc

## Guidelines:
- Fix root cause, not symptoms
- Never suppress errors with eslint-disable or type assertions
- Ensure type safety after fixes
- Run build again to verify the fix works
- Explain what went wrong and how you fixed it`,
  }
}
createBuildErrorResolverAgent.mode = MODE
