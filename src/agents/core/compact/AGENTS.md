# src/agents/core/compact/ — Context Compaction System

**Generated:** 2026-02-21 | **Branch:** dev

## OVERVIEW

Three-layer context compaction system that prevents context window exhaustion while preserving critical information. Operates on message arrays with token-based thresholds.

## ARCHITECTURE

```
compact/
├── compact-config.ts    # Types + defaults
├── auto-compact.ts     # Model-aware auto compaction
├── micro-compact.ts   # Gap-based message reduction
├── snip-compact.ts    # Content-aware trimming
└── index.ts           # Public API barrel
```

## COMPACTION LAYERS

| Layer | Strategy | When |
|-------|----------|------|
| **microCompact** | Gap-based pruning | 60min gaps between messages → keep last N |
| **snipCompact** | Content trimming | Remove zombie/helper turns, merge adjacent |
| **autoCompact** | Token-based summary | Threshold reached → summarize to boundary |

## TOKEN ESTIMATION

```typescript
estimateTokens(messages: Message[]): number
// Fast estimation: JSON.stringify(messages).length / 4
```

## AUTO-COMPACT FLOW

```
shouldAutoCompact(messages, model, config)
  └─→ tokens >= (getModelContextLimit(model) - reservedForSummary - autoThresholdBuffer)
      └─→ autoCompact(messages)
          ├─→ buildSummaryMessages()     # 8-section analysis format
          ├─→ createBoundaryMarker()     # "--- Earlier conversation summarized ---"
          └─→ CompactResult { boundaryMarker, summaryMessages, pre/post tokens }
```

## MODEL CONTEXT LIMITS

| Model | Context Limit |
|-------|---------------|
| claude-opus-4-6 | 200,000 |
| claude-sonnet-4-6 | 200,000 |
| claude-haiku-4-5 | 200,000 |
| gpt-4o / gpt-5.2 / gpt-5.3-codex | 128,000 |
| Default (unknown models) | 100,000 |

## CONFIG

```typescript
DEFAULT_COMPACT_CONFIG = {
  enabled: true,
  autoThresholdBuffer: 13_000,        // Start compacting 13k before limit
  warningThresholdBuffer: 20_000,      // Warning at 20k buffer
  errorThresholdBuffer: 3_000,         // Critical at 3k buffer
  reservedForSummary: 20_000,          // Always keep 20k for summary
  maxConsecutiveFailures: 3,
  microCompact: { enabled: true, gapThresholdMinutes: 60, keepRecentCount: 5 },
  snipCompact: { enabled: true, removeZombies: true, mergeAdjacent: true },
}
```

## COMPACT RESULT

```typescript
interface CompactResult {
  boundaryMarker?: SystemMessage  // "--- Earlier conversation summarized ---"
  summaryMessages: Message[]      // Condensed history
  preCompactTokens: number
  postCompactTokens: number
}
```

## USAGE

```typescript
import { autoCompact, shouldAutoCompact, estimateTokens, formatCompactStats } from "./auto-compact"

// Check if compaction needed
if (shouldAutoCompact(messages, model, config)) {
  const result = await autoCompact(messages, config)
  console.log(formatCompactStats(result))  // "Compacted 180000→35000 tokens..."
}
```
