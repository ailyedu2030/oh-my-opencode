---
name: coding-standards
description: Coding standards, style guidelines, and code smells to avoid
triggers:
  - coding standards
  - code style
  - code smell
  - best practices
  - style guide
---

# Coding Standards Skill

You are an expert in coding standards and best practices. Your role is to ensure code is clean, maintainable, and follows industry standards.

## General Principles

1. **Readability over cleverness** - Code is read more often than written
2. **Consistency** - Follow existing patterns in the codebase
3. **Single Responsibility** - Functions/classes should do one thing well
4. **Don't Repeat Yourself (DRY)** - Avoid code duplication
5. **Keep it Simple (KISS)** - Avoid unnecessary complexity

## Naming Conventions

- **Variables/functions**: Use camelCase (`userName`, `calculateTotal()`)
- **Classes/Types**: Use PascalCase (`UserService`, `ApiResponse`)
- **Constants**: Use UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_BASE_URL`)
- **Files**: Use kebab-case (`user-service.ts`, `api-response.ts`)
- **Private members**: Prefix with underscore (`_internalMethod()`, `_privateField`)

## Code Style Guidelines

### TypeScript/JavaScript

```typescript
// Good
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// Bad
function calcTot(p: number, q: number) {
  return p * q;
}
```

### Python

```python
# Good
def calculate_total(price: float, quantity: int) -> float:
    return price * quantity

# Bad
def calc_tot(p, q):
    return p * q
```

### Java/Kotlin

```java
// Good
public BigDecimal calculateTotal(BigDecimal price, int quantity) {
    return price.multiply(BigDecimal.valueOf(quantity));
}

// Bad
public BigDecimal calcTot(BigDecimal p, int q) {
    return p.multiply(BigDecimal.valueOf(q));
}
```

## Common Code Smells to Avoid

1. **Magic Numbers/Strings** - Use named constants instead
2. **Long Functions** - Split into smaller, focused functions
3. **Deep Nesting** - Use early returns or guard clauses
4. **Duplicate Code** - Extract to shared functions/components
5. **God Classes** - Split into smaller, focused classes
6. **Unused Variables/Imports** - Remove them
7. **Inconsistent Naming** - Follow the project's conventions
8. **Empty Catch Blocks** - Always handle errors properly

## Error Handling

- Always handle errors explicitly - no empty catch blocks
- Provide meaningful error messages
- Use try-catch for operations that can fail
- Prefer specific exception types over generic ones
- Clean up resources in finally blocks or using try-with-resources

## Comments

- Explain **WHY**, not **WHAT**
- Keep comments up-to-date with code changes
- Avoid obvious comments that add no value
- Use JSDoc/TSDoc for public APIs
- Remove commented-out code

## Testing

- Write tests for critical functionality
- Test edge cases and error conditions
- Keep tests maintainable and readable
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

## Best Practices by Language

### TypeScript

- Enable strict mode
- Avoid `any` type - use `unknown` instead
- Use proper type annotations
- Leverage generics appropriately
- Prefer interfaces for object shapes
- Use types for unions and intersections

### Python

- Follow PEP 8 style guide
- Use type hints (PEP 484)
- Prefer list comprehensions over map/filter
- Use context managers (`with` statements) for resources
- Avoid mutable default arguments

### Java

- Follow Java Coding Conventions
- Use meaningful package names
- Prefer composition over inheritance
- Use dependency injection
- Avoid null references - use Optional

### Go

- Follow Go's official style guide
- Use short, descriptive variable names
- Prefer composition over inheritance
- Use interfaces for abstraction
- Handle errors explicitly

## Refactoring Tips

- **Extract Method**: When a function gets too long
- **Rename**: When names don't reflect purpose
- **Replace Magic Number**: With named constant
- **Simplify Conditional**: Use guard clauses or early returns
- **Remove Duplication**: Extract shared logic
