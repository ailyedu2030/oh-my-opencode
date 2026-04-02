/**
 * Agent Loop Types
 * Claude Code-style AsyncGenerator stateful loop for oh-my-opencode
 */

import type { Message } from "@opencode-ai/sdk"

/**
 * Configuration for the agent loop
 */
export interface AgentLoopConfig {
  /** Model to use for this agent */
  model: string

  /** System prompt for the agent */
  systemPrompt: string

  /** List of available tools */
  tools: AgentTool[]

  /** Permission context */
  permissionContext?: PermissionContext

  /** Maximum turns before forcing compact */
  maxTurns?: number

  /** Task budget in tokens */
  taskBudget?: number

  /** Temperature for model */
  temperature?: number
}

/**
 * Tool registered with the agent
 */
export interface AgentTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

/**
 * Permission context for tool execution
 */
export interface PermissionContext {
  mode: PermissionMode
  cwd: string
  rules?: PermissionRule[]
}

/**
 * Permission modes
 */
export type PermissionMode =
  | "default"
  | "acceptEdits"
  | "bypassPermissions"
  | "dontAsk"
  | "plan"

/**
 * Permission rule
 */
export interface PermissionRule {
  source: "policy" | "user" | "project" | "session" | "command"
  behavior: "allow" | "deny" | "ask"
  toolName: string
  ruleContent?: string
}

/**
 * Agent context maintained across turns
 */
export interface AgentContext {
  messages: Message[]
  toolUseContext: ToolUseContext
  turnCount: number
  taskBudgetRemaining?: number
  abortSignal?: AbortSignal
}

/**
 * Tool use tracking context
 */
export interface ToolUseContext {
  pendingTools: Map<string, ToolUseBlock>
  completedTools: Map<string, ToolResult>
}

/**
 * Tool use block from model response
 */
export interface ToolUseBlock {
  id: string
  name: string
  input: Record<string, unknown>
}

/**
 * Tool result from tool execution
 */
export interface ToolResult {
  toolUseId: string
  toolName: string
  output: unknown
  error?: string
}

/**
 * Events yielded by the agent loop
 */
export type AgentEvent =
  | { type: "stream"; content: string }
  | { type: "tool_use"; tool: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool: string; result: unknown }
  | { type: "compacted"; preTokens: number; postTokens: number }
  | { type: "turn"; turnCount: number }
  | { type: "error"; error: string }
  | { type: "done"; result: AgentResult }

/**
 * Final result from the agent loop
 */
export interface AgentResult {
  message: Message
  turnCount: number
  tokenUsage: TokenUsage
  stopReason: StopReason
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

/**
 * Reasons for stopping the loop
 */
export type StopReason =
  | "end_turn"
  | "max_tokens"
  | "stop_sequence"
  | "tool_use"

/**
 * Compact result from auto-compact
 */
export interface CompactResult {
  boundaryMarker: SystemMessage
  summaryMessages: Message[]
  preCompactTokens: number
  postCompactTokens: number
}

/**
 * System message for compact boundary
 */
export interface SystemMessage {
  type: "system"
  content: TextPart[]
}

/**
 * Text part for message content
 */
export interface TextPart {
  type: "text"
  text: string
}
