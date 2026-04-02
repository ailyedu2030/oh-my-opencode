import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { LEARNING_DIR, LEARNING_STATE_FILE } from "./constants"
import type { LearningState, SessionEntry } from "./types"

export function getLearningStatePath(directory: string): string {
  return join(directory, LEARNING_DIR, LEARNING_STATE_FILE)
}

export function readLearningState(directory: string): LearningState | null {
  const filePath = getLearningStatePath(directory)
  if (!existsSync(filePath)) {
    return null
  }

  try {
    const content = readFileSync(filePath, "utf-8")
    const parsed = JSON.parse(content)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null
    }
    if (!Array.isArray(parsed.sessionHistory)) {
      parsed.sessionHistory = []
    }
    if (!parsed.context || typeof parsed.context !== "object" || Array.isArray(parsed.context)) {
      parsed.context = {}
    }
    return parsed as LearningState
  } catch {
    return null
  }
}

export function writeLearningState(directory: string, state: LearningState): boolean {
  const filePath = getLearningStatePath(directory)
  try {
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8")
    return true
  } catch {
    return false
  }
}

export function createDefaultLearningState(): LearningState {
  return {
    lastUpdated: new Date().toISOString(),
    sessionHistory: [],
    context: {},
  }
}

export function addSessionEntry(directory: string, entry: SessionEntry): LearningState | null {
  let state = readLearningState(directory)
  if (!state) {
    state = createDefaultLearningState()
  }
  state.sessionHistory = [...state.sessionHistory, entry]
  state.lastUpdated = new Date().toISOString()
  if (writeLearningState(directory, state)) {
    return state
  }
  return null
}

export function updateSessionEntry(directory: string, sessionId: string, updates: Partial<SessionEntry>): LearningState | null {
  const state = readLearningState(directory)
  if (!state) return null

  const index = state.sessionHistory.findIndex((e) => e.sessionId === sessionId)
  if (index !== -1) {
    state.sessionHistory[index] = { ...state.sessionHistory[index], ...updates }
    state.lastUpdated = new Date().toISOString()
    if (writeLearningState(directory, state)) {
      return state
    }
  }
  return null
}

export function updateContext(directory: string, key: string, value: unknown): LearningState | null {
  let state = readLearningState(directory)
  if (!state) {
    state = createDefaultLearningState()
  }
  state.context[key] = value
  state.lastUpdated = new Date().toISOString()
  if (writeLearningState(directory, state)) {
    return state
  }
  return null
}
