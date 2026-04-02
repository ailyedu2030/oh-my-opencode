export type {
  CompactConfig,
  CompactResult,
  MicroCompactConfig,
  SnipCompactConfig,
  Message,
  SystemMessage,
  TextPart,
} from "./compact-config"

export { DEFAULT_COMPACT_CONFIG, getDefaultCompactConfig } from "./compact-config"

export { microCompact, countToolResults } from "./micro-compact"
export type { MicroCompactOptions } from "./micro-compact"

export { snipCompact, getMessageChainLength } from "./snip-compact"
export type { SnipCompactOptions } from "./snip-compact"

export {
  autoCompact,
  shouldAutoCompact,
  getModelContextLimit,
  formatCompactStats,
  estimateTokens,
} from "./auto-compact"