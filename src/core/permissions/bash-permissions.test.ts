import { describe, it, expect } from "bun:test"
import { checkBashPermission, parseBashCommand } from "./bash-permissions"
import type { PermissionContext } from "./permission-types"

/// <reference types="bun-types" />

describe("bash-permissions", () => {
  describe("checkBashPermission", () => {
    it("denies dangerous commands", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkBashPermission(
        { command: "rm -rf /tmp/test", cwd: "/tmp", context },
      )

      expect(result.behavior).toBe("deny")
    })

    it("denies fork bomb", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkBashPermission(
        { command: ":(){:|:&};:", cwd: "/tmp", context },
      )

      expect(result.behavior).toBe("deny")
    })

    it("allows read-only commands", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkBashPermission(
        { command: "cat /tmp/test.txt", cwd: "/tmp", context },
      )

      expect(result.behavior).toBe("allow")
    })

    it("allows ls command", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkBashPermission(
        { command: "ls -la /tmp", cwd: "/tmp", context },
      )

      expect(result.behavior).toBe("allow")
    })

    it("allows read-only cat in plan mode", () => {
      const context: PermissionContext = {
        mode: "plan",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkBashPermission(
        { command: "cat /tmp/test.txt", cwd: "/tmp", context },
      )

      expect(result.behavior).toBe("allow")
    })

    it("denies write command in plan mode", () => {
      const context: PermissionContext = {
        mode: "plan",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkBashPermission(
        { command: "write:file /tmp/test.txt", cwd: "/tmp", context },
      )

      expect(result.behavior).toBe("deny")
      expect((result as { reason: string }).reason).toContain("Plan mode")
    })

    it("denies in dontAsk mode for non-read-only", () => {
      const context: PermissionContext = {
        mode: "dontAsk",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkBashPermission(
        { command: "mkdir /tmp/newdir", cwd: "/tmp", context },
      )

      expect(result.behavior).toBe("deny")
      expect((result as { reason: string }).reason).toContain("dontAsk mode")
    })

    it("returns passthrough for unknown commands", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkBashPermission(
        { command: "custom-script.sh", cwd: "/tmp", context },
      )

      expect(result.behavior).toBe("passthrough")
    })

    it("allows echo command", () => {
      const context: PermissionContext = {
        mode: "default",
        cwd: "/tmp",
        rules: [],
        alwaysDenyRules: [],
        alwaysAllowRules: [],
        alwaysAskRules: [],
      }

      const result = checkBashPermission(
        { command: "echo 'hello world'", cwd: "/tmp", context },
      )

      expect(result.behavior).toBe("allow")
    })
  })

  describe("parseBashCommand", () => {
    it("parses simple command", () => {
      const result = parseBashCommand("ls -la /tmp")

      expect(result.cmd).toBe("ls")
      expect(result.args).toEqual(["/tmp"])
      expect(result.flags).toEqual(["-la"])
    })

    it("parses command with multiple args", () => {
      const result = parseBashCommand("git commit -m 'fix bug'")

      expect(result.cmd).toBe("git")
      expect(result.args).toEqual(["commit", "'fix", "bug'"])
      expect(result.flags).toEqual(["-m"])
    })

    it("parses empty string", () => {
      const result = parseBashCommand("")

      expect(result.cmd).toBe("")
      expect(result.args).toEqual([])
      expect(result.flags).toEqual([])
    })

    it("treats double-dash as arg not flag", () => {
      const result = parseBashCommand("npm test -- --coverage")

      expect(result.cmd).toBe("npm")
      expect(result.args).toEqual(["test"])
      expect(result.flags).toEqual(["--", "--coverage"])
    })

    it("debug parseBashCommand structure", () => {
      const result = parseBashCommand("a b c")
      expect(result.cmd).toBe("a")
      expect(result.args).toEqual(["b", "c"])
    })

    it("treats double-dash as flag since it starts with dash", () => {
      const result = parseBashCommand("npm test -- --coverage")

      expect(result.cmd).toBe("npm")
      expect(result.args).toEqual(["test"])
      expect(result.flags).toEqual(["--", "--coverage"])
    })

    it("debug npm command parsing", () => {
      const result = parseBashCommand("npm test -- --coverage")
      console.log("npm test result:", JSON.stringify(result))
      expect(result.cmd).toBe("npm")
      expect(result.args.length).toBeGreaterThan(0)
    })
  })
})
