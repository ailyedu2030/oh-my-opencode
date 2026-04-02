import type { PermissionContext, PermissionDecision, PermissionRule } from "./permission-types"

export function checkPermission(
  toolName: string,
  input: unknown,
  context: PermissionContext,
): PermissionDecision {
  if (matchesAlwaysDeny(toolName, context)) {
    return { behavior: "deny", reason: `Tool ${toolName} matched always-deny rule` }
  }

  if (matchesAlwaysAsk(toolName, context)) {
    return { behavior: "ask", reason: `Tool ${toolName} matched always-ask rule` }
  }

  if (matchesAlwaysAllow(toolName, context)) {
    return { behavior: "allow" }
  }

  if (context.mode === "bypassPermissions") {
    return { behavior: "allow" }
  }

  if (context.mode === "plan") {
    return { behavior: "deny", reason: "Plan mode - read-only operation" }
  }

  const customRule = findMatchingRule(toolName, input, context.rules)
  if (customRule) {
    return applyRule(customRule)
  }

  return { behavior: "passthrough" }
}

function matchesAlwaysDeny(toolName: string, context: PermissionContext): boolean {
  return context.alwaysDenyRules?.some((rule) => matchRule(toolName, rule)) ?? false
}

function matchesAlwaysAsk(toolName: string, context: PermissionContext): boolean {
  return context.alwaysAskRules?.some((rule) => matchRule(toolName, rule)) ?? false
}

function matchesAlwaysAllow(toolName: string, context: PermissionContext): boolean {
  return context.alwaysAllowRules?.some((rule) => matchRule(toolName, rule)) ?? false
}

function matchRule(toolName: string, rule: string): boolean {
  if (rule === toolName) return true
  if (rule.endsWith(":*")) {
    const ns = rule.slice(0, -2)
    return toolName.startsWith(ns + ":")
  }
  if (rule.includes("*")) {
    const regex = new RegExp("^" + rule.replace(/\*/g, ".*") + "$")
    return regex.test(toolName)
  }
  return false
}

function findMatchingRule(
  toolName: string,
  _input: unknown,
  rules: PermissionRule[],
): PermissionRule | null {
  for (const rule of rules) {
    if (rule.toolName !== toolName) continue
    if (rule.ruleContent === undefined) continue
    return rule
  }
  return null
}

function applyRule(rule: PermissionRule): PermissionDecision {
  switch (rule.behavior) {
    case "allow":
      return { behavior: "allow" }
    case "deny":
      return { behavior: "deny", reason: `Matched deny rule: ${rule.ruleContent ?? rule.toolName}` }
    case "ask":
      return { behavior: "ask", reason: `Matched ask rule: ${rule.ruleContent ?? rule.toolName}` }
  }
}
