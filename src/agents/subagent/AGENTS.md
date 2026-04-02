# src/agents/subagent/ — Subagent Isolation System

**Generated:** 2026-02-21 | **Branch:** dev

## OVERVIEW

Multi-mode subagent isolation system supporting in-process, fork, worktree, and remote execution contexts.

## ISOLATION MODES

| Mode | Description | Use Case |
|------|-------------|----------|
| `in-process` | Shared process with AsyncLocalStorage isolation | Low-latency, same workspace |
| `fork` | Subprocess with API cache optimization | Parallel independent work |
| `worktree` | Git worktree for directory-level isolation | Parallel work needing isolated FS |
| `remote` | CCR remote session for full isolation | Maximum isolation, different environment |

## CORE TYPES

```typescript
type IsolationMode = "in-process" | "fork" | "worktree" | "remote"

interface SubagentConfig {
  name: string
  prompt: string
  isolation: IsolationMode
  model?: string
  tools?: string[]
  permissionMode?: string
  worktreeSlug?: string
}

interface SubagentHandle {
  id: string
  name: string
  isolation: IsolationMode
  startedAt: number
  cwd?: string
  branch?: string
}
```

## SUBAGENT RESOLVER

Routes subagent creation requests to appropriate isolation mode:

```
subagent-resolver.ts
  └─→ resolveSubagent(config)
      ├─→ in-process:  Direct agent factory invocation
      ├─→ fork:        Spawn child process with cache
      ├─→ worktree:    Git worktree via worktree-manager
      └─→ remote:      CCR API call
```

## WORKTREE MANAGER

Git worktree lifecycle for `worktree` isolation mode:

```typescript
interface WorktreeOptions {
  slug: string      // Unique identifier
  cwd?: string      // Working directory
  branch?: string   // Branch name
}

// Operations: create, delete, list, exists
```

## SUBAGENT REGISTRY

Tracks active subagent handles:

```typescript
SubagentRegistry.getHandle(id): SubagentHandle | undefined
SubagentRegistry.listHandles(): SubagentHandle[]
SubagentRegistry.removeHandle(id): void
```

## ISOLATION MODE DESCRIPTIONS

```typescript
getIsolationModeDescription(mode)
// "in-process":     "Shared process with AsyncLocalStorage isolation"
// "fork":           "Subprocess with API cache optimization for parallel work"
// "worktree":       "Git worktree for directory-level isolation"
// "remote":         "CCR remote session for full isolation"
```

## FORK OPTIONS

```typescript
interface ForkOptions {
  directive: string                    // Instruction for forked agent
  placeholderResult?: string           // Immediate return value
}

const FORK_PLACEHOLDER_RESULT = "Fork started — processing in background"
```

## USAGE

```typescript
import { isolationModes } from "./isolation-modes"
import { createForkSubagent } from "./fork-subagent"
import { createWorktreeManager } from "./worktree-manager"

// Fork a subagent
const handle = await createForkSubagent({
  name: "worker-1",
  prompt: "Analyze the codebase...",
  isolation: "fork",
  directive: "Run analysis",
})
```
