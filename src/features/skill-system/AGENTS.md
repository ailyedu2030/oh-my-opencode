# src/features/skill-system/ — Skill Activation Engine

**Generated:** 2026-02-21 | **Branch:** dev

## OVERVIEW

Skill activation engine that matches skills to file paths and manages conditional skill loading based on glob patterns.

## CORE FUNCTIONS

### activateConditionalSkills

Matches skills to file paths using glob patterns:

```typescript
function activateConditionalSkills(
  skills: Skill[],
  filePaths: string[],
): SkillActivation[]
// Returns: { skill, matchedPaths }[] for matching skills
```

**Activation Logic:**
1. Skip skills with no `paths` defined
2. Match each skill's glob patterns against file paths
3. Return unique matched paths per skill

### filterSkillsByInvocation

Filters skills that can be manually invoked by user:

```typescript
function filterSkillsByInvocation(skills: Skill[]): Skill[]
// Returns: skills where definition.userInvocable === true
```

### groupSkillsByAgent

Groups skills by agent affinity:

```typescript
function groupSkillsByAgent(skills: Skill[]): Map<string, Skill[]>
// Returns: Map<agentName, Skill[]>
// Default agent: "general"
```

## GLOB MATCHING

Custom glob implementation in `skill-activator.ts`:

| Pattern | Meaning |
|---------|---------|
| `*` | Any characters except `/` |
| `**` | Any characters including `/` |
| `?` | Single character except `/` |
| `.` | Literal dot |

**Conversion:**
```
**/*.ts      →  (?:.+/)?[^/]*\.ts
src/**/*.ts  →  src/(?:.+/)?[^/]*\.ts
```

## SKILL TYPES

```typescript
interface Skill {
  definition: SkillDefinition
  // ... other properties
}

interface SkillDefinition {
  paths?: string[]          // Glob patterns for auto-activation
  userInvocable?: boolean    // Can user manually invoke
  agent?: string             // Agent affinity
  // ... other fields
}

interface SkillActivation {
  skill: Skill
  matchedPaths: string[]
}
```

## USAGE

```typescript
import {
  activateConditionalSkills,
  filterSkillsByInvocation,
  groupSkillsByAgent,
} from "./skill-activator"

// Auto-activate skills for touched files
const activations = activateConditionalSkills(skills, touchedFiles)
for (const { skill, matchedPaths } of activations) {
  console.log(`${skill.name} matched ${matchedPaths.join(", ")}`)
}

// Get user-invocable skills for command palette
const invocable = filterSkillsByInvocation(allSkills)

// Group skills by agent for display
const byAgent = groupSkillsByAgent(skills)
for (const [agent, agentSkills] of byAgent) {
  console.log(`${agent}: ${agentSkills.length} skills`)
}
```

## RELATED MODULES

| Module | Purpose |
|--------|---------|
| `opencode-skill-loader` | Loads skills from SKILL.md files |
| `skill-mcp-manager` | Manages MCP server lifecycle per skill |
| `builtin-skills` | Built-in skill implementations |
