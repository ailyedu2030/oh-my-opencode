export type PermissionMode =
  | "default"
  | "acceptEdits"
  | "bypassPermissions"
  | "dontAsk"
  | "plan"
  | "auto"

export interface PermissionRule {
  source: "policy" | "user" | "project" | "session" | "command"
  behavior: "allow" | "deny" | "ask"
  toolName: string
  ruleContent?: string
}

export type PermissionDecision =
  | { behavior: "allow" }
  | { behavior: "deny"; reason: string }
  | { behavior: "ask"; reason: string; prompt?: string }
  | { behavior: "passthrough" }

export interface PermissionContext {
  mode: PermissionMode
  cwd: string
  rules: PermissionRule[]
  alwaysAllowRules?: string[]
  alwaysDenyRules?: string[]
  alwaysAskRules?: string[]
}

export function getDefaultPermissionContext(cwd: string): PermissionContext {
  return {
    mode: "default",
    cwd,
    rules: [],
    alwaysAllowRules: [],
    alwaysDenyRules: [],
    alwaysAskRules: [],
  }
}

export function isModeAllowed(
  mode: PermissionMode,
  requiresInteraction: boolean,
): boolean {
  if (mode === "bypassPermissions") return true
  if (mode === "plan") return false
  if (mode === "dontAsk" && requiresInteraction) return false
  if (mode === "acceptEdits") return true
  return true
}
