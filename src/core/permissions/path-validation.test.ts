import { describe, it, expect } from "bun:test"
import { validatePath, checkBashCommand, isReadOnlyCommand } from "./path-validation"

/// <reference types="bun-types" />

describe("path-validation", () => {
  describe("validatePath", () => {
    it("validates normal path", () => {
      const result = validatePath("/tmp/test.txt", "read", "/tmp")

      expect(result.valid).toBe(true)
    })

    it("rejects path traversal", () => {
      const result = validatePath("/tmp/../../../etc/passwd", "read", "/tmp")

      expect(result.valid).toBe(false)
      expect(result.reason).toContain("traversal")
    })

    it("allows .git/config when cwd is not root", () => {
      const result = validatePath(".git/config", "read", "/project")

      expect(result.valid).toBe(true)
    })

    it("allows .vscode/settings.json when cwd is not root", () => {
      const result = validatePath(".vscode/settings.json", "read", "/project")

      expect(result.valid).toBe(true)
    })

    it("allows .idea/workspace.xml when cwd is not root", () => {
      const result = validatePath(".idea/workspace.xml", "read", "/project")

      expect(result.valid).toBe(true)
    })

    it("rejects execute on /etc", () => {
      const result = validatePath("/etc/passwd", "execute", "/tmp")

      expect(result.valid).toBe(false)
      expect(result.reason).toContain("System directory")
    })

    it("rejects execute on /usr/bin", () => {
      const result = validatePath("/usr/bin/custom-script", "execute", "/tmp")

      expect(result.valid).toBe(false)
      expect(result.reason).toContain("System directory")
    })

    it("allows write to /tmp", () => {
      const result = validatePath("/tmp/test.txt", "write", "/tmp")

      expect(result.valid).toBe(true)
    })

    it("handles relative paths", () => {
      const result = validatePath("test.txt", "read", "/tmp")

      expect(result.valid).toBe(true)
    })

    it("allows .git when cwd is /project", () => {
      const result = validatePath(".git", "read", "/project")

      expect(result.valid).toBe(true)
    })

    it("allows .vscode when cwd is /project", () => {
      const result = validatePath(".vscode", "read", "/project")

      expect(result.valid).toBe(true)
    })
  })

  describe("checkBashCommand", () => {
    it("detects rm -rf command", () => {
      const result = checkBashCommand("rm -rf /tmp/test", "/tmp")

      expect(result.safe).toBe(false)
      expect(result.reason).toContain("Dangerous command")
    })

    it("detects mkfs command", () => {
      const result = checkBashCommand("mkfs.ext4 /dev/sda", "/tmp")

      expect(result.safe).toBe(false)
      expect(result.reason).toContain("Dangerous command")
    })

    it("detects dd command", () => {
      const result = checkBashCommand("dd if=/dev/zero of=/dev/null", "/tmp")

      expect(result.safe).toBe(false)
      expect(result.reason).toContain("Dangerous command")
    })

    it("detects pipe to sh", () => {
      const result = checkBashCommand("echo 'malicious' | sh", "/tmp")

      expect(result.safe).toBe(false)
      expect(result.reason).toContain("Dangerous pattern")
    })

    it("detects && rm pattern", () => {
      const result = checkBashCommand("mkdir /tmp/test && rm -rf /tmp/test", "/tmp")

      expect(result.safe).toBe(false)
      expect(result.reason).toContain("Dangerous")
    })

    it("detects redirect to /dev", () => {
      const result = checkBashCommand("cat /dev/null > /dev/full", "/tmp")

      expect(result.safe).toBe(false)
      expect(result.reason).toContain("Dangerous pattern")
    })

    it("allows safe commands", () => {
      const result = checkBashCommand("ls -la /tmp", "/tmp")

      expect(result.safe).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it("allows git commands", () => {
      const result = checkBashCommand("git status", "/project")

      expect(result.safe).toBe(true)
    })

    it("allows npm commands", () => {
      const result = checkBashCommand("npm install", "/project")

      expect(result.safe).toBe(true)
    })
  })

  describe("isReadOnlyCommand", () => {
    it("identifies cat as read-only", () => {
      expect(isReadOnlyCommand("cat /tmp/test.txt")).toBe(true)
    })

    it("identifies head as read-only", () => {
      expect(isReadOnlyCommand("head -n 10 /tmp/test.txt")).toBe(true)
    })

    it("identifies tail as read-only", () => {
      expect(isReadOnlyCommand("tail -f /tmp/test.txt")).toBe(true)
    })

    it("identifies grep as read-only", () => {
      expect(isReadOnlyCommand("grep 'pattern' /tmp/test.txt")).toBe(true)
    })

    it("identifies ls as read-only", () => {
      expect(isReadOnlyCommand("ls -la /tmp")).toBe(true)
    })

    it("identifies stat as read-only", () => {
      expect(isReadOnlyCommand("stat /tmp/test.txt")).toBe(true)
    })

    it("identifies file as read-only", () => {
      expect(isReadOnlyCommand("file /tmp/test.txt")).toBe(true)
    })

    it("identifies readlink as read-only", () => {
      expect(isReadOnlyCommand("readlink /tmp/link")).toBe(true)
    })

    it("identifies simple echo as read-only", () => {
      expect(isReadOnlyCommand("echo 'hello'")).toBe(true)
    })

    it("matches echo with redirect in isReadOnlyCommand", () => {
      expect(isReadOnlyCommand("echo 'hello' > /tmp/test.txt")).toBe(true)
    })

    it("does not identify rm as read-only", () => {
      expect(isReadOnlyCommand("rm /tmp/test.txt")).toBe(false)
    })

    it("does not identify mv as read-only", () => {
      expect(isReadOnlyCommand("mv /tmp/a /tmp/b")).toBe(false)
    })

    it("does not identify cp as read-only", () => {
      expect(isReadOnlyCommand("cp /tmp/a /tmp/b")).toBe(false)
    })
  })
})
