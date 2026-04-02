import { describe, expect, it } from "bun:test"
import {
  classifyError,
  CircuitBreaker,
  EnhancedError,
  ResourceError,
  TransientError,
  withRetry,
} from "./error-handling"

describe("Error Handling", () => {
  describe("EnhancedError", () => {
    it("#when created #then should have correct properties", () => {
      const error = new EnhancedError("Test error", "TEST_CODE", {
        recoverable: true,
        context: { foo: "bar" },
      })

      expect(error.message).toBe("Test error")
      expect(error.code).toBe("TEST_CODE")
      expect(error.recoverable).toBe(true)
      expect(error.context).toEqual({ foo: "bar" })
      expect(error.name).toBe("EnhancedError")
    })

    it("#when converted to JSON #then should be serializable", () => {
      const error = new EnhancedError("Test", "CODE", {
        recoverable: false,
        context: { key: "value" },
      })

      const json = error.toJSON()

      expect(json.name).toBe("EnhancedError")
      expect(json.message).toBe("Test")
      expect(json.code).toBe("CODE")
      expect(json.recoverable).toBe(false)
      expect(json.context).toEqual({ key: "value" })
    })
  })

  describe("TransientError", () => {
    it("#when created #then should be recoverable", () => {
      const error = new TransientError("Network timeout")

      expect(error.recoverable).toBe(true)
      expect(error.code).toBe("TRANSIENT_ERROR")
      expect(error.name).toBe("TransientError")
    })
  })

  describe("ResourceError", () => {
    it("#when created #then should not be recoverable", () => {
      const error = new ResourceError("File not found")

      expect(error.recoverable).toBe(false)
      expect(error.code).toBe("RESOURCE_ERROR")
      expect(error.name).toBe("ResourceError")
    })
  })

  describe("classifyError", () => {
    it("#when network error #then should classify as transient", () => {
      const error = new Error("Network timeout")

      const classification = classifyError(error)

      expect(classification.type).toBe("transient")
      expect(classification.retryable).toBe(true)
      expect(classification.severity).toBe("medium")
    })

    it("#when resource error #then should classify as resource", () => {
      const error = new Error("ENOENT: file not found")

      const classification = classifyError(error)

      expect(classification.type).toBe("resource")
      expect(classification.retryable).toBe(false)
      expect(classification.severity).toBe("high")
    })

    it("#when type error #then should classify as logic", () => {
      const error = new TypeError("Cannot read property of undefined")

      const classification = classifyError(error)

      expect(classification.type).toBe("logic")
      expect(classification.retryable).toBe(false)
      expect(classification.severity).toBe("critical")
    })

    it("#when unknown error #then should classify as permanent", () => {
      const error = new Error("Something went wrong")

      const classification = classifyError(error)

      expect(classification.type).toBe("permanent")
      expect(classification.retryable).toBe(false)
    })
  })

  describe("withRetry", () => {
    it("#when function succeeds #then should return result", async () => {
      const fn = async () => "success"

      const result = await withRetry(fn)

      expect(result).toBe("success")
    })

    it("#when function fails then succeeds #then should retry and return result", async () => {
      let attempts = 0
      const fn = async () => {
        attempts++
        if (attempts < 3) {
          throw new Error("Network error")
        }
        return "success"
      }

      const result = await withRetry(fn, { maxAttempts: 3, backoffMs: 10 })

      expect(result).toBe("success")
      expect(attempts).toBe(3)
    })

    it("#when function always fails #then should throw after max attempts", async () => {
      const fn = async () => {
        throw new Error("Persistent error")
      }

      await expect(
        withRetry(fn, { maxAttempts: 2, backoffMs: 10 })
      ).rejects.toThrow("Persistent error")
    })

    it("#when non-retryable error #then should throw immediately", async () => {
      const fn = async () => {
        const error = new TypeError("Type error")
        throw error
      }

      await expect(
        withRetry(fn, { maxAttempts: 3, backoffMs: 10 })
      ).rejects.toThrow("Type error")
    })
  })

  describe("CircuitBreaker", () => {
    it("#when created #then should be in closed state", () => {
      const breaker = new CircuitBreaker("test")

      expect(breaker.getStats().state).toBe("closed")
    })

    it("#when function succeeds #then should execute normally", async () => {
      const breaker = new CircuitBreaker("test")

      const result = await breaker.execute(async () => "success")

      expect(result).toBe("success")
    })

    it("#when failures exceed threshold #then should open circuit", async () => {
      const breaker = new CircuitBreaker("test", {
        failureThreshold: 2,
        timeout: 10000,
      })

      for (let i = 0; i < 2; i++) {
        try {
          await breaker.execute(async () => {
            throw new Error("Error")
          })
        } catch {
          // expected
        }
      }

      expect(breaker.getStats().state).toBe("open")
    })

    it("#when circuit is open #then should throw immediately", async () => {
      const breaker = new CircuitBreaker("test", {
        failureThreshold: 1,
        timeout: 10000,
      })

      try {
        await breaker.execute(async () => {
          throw new Error("Error")
        })
      } catch {
        // expected
      }

      await expect(
        breaker.execute(async () => "success")
      ).rejects.toThrow("is OPEN")
    })

    it("#when reset #then should return to closed state", async () => {
      const breaker = new CircuitBreaker("test", {
        failureThreshold: 1,
        timeout: 10000,
      })

      try {
        await breaker.execute(async () => {
          throw new Error("Error")
        })
      } catch {
        // expected
      }

      breaker.reset()

      expect(breaker.getStats().state).toBe("closed")
    })

    it("#when stats are retrieved #then should show correct values", async () => {
      const breaker = new CircuitBreaker("test")

      await breaker.execute(async () => "success")
      try {
        await breaker.execute(async () => {
          throw new Error("Error")
        })
      } catch {
        // expected
      }

      const stats = breaker.getStats()

      expect(stats.state).toBe("closed")
      expect(stats.consecutiveFailures).toBe(1)
    })
  })
})
