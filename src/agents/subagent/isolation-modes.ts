export type IsolationMode = "in-process" | "fork" | "worktree" | "remote"

export interface SubagentConfig {
  name: string
  prompt: string
  isolation: IsolationMode
  model?: string
  tools?: string[]
  permissionMode?: string
  worktreeSlug?: string
}

export interface SubagentHandle {
  id: string
  name: string
  isolation: IsolationMode
  startedAt: number
  cwd?: string
  branch?: string
}

export interface ForkOptions {
  directive: string
  placeholderResult?: string
}

export interface WorktreeOptions {
  slug: string
  cwd?: string
  branch?: string
}

export const FORK_PLACEHOLDER_RESULT = "Fork started — processing in background"

export function getIsolationModeDescription(mode: IsolationMode): string {
  const descriptions: Record<IsolationMode, string> = {
    "in-process": "Shared process with AsyncLocalStorage isolation",
    fork: "Subprocess with API cache optimization for parallel work",
    worktree: "Git worktree for directory-level isolation",
    remote: "CCR remote session for full isolation",
  }
  return descriptions[mode]
}
