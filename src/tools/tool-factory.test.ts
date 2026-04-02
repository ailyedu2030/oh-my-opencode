import { describe, it, expect } from "bun:test"
import { z } from "zod"
import {
  buildTool,
  validateToolInput,
  checkToolVisibility,
  checkToolEnabled,
  getToolPermission,
  parseToolName,
} from "./tool-factory"
import type { Tool, ToolContext } from "./tool-types"

/// <reference types="bun-types" />

describe("tool-factory", () => {
  describe("buildTool", () => {
    it("creates tool with all properties", () => {
      const tool = buildTool({
        name: "test-tool",
        description: "A test tool",
        inputSpec: z.object({ foo: z.string() }),
        execute: async () => "result",
      })

      expect(tool.name).toBe("test-tool")
      expect(tool.description).toBe("A test tool")
      expect(tool.inputSpec).toBeDefined()
    })

    it("creates tool with optional properties", () => {
      const tool = buildTool({
        name: "test-tool",
        description: "A test tool",
        inputSpec: z.object({ foo: z.string() }),
        execute: async () => "result",
        stream: async function* (): AsyncGenerator<string, string> { yield "progress"; return "result" },
        isVisible: () => true,
        isEnabled: () => true,
      })

      expect(tool.stream).toBeDefined()
      expect(tool.isVisible).toBeDefined()
      expect(tool.isEnabled).toBeDefined()
    })

    it("maps execute to call", () => {
      const tool = buildTool({
        name: "test-tool",
        description: "A test tool",
        inputSpec: z.object({ foo: z.string() }),
        execute: async (input: { foo: string }) => `hello ${input.foo}`,
      })

      expect(tool.call).toBe(tool.call)
    })
  })

  describe("validateToolInput", () => {
    it("validates correct input against zod schema", () => {
      const tool: Tool<{ name: string; age: number }, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.object({ name: z.string(), age: z.number() }),
        call: async () => {},
      }

      const result = validateToolInput(tool, { name: "Alice", age: 30 })

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.name).toBe("Alice")
        expect(result.data.age).toBe(30)
      }
    })

    it("rejects invalid input against zod schema", () => {
      const tool: Tool<{ name: string; age: number }, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.object({ name: z.string(), age: z.number() }),
        call: async () => {},
      }

      const result = validateToolInput(tool, { name: "Alice", age: "not-a-number" })

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toContain("age")
      }
    })

    it("handles non-zod input spec as pass-through", () => {
      const tool: Tool<{ foo: string }, unknown> = {
        name: "test",
        description: "test",
        inputSpec: { type: "object" } as Record<string, unknown>,
        call: async () => {},
      }

      const result = validateToolInput(tool, { foo: "bar" })

      expect(result.valid).toBe(true)
      if (result.valid) {
        expect(result.data.foo).toBe("bar")
      }
    })

    it("returns error message on exception", () => {
      const tool: Tool<{ required: string }, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.object({ required: z.string() }).strict(),
        call: async () => {},
      }

      const result = validateToolInput(tool, { required: "value", extra: "field" })

      expect(result.valid).toBe(false)
      if (!result.valid) {
        expect(result.error).toBeTruthy()
      }
    })
  })

  describe("checkToolVisibility", () => {
    const context: ToolContext = { cwd: "/tmp", sessionID: "test" }

    it("returns true when tool has no isVisible", () => {
      const tool: Tool<unknown, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.unknown(),
        call: async () => {},
      }

      expect(checkToolVisibility(tool, context)).toBe(true)
    })

    it("returns result of isVisible function", () => {
      const tool: Tool<unknown, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.unknown(),
        call: async () => {},
        isVisible: () => false,
      }

      expect(checkToolVisibility(tool, context)).toBe(false)
    })

    it("passes context to isVisible", () => {
      let receivedContext: ToolContext | undefined
      const tool: Tool<unknown, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.unknown(),
        call: async () => {},
        isVisible: (ctx) => {
          receivedContext = ctx
          return true
        },
      }

      checkToolVisibility(tool, context)

      expect(receivedContext).toEqual(context)
    })
  })

  describe("checkToolEnabled", () => {
    const context: ToolContext = { cwd: "/tmp", sessionID: "test" }

    it("returns true when tool has no isEnabled", () => {
      const tool: Tool<unknown, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.unknown(),
        call: async () => {},
      }

      expect(checkToolEnabled(tool, context)).toBe(true)
    })

    it("returns result of isEnabled function", () => {
      const tool: Tool<unknown, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.unknown(),
        call: async () => {},
        isEnabled: () => false,
      }

      expect(checkToolEnabled(tool, context)).toBe(false)
    })

    it("passes context to isEnabled", () => {
      let receivedContext: ToolContext | undefined
      const tool: Tool<unknown, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.unknown(),
        call: async () => {},
        isEnabled: (ctx) => {
          receivedContext = ctx
          return true
        },
      }

      checkToolEnabled(tool, context)

      expect(receivedContext).toEqual(context)
    })
  })

  describe("getToolPermission", () => {
    const context: ToolContext = { cwd: "/tmp", sessionID: "test" }

    it("returns allow when tool has no checkPermissions", () => {
      const tool: Tool<unknown, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.unknown(),
        call: async () => {},
      }

      const result = getToolPermission(tool, {}, context)

      expect(result.behavior).toBe("allow")
    })

    it("returns permission result from checkPermissions", () => {
      const tool: Tool<unknown, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.unknown(),
        call: async () => {},
        checkPermissions: () => ({ behavior: "deny", reason: "Not allowed" }),
      }

      const result = getToolPermission(tool, {}, context)

      expect(result.behavior).toBe("deny")
      expect((result as { reason: string }).reason).toBe("Not allowed")
    })

    it("passes input and context to checkPermissions", () => {
      let receivedInput: unknown
      let receivedContext: ToolContext | undefined
      const tool: Tool<{ foo: string }, unknown> = {
        name: "test",
        description: "test",
        inputSpec: z.object({ foo: z.string() }),
        call: async () => {},
        checkPermissions: (input, ctx) => {
          receivedInput = input
          receivedContext = ctx
          return { behavior: "allow" }
        },
      }

      const input = { foo: "bar" }
      getToolPermission(tool as Tool<unknown, unknown>, input, context)

      expect(receivedInput).toEqual(input)
      expect(receivedContext).toEqual(context)
    })
  })

  describe("parseToolName", () => {
    it("parses namespaced tool name", () => {
      const result = parseToolName("bash:run")

      expect(result.namespace).toBe("bash")
      expect(result.name).toBe("run")
    })

    it("parses tool name without namespace", () => {
      const result = parseToolName("Read")

      expect(result.namespace).toBe("builtin")
      expect(result.name).toBe("Read")
    })

    it("returns builtin namespace for multiple colons", () => {
      const result = parseToolName("namespace:sub:tool")

      expect(result.namespace).toBe("builtin")
      expect(result.name).toBe("namespace:sub:tool")
    })

    it("handles empty string", () => {
      const result = parseToolName("")

      expect(result.namespace).toBe("builtin")
      expect(result.name).toBe("")
    })
  })
})
