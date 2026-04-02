import { describe, it, expect } from "bun:test"
import { z } from "zod"
import { StreamingToolExecutor, buildToolRegistry } from "./streaming-executor"
import type { Tool, ToolContext, ToolUse } from "./tool-types"

/// <reference types="bun-types" />

describe("streaming-executor", () => {
  describe("StreamingToolExecutor", () => {
    const context: ToolContext = { cwd: "/tmp", sessionID: "test" }

    function createMockTool(name: string): Tool<unknown, string> {
      return {
        name,
        description: `Mock tool ${name}`,
        inputSpec: z.unknown(),
        call: async () => `result from ${name}`,
      }
    }

    describe("execute", () => {
      it("executes single tool", async () => {
        const executor = new StreamingToolExecutor()
        const tool = createMockTool("tool1")
        const registry = buildToolRegistry([tool])
        const toolUses: ToolUse[] = [
          { id: "1", name: "tool1", input: {} },
        ]

        const events: string[] = []
        const gen = executor.execute(toolUses, registry, context, {
          parallel: false,
          maxConcurrency: 1,
        })

        for await (const event of gen) {
          if (event.type === "result") {
            events.push(JSON.stringify(event))
          }
        }

        expect(events.length).toBe(1)
      })

      it("returns error for unknown tool", async () => {
        const executor = new StreamingToolExecutor()
        const registry = buildToolRegistry([])
        const toolUses: ToolUse[] = [
          { id: "1", name: "unknown-tool", input: {} },
        ]

        let errorFound = false
        const gen = executor.execute(toolUses, registry, context, {
          parallel: false,
          maxConcurrency: 1,
        })

        for await (const event of gen) {
          if (event.type === "result" && event.error) {
            expect(event.error).toContain("Tool not found")
            errorFound = true
          }
        }

        expect(errorFound).toBe(true)
      })

      it("returns error for invisible tool", async () => {
        const executor = new StreamingToolExecutor()
        const tool = createMockTool("invisible-tool")
        tool.isVisible = () => false
        const registry = buildToolRegistry([tool])
        const toolUses: ToolUse[] = [
          { id: "1", name: "invisible-tool", input: {} },
        ]

        let errorFound = false
        const gen = executor.execute(toolUses, registry, context, {
          parallel: false,
          maxConcurrency: 1,
        })

        for await (const event of gen) {
          if (event.type === "result" && event.error) {
            expect(event.error).toContain("Tool not visible")
            errorFound = true
          }
        }

        expect(errorFound).toBe(true)
      })

      it("returns error for disabled tool", async () => {
        const executor = new StreamingToolExecutor()
        const tool = createMockTool("disabled-tool")
        tool.isEnabled = () => false
        const registry = buildToolRegistry([tool])
        const toolUses: ToolUse[] = [
          { id: "1", name: "disabled-tool", input: {} },
        ]

        let errorFound = false
        const gen = executor.execute(toolUses, registry, context, {
          parallel: false,
          maxConcurrency: 1,
        })

        for await (const event of gen) {
          if (event.type === "result" && event.error) {
            expect(event.error).toContain("Tool not enabled")
            errorFound = true
          }
        }

        expect(errorFound).toBe(true)
      })

      it("handles parallel execution via returned results", async () => {
        const executor = new StreamingToolExecutor()
        const tools = [
          createMockTool("parallel1"),
          createMockTool("parallel2"),
        ]
        const registry = buildToolRegistry(tools)
        const toolUses: ToolUse[] = [
          { id: "1", name: "parallel1", input: {} },
          { id: "2", name: "parallel2", input: {} },
        ]

        const gen = executor.execute(toolUses, registry, context, {
          parallel: true,
          maxConcurrency: 2,
        })

        const returnedResults = await gen.next()
        console.log("returnedResults:", JSON.stringify(returnedResults))
        const finalResults = returnedResults.value as Array<{ toolUseId: string; type: string; result: unknown; error?: string }>

        expect(finalResults.length).toBe(2)
      })

      it("handles tool execution errors via returned results", async () => {
        const executor = new StreamingToolExecutor()
        const tool: Tool<unknown, string> = {
          name: "error-tool",
          description: "Tool that errors",
          inputSpec: z.unknown(),
          call: async () => {
            throw new Error("Tool failed")
          },
        }
        const registry = buildToolRegistry([tool])
        const toolUses: ToolUse[] = [
          { id: "1", name: "error-tool", input: {} },
        ]

        const gen = executor.execute(toolUses, registry, context, {
          parallel: true,
          maxConcurrency: 1,
        })

        const returnedResults = await gen.next()
        const finalResults = returnedResults.value as Array<{ toolUseId: string; type: string; result: unknown; error?: string }>

        expect(finalResults.length).toBe(1)
        expect(finalResults[0].error).toContain("Tool failed")
      })
    })
  })

  describe("buildToolRegistry", () => {
    it("creates registry from tool array", () => {
      const tool1: Tool<unknown, unknown> = {
        name: "tool1",
        description: "Tool 1",
        inputSpec: z.unknown(),
        call: async () => {},
      }
      const tool2: Tool<unknown, unknown> = {
        name: "tool2",
        description: "Tool 2",
        inputSpec: z.unknown(),
        call: async () => {},
      }

      const registry = buildToolRegistry([tool1, tool2])

      expect(registry.size).toBe(2)
      expect(registry.get("tool1")).toBe(tool1)
      expect(registry.get("tool2")).toBe(tool2)
    })

    it("overwrites duplicate tool names", () => {
      const tool1: Tool<unknown, unknown> = {
        name: "duplicate",
        description: "Tool 1",
        inputSpec: z.unknown(),
        call: async () => {},
      }
      const tool2: Tool<unknown, unknown> = {
        name: "duplicate",
        description: "Tool 2",
        inputSpec: z.unknown(),
        call: async () => {},
      }

      const registry = buildToolRegistry([tool1, tool2])

      expect(registry.size).toBe(1)
      expect(registry.get("duplicate")).toBe(tool2)
    })

    it("returns empty registry for empty array", () => {
      const registry = buildToolRegistry([])

      expect(registry.size).toBe(0)
    })
  })
})
