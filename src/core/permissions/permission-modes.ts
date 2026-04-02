import type { PermissionMode } from "./permission-types"

const MODE_TRANSITIONS: Record<PermissionMode, PermissionMode[]> = {
  default: ["acceptEdits", "bypassPermissions", "dontAsk", "plan", "auto"],
  acceptEdits: ["default", "bypassPermissions", "dontAsk", "plan", "auto"],
  bypassPermissions: ["default", "acceptEdits", "dontAsk", "plan", "auto"],
  dontAsk: ["default", "acceptEdits", "bypassPermissions", "plan", "auto"],
  plan: ["default", "acceptEdits", "dontAsk"],
  auto: ["default", "acceptEdits", "bypassPermissions", "dontAsk", "plan"],
}

export function canTransitionMode(
  from: PermissionMode,
  to: PermissionMode,
): boolean {
  return MODE_TRANSITIONS[from]?.includes(to) ?? false
}

export function getModeDescription(mode: PermissionMode): string {
  const descriptions: Record<PermissionMode, string> = {
    default: "Ask user for authorization",
    acceptEdits: "Auto-allow edits in working directory",
    bypassPermissions: "Allow all operations (dangerous)",
    dontAsk: "Silent deny for operations requiring interaction",
    plan: "Read-only mode",
    auto: "AI classifier decides (requires AI integration)",
  }
  return descriptions[mode]
}

export function stripDangerousRules(mode: PermissionMode): boolean {
  return mode === "auto"
}

export function requiresInteraction(mode: PermissionMode): boolean {
  return mode === "default" || mode === "auto"
}
