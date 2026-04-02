import { z } from "zod"

export interface ToolContext {
  cwd: string
  sessionID: string
  toolCallID?: string
}

export type PermissionResult =
  | { behavior: "allow" }
  | { behavior: "deny"; reason: string }
  | { behavior: "ask"; reason: string; prompt?: string }

export interface Tool<Input, Output, Progress = unknown> {
  name: string
  description: string
  inputSpec: z.ZodType<Input> | Record<string, unknown>
  call(input: Input, context: ToolContext): Promise<Output>
  stream?: (
    input: Input,
    context: ToolContext,
  ) => AsyncGenerator<Progress, Output>
  checkPermissions?: (
    input: Input,
    context: ToolContext,
  ) => PermissionResult
  requiresUserInteraction?: () => boolean
  isVisible?: (context: ToolContext) => boolean
  isEnabled?: (context: ToolContext) => boolean
}

export interface ToolConfig<Input, Output, Progress = unknown> {
  name: string
  description: string
  inputSpec: z.ZodType<Input> | Record<string, unknown>
  execute: (input: Input, context: ToolContext) => Promise<Output>
  stream?: (input: Input, context: ToolContext) => AsyncGenerator<Progress, Output>
  checkPermissions?: (
    input: Input,
    context: ToolContext,
  ) => PermissionResult
  requiresUserInteraction?: () => boolean
  isVisible?: (context: ToolContext) => boolean
  isEnabled?: (context: ToolContext) => boolean
}

export interface ToolUse {
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ToolProgress {
  toolUseId: string
  type: "progress"
  progress: unknown
}

export interface ToolFinalResult {
  toolUseId: string
  type: "result"
  result: unknown
  error?: string
}

export type ToolExecutionEvent = ToolProgress | ToolFinalResult

export interface ToolExecutionOptions {
  parallel: boolean
  maxConcurrency: number
  timeout?: number
  signal?: AbortSignal
}
