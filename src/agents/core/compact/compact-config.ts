/**
 * Configuration for context compaction system.
 */

export interface CompactConfig {
  enabled: boolean
  autoThresholdBuffer: number
  warningThresholdBuffer: number
  errorThresholdBuffer: number
  reservedForSummary: number
  maxConsecutiveFailures: number
  microCompact?: MicroCompactConfig
  snipCompact?: SnipCompactConfig
}

export interface MicroCompactConfig {
  enabled: boolean
  gapThresholdMinutes: number
  keepRecentCount: number
}

export interface SnipCompactConfig {
  enabled: boolean
  removeZombies: boolean
  mergeAdjacent: boolean
}

export const DEFAULT_COMPACT_CONFIG: CompactConfig = {
  enabled: true,
  autoThresholdBuffer: 13_000,
  warningThresholdBuffer: 20_000,
  errorThresholdBuffer: 3_000,
  reservedForSummary: 20_000,
  maxConsecutiveFailures: 3,
  microCompact: {
    enabled: true,
    gapThresholdMinutes: 60,
    keepRecentCount: 5,
  },
  snipCompact: {
    enabled: true,
    removeZombies: true,
    mergeAdjacent: true,
  },
}

export interface CompactResult {
  boundaryMarker?: SystemMessage
  summaryMessages: Message[]
  preCompactTokens: number
  postCompactTokens: number
}

export interface SystemMessage {
  type: "system"
  content: TextPart[]
}

export interface TextPart {
  type: "text"
  text: string
}

export interface Message {
  id: string
  sessionID: string
  role: "user" | "assistant"
  time: {
    created: number
  }
  [key: string]: unknown
}

export function getDefaultCompactConfig(): CompactConfig {
  return { ...DEFAULT_COMPACT_CONFIG }
}