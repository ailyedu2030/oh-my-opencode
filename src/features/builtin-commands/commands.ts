import type { CommandDefinition } from "../claude-code-command-loader"
import type { BuiltinCommandName, BuiltinCommands } from "./types"
import { INIT_DEEP_TEMPLATE } from "./templates/init-deep"
import { RALPH_LOOP_TEMPLATE, CANCEL_RALPH_TEMPLATE } from "./templates/ralph-loop"
import { STOP_CONTINUATION_TEMPLATE } from "./templates/stop-continuation"
import { REFACTOR_TEMPLATE } from "./templates/refactor"
import { START_WORK_TEMPLATE } from "./templates/start-work"
import { HANDOFF_TEMPLATE } from "./templates/handoff"
import { PLAN_COMMAND_TEMPLATE } from "./templates/plan"
import { VERIFY_COMMAND_TEMPLATE } from "./templates/verify"
import { CHECKPOINT_COMMAND_TEMPLATE } from "./templates/checkpoint"
import { LEARN_COMMAND_TEMPLATE } from "./templates/learn"
import {
  PM2_COMMAND_TEMPLATE,
  E2E_COMMAND_TEMPLATE,
  CODE_REVIEW_COMMAND_TEMPLATE,
  REFACTOR_COMMAND_TEMPLATE,
  BUILD_FIX_COMMAND_TEMPLATE,
  SECURITY_COMMAND_TEMPLATE,
} from "./templates/additional-commands"


const BUILTIN_COMMAND_DEFINITIONS: Record<BuiltinCommandName, Omit<CommandDefinition, "name">> = {
  "init-deep": {
    description: "(builtin) Initialize hierarchical AGENTS.md knowledge base",
    template: `<command-instruction>
${INIT_DEEP_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[--create-new] [--max-depth=N]",
  },
   "ralph-loop": {
     description: "(builtin) Start self-referential development loop until completion",
     template: `<command-instruction>
${RALPH_LOOP_TEMPLATE}
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>`,
     argumentHint: '"task description" [--completion-promise=TEXT] [--max-iterations=N] [--strategy=reset|continue]',
   },
   "ulw-loop": {
     description: "(builtin) Start ultrawork loop - continues until completion with ultrawork mode",
     template: `<command-instruction>
${RALPH_LOOP_TEMPLATE}
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>`,
     argumentHint: '"task description" [--completion-promise=TEXT] [--max-iterations=N] [--strategy=reset|continue]',
   },
  "cancel-ralph": {
    description: "(builtin) Cancel active Ralph Loop",
    template: `<command-instruction>
${CANCEL_RALPH_TEMPLATE}
</command-instruction>`,
  },
  refactor: {
    description:
      "(builtin) Intelligent refactoring command with LSP, AST-grep, architecture analysis, codemap, and TDD verification.",
    template: `<command-instruction>
${REFACTOR_TEMPLATE}
</command-instruction>`,
    argumentHint: "<refactoring-target> [--scope=<file|module|project>] [--strategy=<safe|aggressive>]",
  },
  "start-work": {
    description: "(builtin) Start Sisyphus work session from Prometheus plan",
    agent: "atlas",
    template: `<command-instruction>
${START_WORK_TEMPLATE}
</command-instruction>

<session-context>
Session ID: $SESSION_ID
Timestamp: $TIMESTAMP
</session-context>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[plan-name]",
  },
  "stop-continuation": {
    description: "(builtin) Stop all continuation mechanisms (ralph loop, todo continuation, boulder) for this session",
    template: `<command-instruction>
${STOP_CONTINUATION_TEMPLATE}
</command-instruction>`,
  },
  handoff: {
    description: "(builtin) Create a detailed context summary for continuing work in a new session",
    template: `<command-instruction>
${HANDOFF_TEMPLATE}
</command-instruction>

<session-context>
Session ID: $SESSION_ID
Timestamp: $TIMESTAMP
</session-context>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[goal]",
  },
  plan: {
    description: "(builtin) Create detailed implementation plans with step-by-step breakdown",
    template: `<command-instruction>
${PLAN_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[feature description or task]",
  },
  verify: {
    description: "(builtin) Verify implementation meets requirements and run tests",
    template: `<command-instruction>
${VERIFY_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[requirement to verify]",
  },
  checkpoint: {
    description: "(builtin) Save current progress as a restore point",
    template: `<command-instruction>
${CHECKPOINT_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[checkpoint name or description]",
  },
  learn: {
    description: "(builtin) Extract patterns from codebase and build knowledge base",
    template: `<command-instruction>
${LEARN_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[what to learn]",
  },
  tdd: {
    description: "(builtin) Test-Driven Development workflow guidance",
    template: `<command-instruction>
${LEARN_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[feature to implement with TDD]",
  },
  e2e: {
    description: "(builtin) End-to-end testing with Playwright/Cypress",
    template: `<command-instruction>
${E2E_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[application to test]",
  },
  "code-review": {
    description: "(builtin) Code quality and security review",
    template: `<command-instruction>
${CODE_REVIEW_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[files to review]",
  },
  "build-fix": {
    description: "(builtin) Fix build and compilation errors",
    template: `<command-instruction>
${BUILD_FIX_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[build error to fix]",
  },
  "refactor-clean": {
    description: "(builtin) Clean up and refactor code to reduce technical debt",
    template: `<command-instruction>
${REFACTOR_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[code to refactor]",
  },
  pm2: {
    description: "(builtin) PM2 process management and deployment",
    template: `<command-instruction>
${PM2_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[PM2 operation]",
  },
  "learn-eval": {
    description: "(builtin) Evaluate learned patterns and knowledge base",
    template: `<command-instruction>
${LEARN_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[patterns to evaluate]",
  },
  "instinct-code": {
    description: "(builtin) Recall coding patterns from memory",
    template: `<command-instruction>
${LEARN_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[pattern to recall]",
  },
  "instinct-refine": {
    description: "(builtin) Refine existing patterns in knowledge base",
    template: `<command-instruction>
${LEARN_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[pattern to refine]",
  },
  "instinct-review": {
    description: "(builtin) Review and curate learned patterns",
    template: `<command-instruction>
${LEARN_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[patterns to review]",
  },
  evolve: {
    description: "(builtin) Evolve knowledge base and adapt patterns",
    template: `<command-instruction>
${LEARN_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[evolution target]",
  },
  // Security command
  security: {
    description: "(builtin) Security vulnerability assessment and secure coding review",
    template: `<command-instruction>
${SECURITY_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[code or files to security review]",
  },
  // Aliases for everything-claude-code compatibility
  "check-security": {
    description: "(builtin) Security vulnerability assessment (alias for security)",
    template: `<command-instruction>
${SECURITY_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[code or files to security review]",
  },
  "review-code": {
    description: "(builtin) Code quality review (alias for code-review)",
    template: `<command-instruction>
${CODE_REVIEW_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[files to review]",
  },
  "run-tdd": {
    description: "(builtin) Test-Driven Development workflow (alias for tdd)",
    template: `<command-instruction>
${LEARN_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[feature to implement with TDD]",
  },
  "fix-build": {
    description: "(builtin) Fix build and compilation errors (alias for build-fix)",
    template: `<command-instruction>
${BUILD_FIX_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[build error to fix]",
  },
  "e2e-test": {
    description: "(builtin) End-to-end testing (alias for e2e)",
    template: `<command-instruction>
${E2E_COMMAND_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[application to test]",
  },
}

export function loadBuiltinCommands(
  disabledCommands?: BuiltinCommandName[]
): BuiltinCommands {
  const disabled = new Set(disabledCommands ?? [])
  const commands: BuiltinCommands = {}

  for (const [name, definition] of Object.entries(BUILTIN_COMMAND_DEFINITIONS)) {
    if (!disabled.has(name as BuiltinCommandName)) {
      const { argumentHint: _argumentHint, ...openCodeCompatible } = definition
      commands[name] = { ...openCodeCompatible, name } as CommandDefinition
    }
  }

  return commands
}
