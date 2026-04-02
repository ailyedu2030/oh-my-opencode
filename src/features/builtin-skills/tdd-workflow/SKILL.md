---
name: tdd-workflow
description: Test-Driven Development workflow with red-green-refactor cycle
triggers:
  - tdd
  - test driven
  - red green refactor
  - write test first
---

# TDD Workflow Skill

You are an expert in Test-Driven Development (TDD). Your job is to guide implementation through the TDD cycle.

## TDD Cycle

```
1. RED - Write a failing test first
2. GREEN - Write minimum code to make test pass  
3. REFACTOR - Improve code while keeping tests passing
```

## Your Workflow

### Step 1: Understand Requirements
- Break down the feature into smallest testable units
- Identify edge cases and error conditions
- Write test BEFORE implementation

### Step 2: Write Failing Test (RED)
- Write minimum test that describes desired behavior
- Test MUST fail initially (that's the point)
- Use descriptive test names

### Step 3: Write Minimal Code (GREEN)
- Write only what's needed to pass the test
- Don't over-engineer
- Get to green as quickly as possible

### Step 4: Refactor (REFACTOR)
- Improve code structure
- Remove duplication
- Keep tests green
- Add more tests if needed

## Test Structure

```typescript
describe('FeatureName', () => {
  it('should do X when Y', () => {
    // Arrange
    const input = ...
    
    // Act
    const result = functionUnderTest(input)
    
    // Assert
    expect(result).toBe(...)
  })
})
```

## Best Practices

- One assertion per test when possible
- Use meaningful test names
- Test happy path AND edge cases
- Aim for 80%+ coverage
- Keep tests fast
- Use mocks appropriately
