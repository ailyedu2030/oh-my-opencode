/**
 * Error Handling and Recovery Module
 * 
 * Provides comprehensive error handling, recovery mechanisms,
 * and circuit breaker patterns for resilience.
 */

import { log } from "./logger"

// ============================================================================
// Error Types and Interfaces
// ============================================================================

export interface AppError extends Error {
  code: string
  recoverable: boolean
  context?: Record<string, unknown>
  cause?: Error
}

export interface ErrorClassification {
  type: "transient" | "permanent" | "resource" | "logic"
  severity: "low" | "medium" | "high" | "critical"
  retryable: boolean
  suggestedAction: string
}

export interface RecoveryStrategy {
  name: string
  predicate: (error: Error) => boolean
  execute: (error: Error, context: unknown) => Promise<unknown>
  maxAttempts: number
  backoffMs: number
}

// ============================================================================
// Custom Error Classes
// ============================================================================

export class EnhancedError extends Error implements AppError {
  code: string
  recoverable: boolean
  context?: Record<string, unknown>
  cause?: Error

  constructor(
    message: string,
    code: string,
    options?: {
      recoverable?: boolean
      context?: Record<string, unknown>
      cause?: Error
    }
  ) {
    super(message)
    this.name = "EnhancedError"
    this.code = code
    this.recoverable = options?.recoverable ?? false
    this.context = options?.context
    this.cause = options?.cause

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, EnhancedError.prototype)
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      recoverable: this.recoverable,
      context: this.context,
      cause: this.cause?.message,
      stack: this.stack,
    }
  }
}

export class TransientError extends EnhancedError {
  constructor(
    message: string,
    code = "TRANSIENT_ERROR",
    options?: {
      context?: Record<string, unknown>
      cause?: Error
    }
  ) {
    super(message, code, { recoverable: true, ...options })
    this.name = "TransientError"
    Object.setPrototypeOf(this, TransientError.prototype)
  }
}

export class ResourceError extends EnhancedError {
  constructor(
    message: string,
    code = "RESOURCE_ERROR",
    options?: {
      context?: Record<string, unknown>
      cause?: Error
    }
  ) {
    super(message, code, { recoverable: false, ...options })
    this.name = "ResourceError"
    Object.setPrototypeOf(this, ResourceError.prototype)
  }
}

// ============================================================================
// Error Classification
// ============================================================================

const TRANSIENT_PATTERNS = [
  /network.*error/i,
  /timeout/i,
  /econnrefused/i,
  /socket.*hang/i,
  /temporary/i,
  /transient/i,
]

const RESOURCE_PATTERNS = [
  /enoent/i,
  /eacces/i,
  /permission.*denied/i,
  /out.*of.*memory/i,
  /disk.*full/i,
]

/**
 * Classifies an error to determine its type and severity
 */
export function classifyError(error: Error): ErrorClassification {
  const message = error.message.toLowerCase()
  
  // Check for transient errors
  if (TRANSIENT_PATTERNS.some((pattern) => pattern.test(message))) {
    return {
      type: "transient",
      severity: "medium",
      retryable: true,
      suggestedAction: "Retry with exponential backoff",
    }
  }
  
  // Check for resource errors
  if (RESOURCE_PATTERNS.some((pattern) => pattern.test(message))) {
    return {
      type: "resource",
      severity: "high",
      retryable: false,
      suggestedAction: "Check system resources and permissions",
    }
  }
  
  // Check for logic errors (usually programmer errors)
  if (error instanceof TypeError || error instanceof ReferenceError) {
    return {
      type: "logic",
      severity: "critical",
      retryable: false,
      suggestedAction: "Fix the code bug - this is a programming error",
    }
  }
  
  // Default to permanent error
  return {
    type: "permanent",
    severity: "high",
    retryable: false,
    suggestedAction: "Investigate the error and handle appropriately",
  }
}

// ============================================================================
// Retry Logic
// ============================================================================

export interface RetryOptions {
  maxAttempts: number
  backoffMs: number
  maxBackoffMs: number
  retryableErrors?: string[]
  onRetry?: (attempt: number, error: Error, delay: number) => void
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  backoffMs: 100,
  maxBackoffMs: 30000,
}

/**
 * Calculates exponential backoff with jitter
 */
function calculateBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt)
  const jitter = Math.random() * 0.3 * exponentialDelay // 30% jitter
  return Math.min(exponentialDelay + jitter, maxDelay)
}

/**
 * Executes a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: Error | undefined

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      const result = await fn()
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Classify error to determine if retryable
      const classification = classifyError(lastError)
      
      if (!classification.retryable) {
        throw lastError // Don't retry non-retryable errors
      }

      // Check if this is the last attempt
      if (attempt < opts.maxAttempts - 1) {
        const delay = calculateBackoff(
          attempt,
          opts.backoffMs,
          opts.maxBackoffMs
        )
        
        opts.onRetry?.(attempt + 1, lastError, delay)
        log(`[Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms`)
        
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError ?? new Error("All retry attempts failed")
}

// ============================================================================
// Circuit Breaker
// ============================================================================

export type CircuitState = "closed" | "open" | "half-open"

export interface CircuitBreakerOptions {
  failureThreshold: number
  successThreshold: number
  timeout: number
  halfOpenMaxCalls: number
}

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailureTime?: number
  consecutiveFailures: number
  consecutiveSuccesses: number
}

const DEFAULT_CIRCUIT_BREAKER_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,
  halfOpenMaxCalls: 3,
}

/**
 * Circuit breaker for preventing cascade failures
 */
export class CircuitBreaker {
  private state: CircuitState = "closed"
  private failures = 0
  private successes = 0
  private lastFailureTime?: number
  private consecutiveFailures = 0
  private consecutiveSuccesses = 0
  private halfOpenCalls = 0

  constructor(
    private name: string,
    private options: Partial<CircuitBreakerOptions> = {}
  ) {
    this.options = { ...DEFAULT_CIRCUIT_BREAKER_OPTIONS, ...options }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      // Check if timeout has passed to transition to half-open
      const timeout = this.options.timeout ?? 30000
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime > timeout
      ) {
        this.transitionTo("half-open")
      } else {
        throw new Error(
          `Circuit breaker "${this.name}" is OPEN - too many failures`
        )
      }
    }

    if (this.state === "half-open") {
      const halfOpenMax = this.options.halfOpenMaxCalls ?? 3
      if (this.halfOpenCalls >= halfOpenMax) {
        throw new Error(
          `Circuit breaker "${this.name}" is HALF-OPEN - max calls exceeded`
        )
      }
      this.halfOpenCalls++
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.consecutiveSuccesses++
    this.consecutiveFailures = 0

    const successThreshold = this.options.successThreshold ?? 3

    if (this.state === "half-open" && this.consecutiveSuccesses >= successThreshold) {
      this.transitionTo("closed")
    }
  }

  private onFailure(): void {
    this.failures++
    this.consecutiveFailures++
    this.consecutiveSuccesses = 0
    this.lastFailureTime = Date.now()

    const failureThreshold = this.options.failureThreshold ?? 5

    if (this.state === "closed" && this.consecutiveFailures >= failureThreshold) {
      this.transitionTo("open")
    } else if (this.state === "half-open") {
      this.transitionTo("open")
    }
  }

  private transitionTo(newState: CircuitState): void {
    log(`[CircuitBreaker] ${this.name}: ${this.state} -> ${newState}`)
    this.state = newState

    if (newState === "closed") {
      this.failures = 0
      this.consecutiveFailures = 0
      this.consecutiveSuccesses = 0
      this.halfOpenCalls = 0
    } else if (newState === "open") {
      this.halfOpenCalls = 0
    }
  }

  /**
   * Get current statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      consecutiveFailures: this.consecutiveFailures,
      consecutiveSuccesses: this.consecutiveSuccesses,
    }
  }

  /**
   * Force reset to closed state
   */
  reset(): void {
    this.transitionTo("closed")
  }
}

// ============================================================================
// Exports
// ============================================================================

export default {
  EnhancedError,
  TransientError,
  ResourceError,
  classifyError,
  withRetry,
  CircuitBreaker,
}
