# Data Library Test Suite

This directory contains comprehensive tests for the Constructive data library, which provides a unified interface for dynamic GraphQL query generation and data management.

## Overview

The data library is a sophisticated system that:

- Dynamically generates GraphQL queries using AST-based approach
- Provides unified React hooks for data operations (CRUD)
- Handles complex PostgreSQL/PostGraphile field types
- Manages field selection with presets and custom options
- Implements robust error handling and retry logic
- Integrates with React Query for caching and state management

## Test Structure

### Core Test Files

1. **`data.types.test.ts`** - Core type definitions and utilities
   - Tests `CleanTable`, `CleanField`, and `Filter` types
   - Tests type conversion from PostGraphile meta schema
   - Validates type safety and edge cases

2. **`field-selector.test.ts`** - Field selection system
   - Tests preset selections (`minimal`, `display`, `all`, `full`)
   - Tests custom field selection with include/exclude
   - Tests validation and complex field handling

3. **`error-handler.test.ts`** - Error handling and retry logic
   - Tests error classification and factory functions
   - Tests retry logic with exponential backoff
   - Tests GraphQL error parsing and handling

4. **`query-generator.test.ts`** - AST-based query building
   - Tests query generation for select, create, update, delete
   - Tests PostGraphile-specific mutations
   - Tests field selection integration

5. **`hooks.test.ts`** - Unified hooks system
   - Tests the main `useTable` hook
   - Tests query key management and caching
   - Tests CRUD operations and React Query integration

6. **`complex-fields.test.ts`** - Complex field handling
   - Tests complex GraphQL types (GeometryPoint, Interval, etc.)
   - Tests AST generation for complex fields
   - Tests subfield selection requirements

7. **`integration.test.ts`** - End-to-end integration
   - Tests complete data flow from hooks to GraphQL execution
   - Tests field selection, filtering, and sorting integration
   - Tests cache management and error recovery

8. **`performance-edge-cases.test.ts`** - Performance and robustness
   - Tests performance with large datasets and many fields
   - Tests edge cases like null values and malformed data
   - Tests boundary conditions and concurrent operations

### Test Infrastructure

- **`test-utils.ts`** - Provides mocks, fixtures, and helper functions
- **`fixtures.ts`** - Contains sample data and complex test scenarios
- **`simple.test.ts`** - Basic test to verify setup works

## Running Tests

### All Data Library Tests

```bash
# Run all data library tests
pnpm test:data

# Run with watch mode
pnpm test:data:watch

# Run with coverage
pnpm test:data:coverage
```

### Individual Test Files

```bash
# Run specific test file
pnpm test src/lib/data/__tests__/hooks.test.ts

# Run with watch mode
pnpm test:watch src/lib/data/__tests__/hooks.test.ts
```

### Test Categories

```bash
# Core functionality
pnpm test src/lib/data/__tests__/data.types.test.ts
pnpm test src/lib/data/__tests__/field-selector.test.ts
pnpm test src/lib/data/__tests__/query-generator.test.ts

# React integration
pnpm test src/lib/data/__tests__/hooks.test.ts

# Advanced features
pnpm test src/lib/data/__tests__/complex-fields.test.ts
pnpm test src/lib/data/__tests__/error-handler.test.ts

# Integration and performance
pnpm test src/lib/data/__tests__/integration.test.ts
pnpm test src/lib/data/__tests__/performance-edge-cases.test.ts
```

## Test Coverage Goals

The test suite aims for comprehensive coverage across:

### Unit Tests

- All public APIs and functions
- Type conversion utilities
- Field selection logic
- Error handling mechanisms
- Query generation functions

### Integration Tests

- Complete data flow workflows
- Hook interactions with React Query
- GraphQL execution integration
- Cache management scenarios

### Performance Tests

- Large dataset handling
- Concurrent operation management
- Memory usage optimization
- Query generation efficiency

### Edge Case Tests

- Null and undefined value handling
- Malformed data responses
- Network error scenarios
- Boundary value conditions

## Key Testing Patterns

### Mocking Strategy

- GraphQL execution is mocked for predictable testing
- React Query is properly wrapped for hook testing
- PostGraphile meta schema is mocked with realistic data
- Complex field types are tested with representative data

### Test Data

- Fixtures provide realistic table schemas and data
- Complex scenarios test edge cases and boundary conditions
- Performance tests use large datasets to verify scalability

### Error Testing

- Network errors, GraphQL errors, and validation errors are all tested
- Retry logic is verified with fake timers
- Error recovery scenarios are thoroughly covered

## Contributing

When adding new features to the data library:

1. **Add corresponding tests** in the appropriate test file
2. **Update fixtures** if new data structures are needed
3. **Add integration tests** for complete workflows
4. **Test edge cases** and error conditions
5. **Verify performance** with large datasets if applicable

### Test File Naming

- `*.test.ts` for unit and integration tests
- Use descriptive names matching the module being tested
- Group related tests in the same file

### Test Organization

- Use `describe` blocks to group related tests
- Use clear, descriptive test names
- Include both positive and negative test cases
- Test edge cases and boundary conditions

## Architecture Notes

The data library tests are designed to work with:

- **Vitest** as the test runner
- **@testing-library/react** for React component testing
- **React Query** for data fetching and caching
- **PostGraphile** introspection schema
- **GraphQL AST** generation and manipulation

The tests validate that the data library correctly:

- Converts PostGraphile meta schema to clean types
- Generates proper GraphQL queries using AST
- Handles complex PostgreSQL field types
- Provides a unified React hook interface
- Manages errors and retries appropriately
- Integrates seamlessly with React Query
