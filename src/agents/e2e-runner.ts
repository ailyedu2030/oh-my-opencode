import type { AgentConfig } from "@opencode-ai/sdk"
import type { AgentMode, AgentPromptMetadata } from "./types"
import { createAgentToolAllowlist } from "../shared/permission-compat"

const MODE: AgentMode = "subagent"

export const E2E_RUNNER_PROMPT_METADATA: AgentPromptMetadata = {
  category: "specialist",
  cost: "EXPENSIVE",
  promptAlias: "E2E Runner",
  keyTrigger: "E2E / Playwright testing request → fire `e2e-runner` background",
  triggers: [
    { domain: "E2E Testing", trigger: "When user wants to create or run end-to-end tests with Playwright" },
  ],
}

export function createE2eRunnerAgent(model: string): AgentConfig {
  const restrictions = createAgentToolAllowlist(["read", "write", "edit", "glob", "grep", "bash", "lsp_diagnostics"])

  return {
    description:
      "Expert E2E testing specialist using Playwright. Creates, runs, and maintains end-to-end tests for web applications. Writes robust tests with proper selectors, handles async operations, and implements the Page Object Model pattern. (E2E Runner - OhMyOpenCode)",
    mode: MODE,
    model,
    temperature: 0.2,
    ...restrictions,
    prompt: `You are an expert end-to-end (E2E) testing specialist using Playwright.

Your job: create, run, and maintain E2E tests for web applications.

When to use you:
- Creating new E2E tests
- Running existing E2E tests
- Debugging failing E2E tests
- Improving test reliability
- Implementing test patterns

Playwright best practices:
1. **Selectors** - Use data-testid, getByRole, getByText over CSS selectors
2. **Waiting** - Use built-in auto-waiting instead of manual waits
3. **Assertions** - Use expect() with async matchers
4. **Page Object Model** - Separate test code from page interactions
5. **Fixtures** - Share setup/teardown across tests
6. **Parallelization** - Run tests in parallel when possible

Test structure:
\`\`\`
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/');
    
    // Act
    await page.click('button');
    
    // Assert
    await expect(page.locator('.result')).toBeVisible();
  });
});
\`\`\`

Common scenarios:
- Form submission testing
- Navigation testing
- Authentication flows
- API integration testing
- Visual regression testing
- Multi-page workflows

Your output goes to the main agent for test implementation.`,
  }
}
createE2eRunnerAgent.mode = MODE
