import type { AgentPromptMetadata } from "./types"

export interface AvailableAgent {
  name: string
  description: string
  metadata: AgentPromptMetadata
}

export interface AvailableTool {
  name: string
  category: "lsp" | "ast" | "search" | "session" | "command" | "other"
}

export interface AvailableSkill {
  name: string
  description: string
  location: "user" | "project" | "plugin"
}

export interface AvailableCategory {
  name: string
  description: string
  model?: string
}

export function categorizeTools(toolNames: string[]): AvailableTool[] {
  return toolNames.map((name) => {
    let category: AvailableTool["category"] = "other"
    if (name.startsWith("lsp_")) {
      category = "lsp"
    } else if (name.startsWith("ast_grep")) {
      category = "ast"
    } else if (name === "grep" || name === "glob") {
      category = "search"
    } else if (name.startsWith("session_")) {
      category = "session"
    } else if (name === "skill") {
      category = "command"
    }
    return { name, category }
  })
}

function formatToolsForPrompt(tools: AvailableTool[]): string {
  const lspTools = tools.filter((t) => t.category === "lsp")
  const astTools = tools.filter((t) => t.category === "ast")
  const searchTools = tools.filter((t) => t.category === "search")

  const parts: string[] = []

  if (searchTools.length > 0) {
    parts.push(...searchTools.map((t) => `\`${t.name}\``))
  }

  if (lspTools.length > 0) {
    parts.push("`lsp_*`")
  }

  if (astTools.length > 0) {
    parts.push("`ast_grep`")
  }

  return parts.join(", ")
}

export function buildKeyTriggersSection(agents: AvailableAgent[], _skills: AvailableSkill[] = []): string {
  const keyTriggers = agents
    .filter((a) => a.metadata.keyTrigger)
    .map((a) => `- ${a.metadata.keyTrigger}`)

  if (keyTriggers.length === 0) return ""

  return `### Key Triggers (check BEFORE classification):

${keyTriggers.join("\n")}
- **"Look into" + "create PR"** → Not just research. Full implementation cycle expected.`
}

export function buildToolSelectionTable(
  agents: AvailableAgent[],
  tools: AvailableTool[] = [],
  _skills: AvailableSkill[] = []
): string {
  const rows: string[] = [
    "### Tool & Agent Selection:",
    "",
  ]

  if (tools.length > 0) {
    const toolsDisplay = formatToolsForPrompt(tools)
    rows.push(`- ${toolsDisplay} — **FREE** — Not Complex, Scope Clear, No Implicit Assumptions`)
  }

  const costOrder = { FREE: 0, CHEAP: 1, EXPENSIVE: 2 }
  const sortedAgents = [...agents]
    .filter((a) => a.metadata.category !== "utility")
    .sort((a, b) => costOrder[a.metadata.cost] - costOrder[b.metadata.cost])

  for (const agent of sortedAgents) {
    const shortDesc = agent.description.split(".")[0] || agent.description
    rows.push(`- \`${agent.name}\` agent — **${agent.metadata.cost}** — ${shortDesc}`)
  }

  rows.push("")
  rows.push("**Default flow**: explore/librarian (background) + tools → oracle (if required)")

  return rows.join("\n")
}

export function buildExploreSection(agents: AvailableAgent[]): string {
  const exploreAgent = agents.find((a) => a.name === "explore")
  if (!exploreAgent) return ""

  const useWhen = exploreAgent.metadata.useWhen || []
  const avoidWhen = exploreAgent.metadata.avoidWhen || []

  return `### Explore Agent = Contextual Grep

Use it as a **peer tool**, not a fallback. Fire liberally.

**Use Direct Tools when:**
${avoidWhen.map((w) => `- ${w}`).join("\n")}

**Use Explore Agent when:**
${useWhen.map((w) => `- ${w}`).join("\n")}`
}

export function buildLibrarianSection(agents: AvailableAgent[]): string {
  const librarianAgent = agents.find((a) => a.name === "librarian")
  if (!librarianAgent) return ""

  const useWhen = librarianAgent.metadata.useWhen || []

  return `### Librarian Agent = Reference Grep

Search **external references** (docs, OSS, web). Fire proactively when unfamiliar libraries are involved.

**Contextual Grep (Internal)** — search OUR codebase, find patterns in THIS repo, project-specific logic.
**Reference Grep (External)** — search EXTERNAL resources, official API docs, library best practices, OSS implementation examples.

**Trigger phrases** (fire librarian immediately):
${useWhen.map((w) => `- "${w}"`).join("\n")}`
}

export function buildDelegationTable(agents: AvailableAgent[]): string {
  const rows: string[] = [
    "### Delegation Table:",
    "",
  ]

  for (const agent of agents) {
    for (const trigger of agent.metadata.triggers) {
      rows.push(`- **${trigger.domain}** → \`${agent.name}\` — ${trigger.trigger}`)
    }
  }

  return rows.join("\n")
}


export function buildCategorySkillsDelegationGuide(categories: AvailableCategory[], skills: AvailableSkill[]): string {
  if (categories.length === 0 && skills.length === 0) return ""

  const categoryRows = categories.map((c) => {
    const desc = c.description || c.name
    return `- \`${c.name}\` — ${desc}`
  })

  const builtinSkills = skills.filter((s) => s.location === "plugin")
  const customSkills = skills.filter((s) => s.location !== "plugin")

  const builtinNames = builtinSkills.map((s) => s.name).join(", ")
  const customNames = customSkills.map((s) => {
    const source = s.location === "project" ? "project" : "user"
    return `${s.name} (${source})`
  }).join(", ")

  let skillsSection: string

  if (customSkills.length > 0 && builtinSkills.length > 0) {
    skillsSection = `#### Available Skills (via \`skill\` tool)

**Built-in**: ${builtinNames}
**⚡ YOUR SKILLS (PRIORITY)**: ${customNames}

> User-installed skills OVERRIDE built-in defaults. ALWAYS prefer YOUR SKILLS when domain matches.
> Full skill descriptions → use the \`skill\` tool to check before EVERY delegation.`
  } else if (customSkills.length > 0) {
    skillsSection = `#### Available Skills (via \`skill\` tool)

**⚡ YOUR SKILLS (PRIORITY)**: ${customNames}

> User-installed skills OVERRIDE built-in defaults. ALWAYS prefer YOUR SKILLS when domain matches.
> Full skill descriptions → use the \`skill\` tool to check before EVERY delegation.`
  } else if (builtinSkills.length > 0) {
    skillsSection = `#### Available Skills (via \`skill\` tool)

**Built-in**: ${builtinNames}

> Full skill descriptions → use the \`skill\` tool to check before EVERY delegation.`
  } else {
    skillsSection = ""
  }

  return `### Category + Skills Delegation System

**task() combines categories and skills for optimal task execution.**

#### Available Categories (Domain-Optimized Models)

Each category is configured with a model optimized for that domain. Read the description to understand when to use it.

${categoryRows.join("\n")}

${skillsSection}

---

### MANDATORY: Category + Skill Selection Protocol

**STEP 1: Select Category**
- Read each category's description
- Match task requirements to category domain
- Select the category whose domain BEST fits the task

**STEP 2: Evaluate ALL Skills**
Check the \`skill\` tool for available skills and their descriptions. For EVERY skill, ask:
> "Does this skill's expertise domain overlap with my task?"

- If YES → INCLUDE in \`load_skills=[...]\`
- If NO → OMIT (no justification needed)
${customSkills.length > 0 ? `
> **User-installed skills get PRIORITY.** When in doubt, INCLUDE rather than omit.` : ""}

---

### Delegation Pattern

\`\`\`typescript
task(
  category="[selected-category]",
  load_skills=["skill-1", "skill-2"],  // Include ALL relevant skills — ESPECIALLY user-installed ones
  prompt="..."
)
\`\`\`

**ANTI-PATTERN (will produce poor results):**
\`\`\`typescript
task(category="...", load_skills=[], run_in_background=false, prompt="...")  // Empty load_skills without justification
\`\`\``
}

export function buildOracleSection(agents: AvailableAgent[]): string {
  const oracleAgent = agents.find((a) => a.name === "oracle")
  if (!oracleAgent) return ""

  const useWhen = oracleAgent.metadata.useWhen || []
  const avoidWhen = oracleAgent.metadata.avoidWhen || []

  return `<Oracle_Usage>
## Oracle — Read-Only High-IQ Consultant

Oracle is a read-only, expensive, high-quality reasoning model for debugging and architecture. Consultation only.

### WHEN to Consult (Oracle FIRST, then implement):

${useWhen.map((w) => `- ${w}`).join("\n")}

### WHEN NOT to Consult:

${avoidWhen.map((w) => `- ${w}`).join("\n")}

### Usage Pattern:
Briefly announce "Consulting Oracle for [reason]" before invocation.

**Exception**: This is the ONLY case where you announce before acting. For all other work, start immediately without status updates.

### Oracle Background Task Policy:

**You MUST collect Oracle results before your final answer. No exceptions.**

- Oracle may take several minutes. This is normal and expected.
- When Oracle is running and you finish your own exploration/analysis, your next action is \`background_output(task_id="...")\` on Oracle — NOT delivering a final answer.
- Oracle catches blind spots you cannot see — its value is HIGHEST when you think you don't need it.
- **NEVER** cancel Oracle. **NEVER** use \`background_cancel(all=true)\` when Oracle is running. Cancel disposable tasks (explore, librarian) individually by taskId instead.
</Oracle_Usage>`
}

export function buildHardBlocksSection(): string {
  const blocks = [
    "- Type error suppression (`as any`, `@ts-ignore`) — **Never**",
    "- Commit without explicit request — **Never**",
    "- Speculate about unread code — **Never**",
    "- Leave code in broken state after failures — **Never**",
    "- `background_cancel(all=true)` when Oracle is running — **Never.** Cancel tasks individually by taskId.",
    "- Delivering final answer before collecting Oracle result — **Never.** Always `background_output` Oracle first.",
  ]

  return `## Hard Blocks (NEVER violate)

${blocks.join("\n")}`
}

export function buildAntiPatternsSection(): string {
  const patterns = [
    "- **Type Safety**: `as any`, `@ts-ignore`, `@ts-expect-error`",
    "- **Error Handling**: Empty catch blocks `catch(e) {}`",
    "- **Testing**: Deleting failing tests to \"pass\"",
    "- **Search**: Firing agents for single-line typos or obvious syntax errors",
    "- **Debugging**: Shotgun debugging, random changes",
    "- **Background Tasks**: `background_cancel(all=true)` — always cancel individually by taskId",
    "- **Oracle**: Skipping Oracle results when Oracle was launched — ALWAYS collect via `background_output`",
  ]

  return `## Anti-Patterns (BLOCKING violations)

${patterns.join("\n")}`
}

export function buildDeepParallelSection(model: string, categories: AvailableCategory[]): string {
  const isNonClaude = !model.toLowerCase().includes('claude')
  const hasDeepCategory = categories.some(c => c.name === 'deep')

  if (!isNonClaude || !hasDeepCategory) return ""

  return `### Deep Parallel Delegation

For implementation tasks, actively decompose and delegate to \`deep\` category agents in parallel.

1. Break the implementation into independent work units
2. Maximize parallel deep agents — spawn one per independent unit (\`run_in_background=true\`)
3. Give each agent a GOAL, not step-by-step instructions — deep agents explore and solve autonomously
4. Collect results, integrate, verify coherence`
}

export function buildUltraworkSection(
  agents: AvailableAgent[],
  categories: AvailableCategory[],
  skills: AvailableSkill[]
): string {
  const lines: string[] = []

  if (categories.length > 0) {
    lines.push("**Categories** (for implementation tasks):")
    for (const cat of categories) {
      const shortDesc = cat.description || cat.name
      lines.push(`- \`${cat.name}\`: ${shortDesc}`)
    }
    lines.push("")
  }

  if (skills.length > 0) {
    const builtinSkills = skills.filter((s) => s.location === "plugin")
    const customSkills = skills.filter((s) => s.location !== "plugin")

    if (builtinSkills.length > 0) {
      lines.push("**Built-in Skills** (combine with categories):")
      for (const skill of builtinSkills) {
        const shortDesc = skill.description.split(".")[0] || skill.description
        lines.push(`- \`${skill.name}\`: ${shortDesc}`)
      }
      lines.push("")
    }

    if (customSkills.length > 0) {
      lines.push("**User-Installed Skills** (HIGH PRIORITY - user installed these for their workflow):")
      for (const skill of customSkills) {
        const shortDesc = skill.description.split(".")[0] || skill.description
        lines.push(`- \`${skill.name}\`: ${shortDesc}`)
      }
      lines.push("")
    }
  }

  if (agents.length > 0) {
    const ultraworkAgentPriority = ["explore", "librarian", "plan", "oracle"]
    const sortedAgents = [...agents].sort((a, b) => {
      const aIdx = ultraworkAgentPriority.indexOf(a.name)
      const bIdx = ultraworkAgentPriority.indexOf(b.name)
      if (aIdx === -1 && bIdx === -1) return 0
      if (aIdx === -1) return 1
      if (bIdx === -1) return -1
      return aIdx - bIdx
    })

    lines.push("**Agents** (for specialized consultation/exploration):")
    for (const agent of sortedAgents) {
      const shortDesc = agent.description.length > 120 ? agent.description.slice(0, 120) + "..." : agent.description
      const suffix = agent.name === "explore" || agent.name === "librarian" ? " (multiple)" : ""
      lines.push(`- \`${agent.name}${suffix}\`: ${shortDesc}`)
    }
  }

  return lines.join("\n")
}



export interface AvailableCommand {
  name: string
  description: string
  argumentHint?: string
}

// Command triggers mapping - defines when Sisyphus should auto-suggest commands
// Supports both English and Chinese patterns
const COMMAND_TRIGGER_MAP: Record<string, { trigger: string; action: string; actionZh: string }> = {
  verify: {
    trigger: "verify|validation|test.*pass|check.*requirement|meets.*criteria|验证|检查需求|满足标准|测试通过",
    action: "Run /verify to validate implementation against requirements",
    actionZh: "运行 /verify 验证实现是否满足需求",
  },
  checkpoint: {
    trigger: "save.*progress|checkpoint|backup.*state|preserve.*work|保存进度|存档|备份状态",
    action: "Run /checkpoint to save current progress",
    actionZh: "运行 /checkpoint 保存当前进度",
  },
  learn: {
    trigger: "learn.*pattern|extract.*knowledge|build.*knowledge.*base|学习模式|提取模式|构建知识库",
    action: "Run /learn to extract patterns from codebase",
    actionZh: "运行 /learn 从代码库提取模式",
  },
  "learn-eval": {
    trigger: "evaluate.*pattern|assess.*knowledge|review.*learned|评估模式|评估知识|审查学习",
    action: "Run /learn-eval to evaluate learned patterns",
    actionZh: "运行 /learn-eval 评估已学习的模式",
  },
  "instinct-code": {
    trigger: "recall.*pattern|remember.*solution|from.*memory|回忆模式|记住方案|从记忆",
    action: "Run /instinct-code to recall coding patterns",
    actionZh: "运行 /instinct-code 回忆编码模式",
  },
  "instinct-refine": {
    trigger: "refine.*pattern|improve.*learned|update.*pattern|优化模式|改进已学|更新模式",
    action: "Run /instinct-refine to refine existing patterns",
    actionZh: "运行 /instinct-refine 优化现有模式",
  },
  "instinct-review": {
    trigger: "review.*pattern|curate.*knowledge|check.*learned|审查模式|整理知识|检查已学",
    action: "Run /instinct-review to review and curate learned patterns",
    actionZh: "运行 /instinct-review 审查和整理已学习的模式",
  },
  evolve: {
    trigger: "evolve.*knowledge|adapt.*pattern|update.*learned|演进知识|更新模式|适应模式",
    action: "Run /evolve to evolve knowledge base",
    actionZh: "运行 /evolve 演进知识库",
  },
  tdd: {
    trigger: "tdd|test.*first|test.*driven|red.*green.*refactor|测试驱动|TDD|先写测试",
    action: "Run /run-tdd for Test-Driven Development workflow",
    actionZh: "运行 /run-tdd 进行测试驱动开发",
  },
  e2e: {
    trigger: "e2e.*test|end.*to.*end|playwright|cypress|integration.*test|端到端测试|E2E|集成测试",
    action: "Run /e2e-test for end-to-end testing",
    actionZh: "运行 /e2e-test 进行端到端测试",
  },
  "code-review": {
    trigger: "code.*review|review.*code|quality.*check|security.*review|代码审查|质量检查",
    action: "Run /review-code for code quality review",
    actionZh: "运行 /review-code 进行代码质量审查",
  },
  security: {
    trigger: "security.*check|vulnerability|security.*review|penetration|安全检查|漏洞|安全审查|渗透测试",
    action: "Run /check-security for security vulnerability assessment",
    actionZh: "运行 /check-security 进行安全漏洞评估",
  },
  "build-fix": {
    trigger: "build.*error|compile.*error|fix.*build|type.*error|构建错误|编译错误|类型错误",
    action: "Run /fix-build to resolve build errors",
    actionZh: "运行 /fix-build 修复构建错误",
  },
  refactor: {
    trigger: "refactor|clean.*up|reduce.*debt|improve.*code|重构|清理|减少债务|优化代码",
    action: "Run /refactor for intelligent refactoring",
    actionZh: "运行 /refactor 进行智能重构",
  },
  plan: {
    trigger: "create.*plan|plan.*feature|break.*down|implementation.*plan|创建计划|规划功能|分解任务|实施方案",
    action: "Run /plan to create detailed implementation plan",
    actionZh: "运行 /plan 创建详细实施计划",
  },
  handoff: {
    trigger: "handoff|continue.*session|context.*summary|transfer.*context|交接|继续会话|上下文总结|转移上下文",
    action: "Run /handoff to create context summary for new session",
    actionZh: "运行 /handoff 创建新会话的上下文摘要",
  },
  "start-work": {
    trigger: "start.*work|execute.*plan|begin.*implementation|开始工作|执行计划|开始实施",
    action: "Run /start-work to begin execution from Prometheus plan",
    actionZh: "运行 /start-work 开始从 Prometheus 计划执行",
  },
  "init-deep": {
    trigger: "init.*deep|generate.*agents\.md|hierarchical.*context|初始化深度|生成AGENTS\.md|分层上下文",
    action: "Run /init-deep to initialize hierarchical AGENTS.md knowledge base",
    actionZh: "运行 /init-deep 初始化分层 AGENTS.md 知识库",
  },
  "ralph-loop": {
    trigger: "ralph.*loop|self.*referential|continuous.*development|拉尔夫循环|自引用|持续开发",
    action: "Run /ralph-loop for self-referential development loop",
    actionZh: "运行 /ralph-loop 进行自引用开发循环",
  },
  "ulw-loop": {
    trigger: "ulw.*loop|ultrawork|continuous.*ultrawork|ulw循环|ultrawork模式|持续 ultrawork",
    action: "Run /ulw-loop for ultrawork loop until completion",
    actionZh: "运行 /ulw-loop 进行 ultrawork 循环直到完成",
  },
  "cancel-ralph": {
    trigger: "cancel.*ralph|stop.*loop|abort.*continuation|取消拉尔夫|停止循环|中止继续",
    action: "Run /cancel-ralph to cancel active Ralph Loop",
    actionZh: "运行 /cancel-ralph 取消活跃的 Ralph 循环",
  },
  "stop-continuation": {
    trigger: "stop.*continuation|halt.*loop|end.*session|停止继续|停止循环|结束会话",
    action: "Run /stop-continuation to stop all continuation mechanisms",
    actionZh: "运行 /stop-continuation 停止所有继续机制",
  },
  "refactor-clean": {
    trigger: "refactor.*clean|cleanup.*code|reduce.*debt|clean.*refactor|清理重构|清理代码|减少债务",
    action: "Run /refactor-clean to clean up and reduce technical debt",
    actionZh: "运行 /refactor-clean 清理代码并减少技术债务",
  },
  pm2: {
    trigger: "pm2|process.*manager|deploy.*service|pm2|进程管理|部署服务",
    action: "Run /pm2 for PM2 process management and deployment",
    actionZh: "运行 /pm2 进行 PM2 进程管理和部署",
  },
  // Aliases
  "check-security": {
    trigger: "security.*check|vulnerability|security.*review|penetration|安全检查|漏洞|安全审查|渗透测试",
    action: "Run /check-security for security vulnerability assessment",
    actionZh: "运行 /check-security 进行安全漏洞评估",
  },
  "review-code": {
    trigger: "code.*review|review.*code|quality.*check|security.*review|代码审查|质量检查",
    action: "Run /review-code for code quality review",
    actionZh: "运行 /review-code 进行代码质量审查",
  },
  "run-tdd": {
    trigger: "tdd|test.*first|test.*driven|red.*green.*refactor|测试驱动|TDD|先写测试",
    action: "Run /run-tdd for Test-Driven Development workflow",
    actionZh: "运行 /run-tdd 进行测试驱动开发",
  },
  "fix-build": {
    trigger: "build.*error|compile.*error|fix.*build|type.*error|构建错误|编译错误|类型错误",
    action: "Run /fix-build to resolve build errors",
    actionZh: "运行 /fix-build 修复构建错误",
  },
  "e2e-test": {
    trigger: "e2e.*test|end.*to.*end|playwright|cypress|integration.*test|端到端测试|E2E|集成测试",
    action: "Run /e2e-test for end-to-end testing",
    actionZh: "运行 /e2e-test 进行端到端测试",
  },
}

export function buildCommandTriggersSection(commands: AvailableCommand[]): string {
  const triggers: string[] = []

  for (const cmd of commands) {
    const triggerInfo = COMMAND_TRIGGER_MAP[cmd.name]
    if (triggerInfo) {
      triggers.push(`- ${triggerInfo.action} | ${triggerInfo.actionZh}`)
    }
  }

  if (triggers.length === 0) return ""

  return `### Command Auto-Suggestion (使用中文或英文模式匹配时自动建议)

Sisyphus can automatically suggest/run these commands when relevant patterns are detected:
${triggers.join("\n")}

**Note**: 这些是自动建议。| These are auto-suggestions. 用户也可以直接输入 /command-name 来调用命令。| Users can also explicitly invoke any command by typing /command-name.`
}