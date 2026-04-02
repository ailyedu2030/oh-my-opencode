/**
 * Performance Optimizations Module
 * 
 * Provides lazy loading, caching, and performance monitoring
 * for the oh-my-opencode plugin.
 */

import { log } from "../shared"

// ============================================================================
// Lazy Loading Utilities
// ============================================================================

export type LazyLoader<T> = () => Promise<T>

export interface LazyModule<T> {
  readonly loaded: boolean
  readonly loading: boolean
  load(): Promise<T>
  get(): T | undefined
}

/**
 * Creates a lazy-loading wrapper for expensive module imports
 * @param loader - Function that loads the module
 * @returns LazyModule interface for controlled loading
 */
export function createLazyModule<T>(loader: LazyLoader<T>): LazyModule<T> {
  let moduleInstance: T | undefined
  let isLoading = false
  let isLoaded = false

  return {
    get loaded() {
      return isLoaded
    },
    get loading() {
      return isLoading
    },
    async load(): Promise<T> {
      if (isLoaded && moduleInstance !== undefined) {
        return moduleInstance
      }
      if (isLoading) {
        // Wait for loading to complete
        while (isLoading) {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }
        if (moduleInstance !== undefined) {
          return moduleInstance
        }
        throw new Error("Lazy module loading failed")
      }

      isLoading = true
      try {
        moduleInstance = await loader()
        isLoaded = true
        log("[LazyModule] Successfully loaded module")
        return moduleInstance
      } catch (error) {
        log("[LazyModule] Failed to load module:", error)
        throw error
      } finally {
        isLoading = false
      }
    },
    get(): T | undefined {
      return moduleInstance
    },
  }
}

// ============================================================================
// Caching Utilities
// ============================================================================

export interface CacheEntry<T> {
  value: T
  expiresAt: number
  size: number
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
  entries: number
  hitRate: number
}

export interface CacheOptions {
  maxSize?: number // Maximum cache size in bytes
  maxEntries?: number // Maximum number of entries
  defaultTTL?: number // Default TTL in milliseconds
}

/**
 * LRU (Least Recently Used) Cache with TTL support
 */
export class AdvancedCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private stats = { hits: 0, misses: 0 }
  private currentSize = 0

  constructor(private options: CacheOptions = {}) {
    this.options = {
      maxSize: 50 * 1024 * 1024, // 50MB default
      maxEntries: 10000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      ...options,
    }
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (entry === undefined) {
      this.stats.misses++
      return undefined
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      this.stats.misses++
      return undefined
    }

    // Move to end (LRU - most recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)
    this.stats.hits++

    return entry.value
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const size = this.estimateSize(value)

    // Check if single entry exceeds max size
    if (size > (this.options.maxSize ?? 50 * 1024 * 1024)) {
      log("[AdvancedCache] Entry too large, skipping cache")
      return
    }

    // Evict entries if necessary
    while (
      this.currentSize + size > (this.options.maxSize ?? 50 * 1024 * 1024) ||
      this.cache.size >= (this.options.maxEntries ?? 10000)
    ) {
      this.evictLRU()
    }

    // Remove old entry if exists
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!
      this.currentSize -= oldEntry.size
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + (ttl ?? this.options.defaultTTL ?? 5 * 60 * 1000),
      size,
    }

    this.cache.set(key, entry)
    this.currentSize += size
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.cache.delete(key)
      this.currentSize -= entry.size
      return true
    }
    return false
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear()
    this.currentSize = 0
    this.stats = { hits: 0, misses: 0 }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.currentSize,
      entries: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    }
  }

  /**
   * Remove expired entries
   */
  purgeExpired(): number {
    const now = Date.now()
    let count = 0
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.delete(key)
        count++
      }
    }
    return count
  }

  private evictLRU(): void {
    // Get first entry (least recently used)
    const firstKey = this.cache.keys().next().value
    if (firstKey !== undefined) {
      this.delete(firstKey)
    }
  }

  private estimateSize(value: unknown): number {
    // Rough size estimation
    if (value === null || value === undefined) return 0
    if (typeof value === "boolean") return 4
    if (typeof value === "number") return 8
    if (typeof value === "string") return value.length * 2
    if (Array.isArray(value)) {
      return value.reduce((sum, item) => sum + this.estimateSize(item), 0)
    }
    if (typeof value === "object") {
      return Object.values(value).reduce(
        (sum, item) => sum + this.estimateSize(item),
        0
      )
    }
    return 0
  }
}

// ============================================================================
// Performance Monitoring
// ============================================================================

export interface PerformanceMetrics {
  timestamp: number
  memory: {
    used: number
    total: number
    rss: number
    heapUsed: number
    heapTotal: number
    external: number
  }
  cpu: {
    user: number
    system: number
  }
}

export interface OperationMetrics {
  name: string
  duration: number
  success: boolean
  error?: string
  timestamp: number
}

/**
 * Performance monitor for tracking system and operation metrics
 */
export class PerformanceMonitor {
  private operationHistory: OperationMetrics[] = []
  private maxHistorySize = 1000
  private startTime = Date.now()
  private lastCpuUsage = process.cpuUsage()

  /**
   * Get current memory metrics
   */
  getMemoryMetrics(): PerformanceMetrics["memory"] {
    const usage = process.memoryUsage()
    return {
      used: usage.rss,
      total: usage.heapTotal + usage.external,
      rss: usage.rss,
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
    }
  }

  /**
   * Get current CPU metrics
   */
  getCpuMetrics(): PerformanceMetrics["cpu"] {
    const currentUsage = process.cpuUsage(this.lastCpuUsage)
    this.lastCpuUsage = process.cpuUsage()
    return {
      user: currentUsage.user / 1000, // Convert to ms
      system: currentUsage.system / 1000,
    }
  }

  /**
   * Get full performance metrics snapshot
   */
  getMetrics(): PerformanceMetrics {
    return {
      timestamp: Date.now(),
      memory: this.getMemoryMetrics(),
      cpu: this.getCpuMetrics(),
    }
  }

  /**
   * Record an operation with timing
   */
  recordOperation<T>(
    name: string,
    operation: () => T
  ): T {
    const start = Date.now()
    try {
      const result = operation()
      this.addOperationMetric({
        name,
        duration: Date.now() - start,
        success: true,
        timestamp: Date.now(),
      })
      return result
    } catch (error) {
      this.addOperationMetric({
        name,
        duration: Date.now() - start,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      })
      throw error
    }
  }

  /**
   * Record an async operation with timing
   */
  async recordAsyncOperation<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await operation()
      this.addOperationMetric({
        name,
        duration: Date.now() - start,
        success: true,
        timestamp: Date.now(),
      })
      return result
    } catch (error) {
      this.addOperationMetric({
        name,
        duration: Date.now() - start,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      })
      throw error
    }
  }

  /**
   * Add operation metric to history
   */
  private addOperationMetric(metric: OperationMetrics): void {
    this.operationHistory.push(metric)
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory.shift()
    }
  }

  /**
   * Get operation statistics
   */
  getOperationStats(): {
    total: number
    successful: number
    failed: number
    averageDuration: number
    operations: Record<
      string,
      { count: number; avgDuration: number; successRate: number }
    >
  } {
    const stats = {
      total: this.operationHistory.length,
      successful: this.operationHistory.filter((op) => op.success).length,
      failed: this.operationHistory.filter((op) => !op.success).length,
      averageDuration:
        this.operationHistory.length > 0
          ? this.operationHistory.reduce((sum, op) => sum + op.duration, 0) /
            this.operationHistory.length
          : 0,
      operations: {} as Record<
        string,
        { count: number; avgDuration: number; successRate: number }
      >,
    }

    // Group by operation name
    const byName: Record<string, OperationMetrics[]> = {}
    for (const op of this.operationHistory) {
      if (!byName[op.name]) {
        byName[op.name] = []
      }
      byName[op.name].push(op)
    }

    for (const [name, ops] of Object.entries(byName)) {
      stats.operations[name] = {
        count: ops.length,
        avgDuration: ops.reduce((sum, op) => sum + op.duration, 0) / ops.length,
        successRate: ops.filter((op) => op.success).length / ops.length,
      }
    }

    return stats
  }

  /**
   * Get uptime in milliseconds
   */
  getUptime(): number {
    return Date.now() - this.startTime
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = this.getMetrics()
    const stats = this.getOperationStats()
    const uptime = this.getUptime()

    return `
Performance Report
==================
Uptime: ${(uptime / 1000).toFixed(2)}s

Memory:
  Heap Used: ${(metrics.memory.heapUsed / 1024 / 1024).toFixed(2)} MB
  Heap Total: ${(metrics.memory.heapTotal / 1024 / 1024).toFixed(2)} MB
  RSS: ${(metrics.memory.rss / 1024 / 1024).toFixed(2)} MB

Operations:
  Total: ${stats.total}
  Successful: ${stats.successful}
  Failed: ${stats.failed}
  Average Duration: ${stats.averageDuration.toFixed(2)}ms

Top Operations:
${Object.entries(stats.operations)
  .slice(0, 5)
  .map(
    ([name, data]) =>
      `  ${name}: ${data.count} calls, ${data.avgDuration.toFixed(2)}ms avg, ${(data.successRate * 100).toFixed(1)}% success`
  )
  .join("\n")}
`.trim()
  }
}

// ============================================================================
// Global Performance Monitor
// ============================================================================

let globalMonitor: PerformanceMonitor | undefined

export function getGlobalPerformanceMonitor(): PerformanceMonitor {
  if (globalMonitor === undefined) {
    globalMonitor = new PerformanceMonitor()
  }
  return globalMonitor
}

export function resetGlobalPerformanceMonitor(): void {
  globalMonitor = undefined
}

// ============================================================================
// Memoization Utilities
// ============================================================================

export interface MemoizeOptions {
  maxSize?: number
  ttl?: number // Time to live in milliseconds
  keyGenerator?: (...args: unknown[]) => string
}

/**
 * Memoizes a function with LRU cache and TTL support
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: MemoizeOptions = {}
): T {
  const { maxSize = 100, ttl = 60000, keyGenerator } = options
  const cache = new Map<string, { value: unknown; timestamp: number }>()

  return ((...args: unknown[]) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)
    const cached = cache.get(key)

    if (cached) {
      // Check TTL
      if (Date.now() - cached.timestamp < ttl) {
        // Move to end (LRU)
        cache.delete(key)
        cache.set(key, cached)
        return cached.value
      }
      // Expired
      cache.delete(key)
    }

    // Compute and cache
    const result = fn(...args)
    
    // Evict LRU if at capacity
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value
      if (firstKey !== undefined) {
        cache.delete(firstKey)
      }
    }

    cache.set(key, { value: result, timestamp: Date.now() })
    return result
  }) as T
}

// ============================================================================
// Export all utilities
// ============================================================================

export default {
  createLazyModule,
  AdvancedCache,
  PerformanceMonitor,
  getGlobalPerformanceMonitor,
  resetGlobalPerformanceMonitor,
  memoize,
}
