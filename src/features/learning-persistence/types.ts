export interface LearningState {
  lastUpdated: string
  sessionHistory: SessionEntry[]
  context: Record<string, unknown>
}

export interface SessionEntry {
  sessionId: string
  startedAt: string
  endedAt?: string
  summary?: string
}
