import { describe, expect, it } from "bun:test"
import {
  AdvancedCache,
  createLazyModule,
  getGlobalPerformanceMonitor,
  memoize,
  PerformanceMonitor,
  resetGlobalPerformanceMonitor,
} from "./performance-optimizations"

describe("Performance Optimizations", () => {
  describe("LazyModule", () => {
    it("#when module is created #then should not be loaded", () => {
      let loadCount = 0
      const lazyModule = createLazyModule(async () => {
        loadCount++
        return { value: 42 }
      })

      expect(lazyModule.loaded).toBe(false)
      expect(lazyModule.loading).toBe(false)
      expect(loadCount).toBe(0)
    })

    it("#when load is called #then should load the module", async () => {
      const lazyModule = createLazyModule(async () => ({ value: 42 }))

      const result = await lazyModule.load()

      expect(result.value).toBe(42)
      expect(lazyModule.loaded).toBe(true)
    })

    it("#when loaded multiple times #then should return cached value", async () => {
      let loadCount = 0
      const lazyModule = createLazyModule(async () => {
        loadCount++
        return { value: loadCount }
      })

      const result1 = await lazyModule.load()
      const result2 = await lazyModule.load()

      expect(result1.value).toBe(1)
      expect(result2.value).toBe(1)
      expect(loadCount).toBe(1)
    })

    it("#when get is called before load #then should return undefined", () => {
      const lazyModule = createLazyModule(async () => ({ value: 42 }))

      const result = lazyModule.get()

      expect(result).toBeUndefined()
    })
  })

  describe("AdvancedCache", () => {
    it("#when value is set #then should be retrievable", () => {
      const cache = new AdvancedCache<string>()

      cache.set("key", "value")
      const result = cache.get("key")

      expect(result).toBe("value")
    })

    it("#when key does not exist #then should return undefined", () => {
      const cache = new AdvancedCache<string>()

      const result = cache.get("nonexistent")

      expect(result).toBeUndefined()
    })

    it("#when entry expires #then should return undefined", async () => {
      const cache = new AdvancedCache<string>({ defaultTTL: 50 })

      cache.set("key", "value")
      await new Promise((resolve) => setTimeout(resolve, 60))

      const result = cache.get("key")

      expect(result).toBeUndefined()
    })

    it("#when stats are retrieved #then should show correct values", () => {
      const cache = new AdvancedCache<string>()

      cache.set("key1", "value1")
      cache.set("key2", "value2")
      cache.get("key1") // hit
      cache.get("key2") // hit
      cache.get("key3") // miss

      const stats = cache.getStats()

      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.entries).toBe(2)
      expect(stats.hitRate).toBe(2 / 3)
    })

    it("#when cache is cleared #then should be empty", () => {
      const cache = new AdvancedCache<string>()

      cache.set("key", "value")
      cache.clear()

      const result = cache.get("key")
      expect(result).toBeUndefined()
      expect(cache.getStats().entries).toBe(0)
    })
  })

  describe("memoize", () => {
    it("#when called with same arguments #then should return cached value", () => {
      let callCount = 0
      const fn = memoize((x: number) => {
        callCount++
        return x * 2
      })

      const result1 = fn(5)
      const result2 = fn(5)

      expect(result1).toBe(10)
      expect(result2).toBe(10)
      expect(callCount).toBe(1)
    })

    it("#when called with different arguments #then should compute new value", () => {
      const fn = memoize((x: number) => x * 2)

      const result1 = fn(5)
      const result2 = fn(10)

      expect(result1).toBe(10)
      expect(result2).toBe(20)
    })

    it("#when cache expires #then should recompute", async () => {
      let callCount = 0
      const fn = memoize(
        (x: number) => {
          callCount++
          return x * 2
        },
        { ttl: 50 }
      )

      fn(5)
      await new Promise((resolve) => setTimeout(resolve, 60))
      fn(5)

      expect(callCount).toBe(2)
    })
  })

  describe("PerformanceMonitor", () => {
    beforeEach(() => {
      resetGlobalPerformanceMonitor()
    })

    it("#when created #then should have initial state", () => {
      const monitor = new PerformanceMonitor()

      const metrics = monitor.getMetrics()

      expect(metrics.timestamp).toBeGreaterThan(0)
      expect(metrics.memory.heapUsed).toBeGreaterThan(0)
      expect(metrics.cpu).toHaveProperty("user")
      expect(metrics.cpu).toHaveProperty("system")
    })

    it("#when operation is recorded #then should track metrics", () => {
      const monitor = new PerformanceMonitor()

      monitor.recordOperation("test-op", () => {
        return "result"
      })

      const stats = monitor.getOperationStats()

      expect(stats.total).toBe(1)
      expect(stats.successful).toBe(1)
      expect(stats.failed).toBe(0)
      expect(stats.operations["test-op"]).toBeDefined()
    })

    it("#when async operation is recorded #then should track metrics", async () => {
      const monitor = new PerformanceMonitor()

      await monitor.recordAsyncOperation("async-op", async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return "result"
      })

      const stats = monitor.getOperationStats()

      expect(stats.total).toBe(1)
      expect(stats.successful).toBe(1)
    })

    it("#when operation fails #then should track failure", () => {
      const monitor = new PerformanceMonitor()

      try {
        monitor.recordOperation("failing-op", () => {
          throw new Error("Test error")
        })
      } catch {
        // expected
      }

      const stats = monitor.getOperationStats()

      expect(stats.total).toBe(1)
      expect(stats.successful).toBe(0)
      expect(stats.failed).toBe(1)
    })

    it("#when global monitor is accessed #then should return singleton", () => {
      const monitor1 = getGlobalPerformanceMonitor()
      const monitor2 = getGlobalPerformanceMonitor()

      expect(monitor1).toBe(monitor2)
    })

    it("#when global monitor is reset #then should create new instance", () => {
      const monitor1 = getGlobalPerformanceMonitor()
      resetGlobalPerformanceMonitor()
      const monitor2 = getGlobalPerformanceMonitor()

      expect(monitor1).not.toBe(monitor2)
    })

    it("#when report is generated #then should contain performance data", () => {
      const monitor = new PerformanceMonitor()

      monitor.recordOperation("op1", () => "result")
      monitor.recordOperation("op2", () => "result")

      const report = monitor.generateReport()

      expect(report).toContain("Performance Report")
      expect(report).toContain("Memory:")
      expect(report).toContain("Operations:")
      expect(report).toContain("op1")
      expect(report).toContain("op2")
    })
  })
})
