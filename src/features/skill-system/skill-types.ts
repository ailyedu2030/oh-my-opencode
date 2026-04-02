import type { SkillScope } from "../../features/opencode-skill-loader/types"

export interface SkillDefinition {
  name: string
  description: string
  whenToUse?: string
  argumentHint?: string
  arguments?: string[]
  allowedTools?: string[]
  model?: string
  effort?: "low" | "medium" | "high"
  context?: "inline" | "fork"
  agent?: string
  paths?: string[]
  userInvocable?: boolean
  hooks?: SkillHooks
  skillRoot?: string
}

export interface SkillHooks {
  preToolUse?: PreToolUseHook[]
  postToolUse?: PostToolUseHook[]
}

export interface PreToolUseHook {
  matcher: string
  hooks: PreToolUseHookEntry[]
}

export interface PreToolUseHookEntry {
  type: "safe" | "warn" | "block"
  message?: string
}

export interface PostToolUseHook {
  matcher: string
  hooks: PostToolUseHookEntry[]
}

export interface PostToolUseHookEntry {
  type: "log" | "notify"
  message?: string
}

export interface Skill {
  definition: SkillDefinition
  scope: SkillScope
  path: string
}

export interface SkillActivation {
  skill: Skill
  matchedPaths: string[]
}

export function createSkillDefinition(
  partial: Partial<SkillDefinition> & { name: string; description: string },
): SkillDefinition {
  return {
    name: partial.name,
    description: partial.description,
    whenToUse: partial.whenToUse,
    argumentHint: partial.argumentHint,
    arguments: partial.arguments,
    allowedTools: partial.allowedTools,
    model: partial.model,
    effort: partial.effort,
    context: partial.context,
    agent: partial.agent,
    paths: partial.paths,
    userInvocable: partial.userInvocable,
    hooks: partial.hooks,
    skillRoot: partial.skillRoot,
  }
}
