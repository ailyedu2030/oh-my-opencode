import type {
  Skill,
  SkillHooks,
} from "./skill-types"

export interface ToolUse {
  name: string
  input: Record<string, unknown>
}

export type HookResult =
  | { allowed: true }
  | { allowed: false; reason: string }

export interface SkillHookContext {
  skill: Skill
  toolUse: ToolUse
}

export function evaluatePreToolUseHooks(
  hooks: SkillHooks,
  skill: Skill,
  toolUse: ToolUse,
): HookResult {
  if (!hooks.preToolUse || hooks.preToolUse.length === 0) {
    return { allowed: true }
  }

  for (const preHook of hooks.preToolUse) {
    if (!matchesPattern(preHook.matcher, toolUse.name)) {
      continue
    }

    for (const entry of preHook.hooks) {
      if (entry.type === "block") {
        return {
          allowed: false,
          reason: entry.message ?? `Tool ${toolUse.name} blocked by skill ${skill.definition.name}`,
        }
      }
    }
  }

  return { allowed: true }
}

export function evaluatePostToolUseHooks(
  hooks: SkillHooks,
  skill: Skill,
  toolUse: ToolUse,
  _result: unknown,
): void {
  if (!hooks.postToolUse || hooks.postToolUse.length === 0) {
    return
  }

  for (const postHook of hooks.postToolUse) {
    if (!matchesPattern(postHook.matcher, toolUse.name)) {
      continue
    }

    for (const entry of postHook.hooks) {
      if (entry.type === "log") {
        console.log(`[skill:${skill.definition.name}] Tool ${toolUse.name} completed`)
      }
    }
  }
}

function matchesPattern(matcher: string, toolName: string): boolean {
  if (matcher === toolName) return true

  if (matcher.endsWith("*")) {
    const prefix = matcher.slice(0, -1)
    return toolName.startsWith(prefix)
  }

  if (matcher.includes("*")) {
    const regex = new RegExp("^" + matcher.replace(/\*/g, ".*") + "$")
    return regex.test(toolName)
  }

  return false
}

export function mergeSkillHooks(
  baseHooks: SkillHooks | undefined,
  additionalHooks: SkillHooks | undefined,
): SkillHooks {
  if (!baseHooks) return additionalHooks ?? {}
  if (!additionalHooks) return baseHooks

  return {
    preToolUse: [...(baseHooks.preToolUse ?? []), ...(additionalHooks.preToolUse ?? [])],
    postToolUse: [...(baseHooks.postToolUse ?? []), ...(additionalHooks.postToolUse ?? [])],
  }
}
