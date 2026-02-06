/**
 * Data layer exports - Refactored for simplicity and consistency
 * Main entry point for all data operations
 */

// Core types
export type { CleanTable, CleanField, CleanRelations, QueryOptions, MutationOptions, Filter } from './data.types';

// Field selection types and utilities
export type { FieldSelection, SimpleFieldSelection, FieldSelectionPreset } from './field-selector';

export { convertToSelectionOptions, validateFieldSelection } from './field-selector';

// Main unified hook (recommended)
export { useTable, queryKeys, type UseTableOptions, type UseTableResult } from './hooks';

// Query generation utilities
export {
	buildSelect,
	buildFindOne,
	buildCount,
	buildPostGraphileCreate,
	buildPostGraphileUpdate,
	buildPostGraphileDelete,
	toCamelCasePlural,
	createASTQueryBuilder,
} from './query-generator';

// Error handling
export {
	DataError,
	DataErrorType,
	createError,
	parseError,
	// Human-readable error utilities
	getHumanReadableError,
	getConstraintMessage,
	CONSTRAINT_MESSAGES,
	// Backwards compatibility aliases
	parseError as parseGraphQLError,
} from './error-handler';

// Mutation input filtering utilities
export {
	prepareMutationInput,
	prepareCreateInput,
	prepareUpdateInput,
	preparePatchInput,
	type PrepareInputOptions,
} from './mutation-input';

// Additional utilities
export * from './type-mapping';

// Re-export commonly used items for convenience
export { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
export { execute } from '@/graphql/execute';
