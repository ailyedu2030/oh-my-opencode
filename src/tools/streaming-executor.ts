import type {
  Tool,
  ToolContext,
  ToolUse,
  ToolExecutionEvent,
  ToolFinalResult,
  ToolExecutionOptions,
} from "./tool-types"
import { validateToolInput, checkToolVisibility, checkToolEnabled, getToolPermission } from "./tool-factory"

export class StreamingToolExecutor {
  async *execute(
    tools: ToolUse[],
    toolRegistry: Map<string, Tool<unknown, unknown>>,
    context: ToolContext,
    options: ToolExecutionOptions,
  ): AsyncGenerator<ToolExecutionEvent, ToolFinalResult[], undefined> {
    const results: ToolFinalResult[] = []
    const pending = new Map<string, ToolUse>()

    for (const toolUse of tools) {
      const tool = toolRegistry.get(toolUse.name)
      if (!tool) {
        const error = { toolUseId: toolUse.id, type: "result" as const, result: null, error: `Tool not found: ${toolUse.name}` }
        results.push(error)
        yield error
        continue
      }

      if (!checkToolVisibility(tool, context)) {
        const error = { toolUseId: toolUse.id, type: "result" as const, result: null, error: "Tool not visible" }
        results.push(error)
        yield error
        continue
      }

      if (!checkToolEnabled(tool, context)) {
        const error = { toolUseId: toolUse.id, type: "result" as const, result: null, error: "Tool not enabled" }
        results.push(error)
        yield error
        continue
      }

      const permission = getToolPermission(tool, toolUse.input, context)
      if (permission.behavior === "deny") {
        const error = { toolUseId: toolUse.id, type: "result" as const, result: null, error: `Permission denied: ${permission.reason}` }
        results.push(error)
        yield error
        continue
      }
      if (permission.behavior === "ask") {
        const error = { toolUseId: toolUse.id, type: "result" as const, result: null, error: `Permission requires confirmation: ${permission.reason}` }
        results.push(error)
        yield error
        continue
      }

      pending.set(toolUse.id, toolUse)
    }

    if (options.parallel) {
      const running: Promise<ToolFinalResult>[] = []
      const semaphore = new Semaphore(options.maxConcurrency)

      for (const [id, toolUse] of pending) {
        const promise = this.executeSingle(
          id,
          toolUse,
          toolRegistry,
          context,
          options,
          semaphore,
        ).then((result) => {
          results.push(result)
          return result
        })
        running.push(promise)
      }

      await Promise.all(running)
    } else {
      for (const [id, toolUse] of pending) {
        const result = await this.executeSingleSequential(
          id,
          toolUse,
          toolRegistry,
          context,
          options,
        )
        results.push(result)
        yield result
      }
    }

    return results
  }

  private async executeSingleSequential(
    id: string,
    toolUse: ToolUse,
    toolRegistry: Map<string, Tool<unknown, unknown>>,
    context: ToolContext,
    options: ToolExecutionOptions,
  ): Promise<ToolFinalResult> {
    const tool = toolRegistry.get(toolUse.name)
    if (!tool) {
      return {
        toolUseId: id,
        type: "result",
        result: null,
        error: `Tool not found: ${toolUse.name}`,
      }
    }

    const permission = getToolPermission(tool, toolUse.input, context)
    if (permission.behavior === "deny") {
      return {
        toolUseId: id,
        type: "result",
        result: null,
        error: `Permission denied: ${permission.reason}`,
      }
    }
    if (permission.behavior === "ask") {
      return {
        toolUseId: id,
        type: "result",
        result: null,
        error: `Permission requires confirmation: ${permission.reason}`,
      }
    }

    const validation = validateToolInput(tool, toolUse.input)
    if (!validation.valid) {
      return {
        toolUseId: id,
        type: "result",
        result: null,
        error: validation.error,
      }
    }

    try {
      const result = await this.executeWithTimeout(
        tool.call(validation.data, context),
        options.timeout,
        options.signal,
      )

      return {
        toolUseId: id,
        type: "result",
        result,
      }
    } catch (err) {
      return {
        toolUseId: id,
        type: "result",
        result: null,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  private async executeSingle(
    id: string,
    toolUse: ToolUse,
    toolRegistry: Map<string, Tool<unknown, unknown>>,
    context: ToolContext,
    options: ToolExecutionOptions,
    semaphore: Semaphore,
  ): Promise<ToolFinalResult> {
    await semaphore.acquire()
    try {
      return await this.executeSingleSequential(
        id,
        toolUse,
        toolRegistry,
        context,
        options,
      )
    } finally {
      semaphore.release()
    }
  }

  private async executeWithTimeout(
    promise: Promise<unknown>,
    timeout: number | undefined,
    signal: AbortSignal | undefined,
  ): Promise<unknown> {
    if (signal?.aborted) {
      throw new Error("Execution aborted")
    }

    const timeoutPromise = timeout
      ? new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Tool execution timeout")), timeout),
        )
      : new Promise<never>((_, reject) => reject(new Error("No timeout set")))

    return Promise.race([promise, timeoutPromise])
  }
}

class Semaphore {
  private permits: number
  private waiting: Array<() => void> = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return
    }

    return new Promise<void>((resolve) => {
      this.waiting.push(resolve)
    })
  }

  release(): void {
    this.permits++
    const next = this.waiting.shift()
    if (next) {
      this.permits--
      next()
    }
  }
}

export function buildToolRegistry(
  tools: Tool<unknown, unknown>[],
): Map<string, Tool<unknown, unknown>> {
  const registry = new Map<string, Tool<unknown, unknown>>()
  for (const tool of tools) {
    registry.set(tool.name, tool)
  }
  return registry
}
