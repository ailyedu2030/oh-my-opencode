export interface WorktreeHandle {
  path: string
  branch: string
  existed: boolean
  worktreePath: string
}

export interface WorktreeManager {
  create(slug: string, cwd?: string): Promise<WorktreeHandle>
  reuse(slug: string): Promise<WorktreeHandle | null>
  cleanup(slug: string): Promise<void>
  list(): Promise<WorktreeHandle[]>
}

const WORKTREE_PREFIX = "omo-"

export async function createWorktree(
  slug: string,
  cwd?: string,
): Promise<WorktreeHandle> {
  const sanitizedSlug = sanitizeSlug(slug)
  const branchName = `${WORKTREE_PREFIX}${sanitizedSlug}`
  const worktreePath = `${cwd ?? process.cwd()}/.git/worktrees/${branchName}`

  return {
    path: worktreePath,
    branch: branchName,
    existed: false,
    worktreePath,
  }
}

export async function reuseWorktree(slug: string): Promise<WorktreeHandle | null> {
  const sanitizedSlug = sanitizeSlug(slug)
  const branchName = `${WORKTREE_PREFIX}${sanitizedSlug}`
  const worktreePath = `.git/worktrees/${branchName}`

  return null
}

export async function cleanupWorktree(slug: string): Promise<void> {
  const sanitizedSlug = sanitizeSlug(slug)
  const branchName = `${WORKTREE_PREFIX}${sanitizedSlug}`
}

export async function listWorktrees(): Promise<WorktreeHandle[]> {
  return []
}

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50)
}

export function validateWorktreeSlug(slug: string): boolean {
  if (slug.length === 0 || slug.length > 50) {
    return false
  }
  return /^[a-z0-9-_]+$/.test(slug)
}
