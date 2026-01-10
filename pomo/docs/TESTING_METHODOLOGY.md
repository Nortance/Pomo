# Testing Methodology

This document outlines the testing philosophy, conventions, and best practices for the CodeFocus Pomodoro app.

## Testing Philosophy

### Test Behavior, Not Implementation

> "The more your tests resemble the way your software is used, the more confidence they can give you."
> — Testing Library guiding principle

- Test **what** the code does, not **how** it does it
- Focus on inputs and outputs, not internal state
- If a refactor doesn't change behavior, tests shouldn't break

### Test Pyramid

```
        /\
       /  \      E2E Tests (Playwright)
      /----\     - Full user flows
     /      \    - Real browser
    /--------\   Integration Tests
   /          \  - Component interactions
  /------------\ Unit Tests (Vitest)
                 - Pure functions
                 - Isolated logic
```

**Priority**: Unit tests > Integration tests > E2E tests

### What to Test

| Test | Don't Test |
|------|------------|
| Business logic calculations | Implementation details |
| State mutations and their effects | Private functions |
| User-facing behavior | Third-party library internals |
| Edge cases and error handling | CSS styling |
| Critical paths | Trivial getters/setters |

## Test File Organization

### Naming Convention

```
lib/stats.ts           →  __tests__/lib/stats.test.ts
lib/achievements.ts    →  __tests__/lib/achievements.test.ts
hooks/use-app-state.ts →  __tests__/hooks/use-app-state.test.tsx
```

### File Extension Rules

- `.test.ts` - Pure TypeScript tests (no JSX)
- `.test.tsx` - Tests with React components (JSX)

## Test Structure (AAA Pattern)

```typescript
describe('functionName', () => {
  describe('when condition', () => {
    it('should expected behavior', () => {
      // Arrange - Set up test data
      const input = createTestData()

      // Act - Execute the function
      const result = functionName(input)

      // Assert - Verify the outcome
      expect(result).toEqual(expectedOutput)
    })
  })
})
```

### Naming Conventions

- `describe` blocks: Function or component name
- Nested `describe`: Specific scenario ("when X", "with Y")
- `it` blocks: Start with "should" + expected behavior

**Good examples:**
```typescript
describe('calculateStreak', () => {
  describe('when dailyStats is empty', () => {
    it('should return 0', () => { ... })
  })

  describe('when there is activity today', () => {
    it('should count consecutive days including today', () => { ... })
  })
})
```

## Mocking Guidelines

### When to Mock

| Mock | Don't Mock |
|------|------------|
| External APIs | Pure functions |
| Browser APIs (localStorage, Audio) | Application logic |
| Time-dependent code (Date, timers) | Simple utilities |
| Third-party libraries with side effects | Data transformations |

### Mocking Patterns

**localStorage** (already mocked in `vitest.setup.ts`):
```typescript
// Automatically reset before each test
localStorage.setItem('key', 'value')
```

**Date/Time**:
```typescript
import { vi } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-15'))
})

afterEach(() => {
  vi.useRealTimers()
})
```

**Functions**:
```typescript
const mockFn = vi.fn()
mockFn.mockReturnValue('result')
mockFn.mockImplementation(() => 'custom')
```

## Coverage Goals

| Metric | Target |
|--------|--------|
| Statements | 80%+ |
| Branches | 75%+ |
| Functions | 85%+ |
| Lines | 80%+ |

**Focus coverage on:**
- `lib/stats.ts` - 100% (pure functions, critical logic)
- `lib/achievements.ts` - 100% (gamification logic)
- `lib/storage.ts` - 90%+ (data persistence)
- Hooks - 80%+ (state management)

## Testing Pure Functions

Pure functions are the easiest and most valuable to test.

### Characteristics of Pure Functions
- Same input always produces same output
- No side effects
- No external dependencies

### Testing Pattern
```typescript
describe('calculateLevel', () => {
  it.each([
    [0, 'Apprentice', 1],
    [1500, 'Craftsman', 2],    // 25 hours
    [6000, 'Master', 3],       // 100 hours
    [30000, 'Grandmaster', 4], // 500 hours
  ])('with %i minutes should return %s tier %i', (minutes, name, tier) => {
    const result = calculateLevel(minutes)
    expect(result.name).toBe(name)
    expect(result.tier).toBe(tier)
  })
})
```

## Testing React Hooks

Use `@testing-library/react` for hook testing.

```typescript
import { renderHook, act } from '@testing-library/react'

describe('useCounter', () => {
  it('should increment count', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

## Testing Components

Use React Testing Library queries in priority order:

1. `getByRole` - Accessible queries (best)
2. `getByLabelText` - Form elements
3. `getByText` - Text content
4. `getByTestId` - Last resort

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

describe('TaskList', () => {
  it('should call onSelectTask when task is clicked', () => {
    const onSelectTask = vi.fn()
    render(<TaskList tasks={[mockTask]} onSelectTask={onSelectTask} />)

    fireEvent.click(screen.getByText('Task Name'))

    expect(onSelectTask).toHaveBeenCalledWith('task-id')
  })
})
```

## Running Tests

```bash
npm test           # Watch mode (development)
npm run test:run   # Single run (CI)
npm run test:coverage  # With coverage report
```

## Continuous Integration

Tests run automatically on:
- Pre-commit hooks (if configured)
- Pull request checks
- Main branch pushes

All tests must pass before merging.
