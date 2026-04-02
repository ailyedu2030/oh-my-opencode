import { describe, it, expect } from "bun:test"
import { checkPermission } from "./permission-pipeline"
import type { PermissionContext, PermissionRule } from "./permission-types"

/// <reference types="bun-types" />

describe("permission-pipeline", () => {
  describe("checkPermission", () => {
    it("denies when tool matches alwaysDenyRules", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: ["bash:*", "rm"],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkPermission("bash:run", {}, context)

      expect(result.behavior).toBe("deny")
      expect((result as { reason: string }).reason).toContain("always-deny")
    })

    it("asks when tool matches alwaysAskRules", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: ["write:*", "Edit"],
      }

      const result = checkPermission("write:file", {}, context)

      expect(result.behavior).toBe("ask")
      expect((result as { reason: string }).reason).toContain("always-ask")
    })

    it("allows when tool matches alwaysAllowRules", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: ["Read", "glob:*"],
        alwaysAskRules: [],
      }

      const result = checkPermission("glob:search", {}, context)

      expect(result.behavior).toBe("allow")
      expect("reason" in result).toBe(false)
    })

    it("bypassPermissions does not override alwaysDenyRules", () => {
      const context: PermissionContext = {
        mode: "bypassPermissions",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: ["bash:*"],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkPermission("bash:run", { command: "rm -rf /" }, context)

      expect(result.behavior).toBe("deny")
    })

    it("allows non-matching tool in bypassPermissions mode", () => {
      const context: PermissionContext = {
        mode: "bypassPermissions",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: ["bash:*"],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkPermission("Read", { filePath: "/tmp/test" }, context)

      expect(result.behavior).toBe("allow")
      expect("reason" in result).toBe(false)
    })

    it("denies all modifications in plan mode", () => {
      const context: PermissionContext = {
        mode: "plan",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: ["Read"],
        alwaysAskRules: [],
      }

      const result = checkPermission("write:file", {}, context)

      expect(result.behavior).toBe("deny")
      expect((result as { reason: string }).reason).toContain("Plan mode")
    })

    it("applies custom deny rule", () => {
      const rule: PermissionRule = {
        source: "user",
        behavior: "deny",
        toolName: "bash:run",
        ruleContent: "no rm",
      }
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [rule],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkPermission("bash:run", {}, context)

      expect(result.behavior).toBe("deny")
      expect((result as { reason: string }).reason).toContain("Matched deny rule")
    })

    it("applies custom ask rule", () => {
      const rule: PermissionRule = {
        source: "project",
        behavior: "ask",
        toolName: "Bash",
        ruleContent: "ask before exec",
      }
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [rule],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkPermission("Bash", {}, context)

      expect(result.behavior).toBe("ask")
      expect((result as { reason: string }).reason).toContain("Matched ask rule")
    })

    it("returns passthrough when no rule matches", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkPermission("Read", { filePath: "/tmp/test" }, context)

      expect(result.behavior).toBe("passthrough")
    })

    it("matches wildcard patterns in alwaysDenyRules", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: ["dangerous:*"],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkPermission("dangerous:operation", {}, context)

      expect(result.behavior).toBe("deny")
    })

    it("matches glob star patterns", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: ["exec*"],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkPermission("execute:run", {}, context)

      expect(result.behavior).toBe("deny")
    })

    it("rule with undefined ruleContent does not match", () => {
      const rule: PermissionRule = {
        source: "user",
        behavior: "deny",
        toolName: "CustomTool",
      }
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [rule],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkPermission("CustomTool", {}, context)

      expect(result.behavior).toBe("passthrough")
    })
  })
})
