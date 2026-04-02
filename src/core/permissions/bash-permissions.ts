import type { PermissionContext, PermissionDecision } from "./permission-types"
import { checkBashCommand, isReadOnlyCommand, validatePath } from "./path-validation"

export interface BashPermissionCheck {
  command: string
  cwd: string
  context: PermissionContext
}

export function checkBashPermission(check: BashPermissionCheck): PermissionDecision {
  const { command, cwd, context } = check

  const safetyCheck = checkBashCommand(command, cwd)
  if (!safetyCheck.safe) {
    return { behavior: "deny", reason: safetyCheck.reason ?? "Command failed safety check" }
  }

  if (isReadOnlyCommand(command)) {
    return { behavior: "allow" }
  }

  if (context.mode === "bypassPermissions") {
    return { behavior: "allow" }
  }

  if (context.mode === "plan") {
    return { behavior: "deny", reason: "Plan mode - no modifications allowed" }
  }

  if (context.mode === "dontAsk") {
    return { behavior: "deny", reason: "dontAsk mode - requires explicit permission" }
  }

  const pathCheck = extractPathsFromCommand(command)
  for (const path of pathCheck) {
    const validation = validatePath(path, "execute", cwd)
    if (!validation.valid) {
      return { behavior: "deny", reason: validation.reason ?? "Path validation failed" }
    }
  }

  return { behavior: "passthrough" }
}

function extractPathsFromCommand(command: string): string[] {
  const paths: string[] = []
  const regex = /['"](\/[^\s'"]+)['"]/g
  let match

  while ((match = regex.exec(command)) !== null) {
    paths.push(match[1])
  }

  return paths
}

export function parseBashCommand(command: string): {
  cmd: string
  args: string[]
  flags: string[]
} {
  const parts = command.trim().split(/\s+/)
  const cmd = parts[0] ?? ""
  const args: string[] = []
  const flags: string[] = []

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]
    if (part.startsWith("-")) {
      flags.push(part)
    } else {
      args.push(part)
    }
  }

  return { cmd, args, flags }
}
