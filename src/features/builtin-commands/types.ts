import type { CommandDefinition } from "../claude-code-command-loader"

export type BuiltinCommandName = "init-deep" | "ralph-loop" | "cancel-ralph" | "ulw-loop" | "refactor" | "start-work" | "stop-continuation" | "handoff" | "plan" | "verify" | "checkpoint" | "learn" | "tdd" | "e2e" | "code-review" | "build-fix" | "refactor-clean" | "pm2" | "learn-eval" | "instinct-code" | "instinct-refine" | "instinct-review" | "evolve" | "security" | "check-security" | "review-code" | "run-tdd" | "fix-build" | "e2e-test"

export interface BuiltinCommandConfig {
  disabled_commands?: BuiltinCommandName[]
}

export type BuiltinCommands = Record<string, CommandDefinition>
