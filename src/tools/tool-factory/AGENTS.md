# src/tools/tool-factory.ts — Tool Builder Utilities

**Generated:** 2026-02-21 | **Branch:** dev

## OVERVIEW

Factory functions for building, validating, and managing OpenCode tools with permission pipeline support.

## CORE FUNCTIONS

### buildTool

Creates a standardized Tool object:

```typescript
function buildTool<Input, Output, Progress>(
  config: ToolConfig<Input, Output, Progress>
): Tool<Input, Output, Progress>
```

**ToolConfig shape:**
```typescript
interface ToolConfig<Input, Output, Progress> {
  name: string
  description: string
  inputSpec: InputSpec        // JSON Schema or parse function
  execute: ExecuteFunction
  stream?: StreamFunction
  checkPermissions?: PermissionChecker
  requiresUserInteraction?: boolean
  isVisible?: VisibilityFn
  isEnabled?: EnabledFn
}
```

### validateToolInput

Validates input against tool's input spec:

```typescript
function validateToolInput<T>(
  tool: Tool<T, unknown>,
  input: unknown
): { valid: true; data: T } | { valid: false; error: string }
```

**Logic:**
1. If `inputSpec.parse` exists, use it
2. Otherwise, cast directly
3. Catch and format errors

### checkToolVisibility

Determines if tool should be shown to user:

```typescript
function checkToolVisibility(
  tool: Tool<unknown, unknown>,
  context: ToolContext
): boolean
```

### checkToolEnabled

Determines if tool can be executed:

```typescript
function checkToolEnabled(
  tool: Tool<unknown, unknown>,
  context: ToolContext
): boolean
```

### getToolPermission

Runs permission check pipeline:

```typescript
function getToolPermission(
  tool: Tool<unknown, unknown>,
  input: unknown,
  context: ToolContext
): PermissionResult
// Returns: { behavior: "allow" | "deny" | "prompt", reason?: string }
```

### parseToolName

Parses namespaced tool names:

```typescript
function parseToolName("playwright:click")
// → { namespace: "playwright", name: "click" }

function parseToolName("read")
// → { namespace: "builtin", name: "read" }
```

## TOOL INTERFACE

```typescript
interface Tool<Input, Output, Progress> {
  name: string
  description: string
  inputSpec: InputSpec
  call: (input: Input, context: ToolContext) => Promise<Output>
  stream?: (input: Input, context: ToolContext, onProgress: (p: Progress) => void) => Promise<Output>
  checkPermissions?: (input: Input, context: ToolContext) => PermissionResult
  requiresUserInteraction?: boolean
  isVisible?: (context: ToolContext) => boolean
  isEnabled?: (context: ToolContext) => boolean
}
```

## PERMISSION PIPELINE

```
Tool Call Request
  │
  ├─→ checkToolEnabled()  ──→ Denied? ──→ Block execution
  │
  ├─→ checkToolVisibility() ──→ Hidden? ──→ Exclude from list
  │
  └─→ getToolPermission() ──→ Deny/Prompt? ──→ Handle accordingly
```

## USAGE

```typescript
import { buildTool, validateToolInput, parseToolName } from "./tool-factory"

const myTool = buildTool({
  name: "my-action",
  description: "Does something useful",
  inputSpec: { type: "object", properties: { id: { type: "string" } } },
  execute: async (input) => {
    // Implementation
    return { success: true }
  },
  checkPermissions: (input) => ({ behavior: "allow" }),
})

// Validate before calling
const validation = validateToolInput(myTool, { id: "123" })
if (validation.valid) {
  const result = await myTool.call(validation.data)
}

// Parse tool names
const { namespace, name } = parseToolName("custom:action")
```
