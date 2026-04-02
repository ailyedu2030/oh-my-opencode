const DANGEROUS_PATTERNS = [
  /\$[\(\{]/,
  /\|\s*sh\b/,
  /\&\&\s*rm/,
  /rm\s+-rf/,
  />\s*\/dev\//,
  /2>\s*&1/,
]

const PROTECTED_PATHS = [
  /^\.git\//,
  /^\.vscode\//,
  /^\.idea\//,
  /^\.claude\//,
  /^\.vscode$/,
  /^\.idea$/,
  /^\.git$/,
]

const DANGEROUS_COMMANDS = [
  "rm -rf",
  "mkfs",
  "dd if=",
  ":(){:|:&};:",
]

export function validatePath(
  path: string,
  operation: "read" | "write" | "execute",
  cwd: string,
): { valid: boolean; reason?: string } {
  const resolvedPath = resolvePath(path, cwd)

  if (resolvedPath.includes("..")) {
    return { valid: false, reason: "Path traversal detected" }
  }

  for (const pattern of PROTECTED_PATHS) {
    if (pattern.test(resolvedPath)) {
      return { valid: false, reason: "Protected path access denied" }
    }
  }

  if (operation === "execute") {
    if (resolvedPath.startsWith("/etc/") || resolvedPath.startsWith("/usr/bin/")) {
      return { valid: false, reason: "System directory write not allowed" }
    }
  }

  return { valid: true }
}

export function checkBashCommand(
  command: string,
  cwd: string,
): { safe: boolean; reason?: string } {
  for (const dangerous of DANGEROUS_COMMANDS) {
    if (command.includes(dangerous)) {
      return { safe: false, reason: `Dangerous command pattern: ${dangerous}` }
    }
  }

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      return { safe: false, reason: `Dangerous pattern detected: ${pattern}` }
    }
  }

  const pathMatch = command.match(/'(\/[^\s']+)'|"(\/[^\s"]+)"/g)
  if (pathMatch) {
    for (const match of pathMatch) {
      const path = match.slice(1, -1)
      const validation = validatePath(path, "execute", cwd)
      if (!validation.valid) {
        return { safe: false, reason: validation.reason }
      }
    }
  }

  return { safe: true }
}

function resolvePath(path: string, cwd: string): string {
  if (path.startsWith("/")) {
    return path
  }
  return `${cwd}/${path}`.replace(/\/+\./, "/").replace(/\/\//, "/")
}

export function isReadOnlyCommand(command: string): boolean {
  const readOnlyPatterns = [
    /^\s*cat\s/,
    /^\s*head\s/,
    /^\s*tail\s/,
    /^\s*grep\s/,
    /^\s*ls\s/,
    /^\s*stat\s/,
    /^\s*file\s/,
    /^\s*readlink\s/,
    /^\s*echo\s+[^;]*\s*$/,
  ]

  return readOnlyPatterns.some((pattern) => pattern.test(command))
}
