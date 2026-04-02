import type {
  Tool,
  ToolConfig,
  ToolContext,
  PermissionResult,
} from "./tool-types"

export function buildTool<Input, Output, Progress>(
  config: ToolConfig<Input, Output, Progress>,
): Tool<Input, Output, Progress> {
  return {
    name: config.name,
    description: config.description,
    inputSpec: config.inputSpec,
    call: config.execute,
    stream: config.stream,
    checkPermissions: config.checkPermissions,
    requiresUserInteraction: config.requiresUserInteraction,
    isVisible: config.isVisible,
    isEnabled: config.isEnabled,
  }
}

export function validateToolInput<T>(
  tool: Tool<T, unknown>,
  input: unknown,
): { valid: true; data: T } | { valid: false; error: string } {
  try {
    if ("parse" in tool.inputSpec && typeof tool.inputSpec.parse === "function") {
      const result = tool.inputSpec.parse(input)
      return { valid: true, data: result as T }
    }
    return { valid: true, data: input as T }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid input"
    return { valid: false, error: message }
  }
}

export function checkToolVisibility(
  tool: Tool<unknown, unknown>,
  context: ToolContext,
): boolean {
  if (tool.isVisible && !tool.isVisible(context)) {
    return false
  }
  return true
}

export function checkToolEnabled(
  tool: Tool<unknown, unknown>,
  context: ToolContext,
): boolean {
  if (tool.isEnabled && !tool.isEnabled(context)) {
    return false
  }
  return true
}

export function getToolPermission(
  tool: Tool<unknown, unknown>,
  input: unknown,
  context: ToolContext,
): PermissionResult {
  if (tool.checkPermissions) {
    return tool.checkPermissions(input, context)
  }
  return { behavior: "allow" }
}

export function parseToolName(toolName: string): { namespace: string; name: string } {
  const parts = toolName.split(":")
  if (parts.length === 2) {
    return { namespace: parts[0], name: parts[1] }
  }
  return { namespace: "builtin", name: toolName }
}
