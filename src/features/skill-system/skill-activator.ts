import type { Skill, SkillActivation } from "./skill-types"

export function activateConditionalSkills(
  skills: Skill[],
  filePaths: string[],
): SkillActivation[] {
  if (filePaths.length === 0) {
    return []
  }

  const activations: SkillActivation[] = []

  for (const skill of skills) {
    if (!skill.definition.paths || skill.definition.paths.length === 0) {
      continue
    }

    const matchedPaths = matchPaths(skill.definition.paths, filePaths)
    if (matchedPaths.length > 0) {
      activations.push({ skill, matchedPaths })
    }
  }

  return activations
}

function matchPaths(patterns: string[], filePaths: string[]): string[] {
  const matched: string[] = []

  for (const pattern of patterns) {
    for (const filePath of filePaths) {
      if (matchGlob(pattern, filePath)) {
        if (!matched.includes(filePath)) {
          matched.push(filePath)
        }
      }
    }
  }

  return matched
}

function matchGlob(pattern: string, filePath: string): boolean {
  let p = pattern.replace(/\./g, "__DOT__")

  p = p.replace(/\*\*/g, "__DS__")
  p = p.replace(/\*/g, "[^/]*")
  p = p.replace(/\?/g, "[^/]")
  p = p.replace(/__DS__\//g, "(?:.+/)?")
  p = p.replace(/__DS__/g, "(?:.+/)?")
  p = p.replace(/__DOT__/g, "\\.")

  return new RegExp(`^${p}$`, "i").test(filePath)
}

export function filterSkillsByInvocation(
  skills: Skill[],
): Skill[] {
  return skills.filter((s) => s.definition.userInvocable === true)
}

export function groupSkillsByAgent(
  skills: Skill[],
): Map<string, Skill[]> {
  const groups = new Map<string, Skill[]>()

  for (const skill of skills) {
    const agent = skill.definition.agent ?? "general"
    const existing = groups.get(agent) ?? []
    existing.push(skill)
    groups.set(agent, existing)
  }

  return groups
}
