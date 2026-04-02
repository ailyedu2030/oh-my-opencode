import { describe, expect, it } from "bun:test"
import type { SkillDefinition, Skill, SkillActivation } from "./skill-types"
import { createSkillDefinition } from "./skill-types"
import {
  activateConditionalSkills,
  filterSkillsByInvocation,
  groupSkillsByAgent,
} from "./skill-activator"

// #region skill-types tests

describe("skill-types", () => {
  describe("createSkillDefinition", () => {
    it("#given minimal definition #when creating #then returns definition with defaults", () => {
      const def = createSkillDefinition({
        name: "test-skill",
        description: "A test skill",
      })
      expect(def.name).toBe("test-skill")
      expect(def.description).toBe("A test skill")
      expect(def.whenToUse).toBeUndefined()
      expect(def.argumentHint).toBeUndefined()
      expect(def.arguments).toBeUndefined()
      expect(def.allowedTools).toBeUndefined()
      expect(def.model).toBeUndefined()
      expect(def.effort).toBeUndefined()
      expect(def.context).toBeUndefined()
      expect(def.agent).toBeUndefined()
      expect(def.paths).toBeUndefined()
      expect(def.userInvocable).toBeUndefined()
      expect(def.hooks).toBeUndefined()
      expect(def.skillRoot).toBeUndefined()
    })

    it("#given partial definition #when creating #then fills all fields", () => {
      const def = createSkillDefinition({
        name: "code-review",
        description: "Performs code review",
        whenToUse: "When asking for code review",
        argumentHint: "<file-path>",
        arguments: ["file-path"],
        allowedTools: ["Read", "Edit"],
        model: "claude-sonnet",
        effort: "medium",
        context: "fork",
        agent: "hephaestus",
        paths: ["src/**/*.ts"],
        userInvocable: true,
        hooks: {
          preToolUse: [{ matcher: "Write", hooks: [{ type: "warn", message: "Check twice" }] }],
        },
        skillRoot: "/skills/code-review",
      })

      expect(def.name).toBe("code-review")
      expect(def.description).toBe("Performs code review")
      expect(def.whenToUse).toBe("When asking for code review")
      expect(def.argumentHint).toBe("<file-path>")
      expect(def.arguments).toEqual(["file-path"])
      expect(def.allowedTools).toEqual(["Read", "Edit"])
      expect(def.model).toBe("claude-sonnet")
      expect(def.effort).toBe("medium")
      expect(def.context).toBe("fork")
      expect(def.agent).toBe("hephaestus")
      expect(def.paths).toEqual(["src/**/*.ts"])
      expect(def.userInvocable).toBe(true)
      expect(def.hooks?.preToolUse).toHaveLength(1)
      expect(def.hooks?.preToolUse![0].matcher).toBe("Write")
      expect(def.skillRoot).toBe("/skills/code-review")
    })

    it("#given full definition #when creating #then preserves all values", () => {
      const def = createSkillDefinition({
        name: "test",
        description: "A test definition",
        effort: "high",
        userInvocable: true,
      })
      expect(def.name).toBe("test")
      expect(def.description).toBe("A test definition")
      expect(def.effort).toBe("high")
      expect(def.userInvocable).toBe(true)
    })
  })
})

// #endregion

// #region skill-activator tests

describe("skill-activator", () => {
  describe("activateConditionalSkills", () => {
    it("#given no skills #when activating #then returns empty", () => {
      const result = activateConditionalSkills([], ["src/index.ts"])
      expect(result).toEqual([])
    })

    it("#given skills with no paths #when activating #then returns empty", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "no-paths",
            description: "No paths defined",
          }),
          scope: "project",
          path: "/project/skills/no-paths",
        },
      ]
      const result = activateConditionalSkills(skills, ["src/index.ts"])
      expect(result).toEqual([])
    })

    it("#given skill with matching glob pattern #when activating #then returns activation", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "ts-skill",
            description: "TypeScript skill",
            paths: ["src/**/*.ts"],
          }),
          scope: "project",
          path: "/project/skills/ts",
        },
      ]
      const result = activateConditionalSkills(skills, ["src/index.ts"])
      expect(result).toHaveLength(1)
      expect(result[0].skill.definition.name).toBe("ts-skill")
      expect(result[0].matchedPaths).toEqual(["src/index.ts"])
    })

    it("#given skill with non-matching glob pattern #when activating #then returns empty", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "python-skill",
            description: "Python skill",
            paths: ["**/*.py"],
          }),
          scope: "project",
          path: "/project/skills/py",
        },
      ]
      const result = activateConditionalSkills(skills, ["src/index.ts"])
      expect(result).toEqual([])
    })

    it("#given skill with multiple patterns #when activating #then matches any pattern", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "multi-skill",
            description: "Multi-pattern skill",
            paths: ["**/*.py", "**/*.ts"],
          }),
          scope: "project",
          path: "/project/skills/multi",
        },
      ]
      const result = activateConditionalSkills(skills, ["src/index.ts"])
      expect(result).toHaveLength(1)
      expect(result[0].matchedPaths).toEqual(["src/index.ts"])
    })

    it("#given multiple files matching skill #when activating #then returns all matched paths", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "ts-skill",
            description: "TypeScript skill",
            paths: ["src/**/*.ts"],
          }),
          scope: "project",
          path: "/project/skills/ts",
        },
      ]
      const result = activateConditionalSkills(skills, [
        "src/index.ts",
        "src/cli.ts",
        "src/agents/core/index.ts",
      ])
      expect(result).toHaveLength(1)
      expect(result[0].matchedPaths).toEqual([
        "src/index.ts",
        "src/cli.ts",
        "src/agents/core/index.ts",
      ])
    })

    it("#given multiple skills matching different files #when activating #then returns all activations", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "ts-skill",
            description: "TypeScript skill",
            paths: ["src/**/*.ts"],
          }),
          scope: "project",
          path: "/project/skills/ts",
        },
        {
          definition: createSkillDefinition({
            name: "py-skill",
            description: "Python skill",
            paths: ["**/*.py"],
          }),
          scope: "project",
          path: "/project/skills/py",
        },
      ]
      const result = activateConditionalSkills(skills, ["src/index.ts", "main.py"])
      expect(result).toHaveLength(2)
      expect(result[0].skill.definition.name).toBe("ts-skill")
      expect(result[0].matchedPaths).toEqual(["src/index.ts"])
      expect(result[1].skill.definition.name).toBe("py-skill")
      expect(result[1].matchedPaths).toEqual(["main.py"])
    })

    it("#given same file matching multiple patterns in same skill #when activating #then deduplicates path", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "dup-skill",
            description: "Duplicate pattern skill",
            paths: ["src/**/*.ts", "src/**/*.ts"],
          }),
          scope: "project",
          path: "/project/skills/dup",
        },
      ]
      const result = activateConditionalSkills(skills, ["src/index.ts"])
      expect(result).toHaveLength(1)
      expect(result[0].matchedPaths).toEqual(["src/index.ts"])
    })

    it("#given empty file paths array #when activating #then returns empty", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "ts-skill",
            description: "TypeScript skill",
            paths: ["src/**/*.ts"],
          }),
          scope: "project",
          path: "/project/skills/ts",
        },
      ]
      const result = activateConditionalSkills(skills, [])
      expect(result).toEqual([])
    })

    it("#given glob pattern with ? wildcard #when matching #then matches single character", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "test-skill",
            description: "Test skill",
            paths: ["src/test?.ts"],
          }),
          scope: "project",
          path: "/project/skills/test",
        },
      ]
      const result = activateConditionalSkills(skills, ["src/test1.ts"])
      expect(result).toHaveLength(1)
      expect(result[0].matchedPaths).toEqual(["src/test1.ts"])

      const noMatch = activateConditionalSkills(skills, ["src/test12.ts"])
      expect(noMatch).toHaveLength(0)
    })
  })

  describe("filterSkillsByInvocation", () => {
    it("#given skills with mixed userInvocable #when filtering #then returns only invocable", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "auto-skill",
            description: "Auto-only skill",
            userInvocable: false,
          }),
          scope: "project",
          path: "/project/skills/auto",
        },
        {
          definition: createSkillDefinition({
            name: "user-skill",
            description: "User can invoke",
            userInvocable: true,
          }),
          scope: "project",
          path: "/project/skills/user",
        },
        {
          definition: createSkillDefinition({
            name: "no-flag-skill",
            description: "No flag set",
          }),
          scope: "project",
          path: "/project/skills/noflag",
        },
      ]

      const result = filterSkillsByInvocation(skills)

      expect(result).toHaveLength(1)
      expect(result[0].definition.name).toBe("user-skill")
    })

    it("#given all skills are userInvocable #when filtering #then returns all", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "skill1",
            description: "Skill 1",
            userInvocable: true,
          }),
          scope: "project",
          path: "/p/s1",
        },
        {
          definition: createSkillDefinition({
            name: "skill2",
            description: "Skill 2",
            userInvocable: true,
          }),
          scope: "user",
          path: "/g/s2",
        },
      ]

      const result = filterSkillsByInvocation(skills)

      expect(result).toHaveLength(2)
    })

    it("#given no skills #when filtering #then returns empty", () => {
      const result = filterSkillsByInvocation([])
      expect(result).toEqual([])
    })
  })

  describe("groupSkillsByAgent", () => {
    it("#given skills with agent field #when grouping #then groups by agent", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "sisyphus-skill",
            description: "Sisyphus skill",
            agent: "sisyphus",
          }),
          scope: "project",
          path: "/p/s1",
        },
        {
          definition: createSkillDefinition({
            name: "oracle-skill",
            description: "Oracle skill",
            agent: "oracle",
          }),
          scope: "project",
          path: "/p/s2",
        },
        {
          definition: createSkillDefinition({
            name: "another-sisyphus",
            description: "Another sisyphus skill",
            agent: "sisyphus",
          }),
          scope: "project",
          path: "/p/s3",
        },
      ]

      const result = groupSkillsByAgent(skills)

      expect(result.size).toBe(2)
      expect(result.get("sisyphus")).toHaveLength(2)
      expect(result.get("oracle")).toHaveLength(1)
    })

    it("#given skills with no agent field #when grouping #then groups under general", () => {
      const skills: Skill[] = [
        {
          definition: createSkillDefinition({
            name: "skill1",
            description: "Skill 1",
          }),
          scope: "project",
          path: "/p/s1",
        },
        {
          definition: createSkillDefinition({
            name: "skill2",
            description: "Skill 2",
            agent: "oracle",
          }),
          scope: "project",
          path: "/p/s2",
        },
      ]

      const result = groupSkillsByAgent(skills)

      expect(result.size).toBe(2)
      expect(result.get("general")).toHaveLength(1)
      expect(result.get("oracle")).toHaveLength(1)
    })

    it("#given no skills #when grouping #then returns empty map", () => {
      const result = groupSkillsByAgent([])
      expect(result.size).toBe(0)
    })
  })
})

// #endregion
