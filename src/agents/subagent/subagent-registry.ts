import type { SubagentHandle, IsolationMode } from "./isolation-modes"

export interface SubagentRegistry {
  register(handle: SubagentHandle): void
  unregister(id: string): void
  get(id: string): SubagentHandle | undefined
  getByName(name: string): SubagentHandle[]
  getAll(): SubagentHandle[]
  getByIsolation(mode: IsolationMode): SubagentHandle[]
  update(id: string, updates: Partial<SubagentHandle>): void
}

export function createSubagentRegistry(): SubagentRegistry {
  const agents = new Map<string, SubagentHandle>()

  return {
    register(handle: SubagentHandle): void {
      agents.set(handle.id, handle)
    },

    unregister(id: string): void {
      agents.delete(id)
    },

    get(id: string): SubagentHandle | undefined {
      return agents.get(id)
    },

    getByName(name: string): SubagentHandle[] {
      return Array.from(agents.values()).filter((a) => a.name === name)
    },

    getAll(): SubagentHandle[] {
      return Array.from(agents.values())
    },

    getByIsolation(mode: IsolationMode): SubagentHandle[] {
      return Array.from(agents.values()).filter((a) => a.isolation === mode)
    },

    update(id: string, updates: Partial<SubagentHandle>): void {
      const existing = agents.get(id)
      if (existing) {
        agents.set(id, { ...existing, ...updates })
      }
    },
  }
}
