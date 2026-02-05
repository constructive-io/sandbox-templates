/**
 * Test utilities for data library testing
 * Provides mocks, fixtures, and helper functions for comprehensive testing
 */
import { createElement, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, RenderHookOptions } from '@testing-library/react';
import { vi } from 'vitest';

import type { MetaQuery } from '../meta-query.types';

import type { CleanField, CleanTable } from '../data.types';

/**
 * Create a fresh QueryClient for each test
 */
export function createTestQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	});
}

/**
 * Wrapper component for React Query tests
 */
export function createWrapper(queryClient?: QueryClient) {
	const client = queryClient || createTestQueryClient();

	return ({ children }: { children: ReactNode }) => {
		return createElement(QueryClientProvider, { client }, children);
	};
}

/**
 * Render hook with React Query wrapper
 */
export function renderHookWithQuery<TResult, TProps>(
	hook: (props: TProps) => TResult,
	options?: RenderHookOptions<TProps> & { queryClient?: QueryClient },
) {
	const { queryClient, ...renderOptions } = options || {};
	const wrapper = createWrapper(queryClient);

	return renderHook(hook, {
		wrapper,
		...renderOptions,
	});
}

/**
 * Mock GraphQL execute function
 */
export function createMockExecute() {
	const mockExecute = vi.fn();

	// Default successful response
	mockExecute.mockResolvedValue({
		data: {},
	});

	return mockExecute;
}

/**
 * Mock meta query response
 */
export function createMockMetaResponse(): MetaQuery {
	return {
		_meta: {
			tables: [
				createMockTable('users'),
				createMockTable('posts'),
				createMockTable('actions'),
				createMockTable('complex_table'),
			],
		},
	};
}

/**
 * Create a mock table for testing
 */
export function createMockTable(name: string): NonNullable<NonNullable<MetaQuery['_meta']>['tables']>[number] {
	const baseFields = [
		createMockField('id', 'UUID', false),
		createMockField('createdAt', 'Datetime', false),
		createMockField('updatedAt', 'Datetime', false),
	];

	const specificFields = getTableSpecificFields(name);

	return {
		name,
		fields: [...baseFields, ...specificFields],
		query: {
			all: `all${name.charAt(0).toUpperCase() + name.slice(1)}`,
			create: `create${name.charAt(0).toUpperCase() + name.slice(1)}`,
			one: `${name}`,
			update: `update${name.charAt(0).toUpperCase() + name.slice(1)}`,
			delete: `delete${name.charAt(0).toUpperCase() + name.slice(1)}`,
		},
		inflection: {
			allRows: `all${name.charAt(0).toUpperCase() + name.slice(1)}`,
			allRowsSimple: name,
			conditionType: `${name.charAt(0).toUpperCase() + name.slice(1)}Condition`,
			connection: `${name.charAt(0).toUpperCase() + name.slice(1)}Connection`,
			createField: `create${name.charAt(0).toUpperCase() + name.slice(1)}`,
			createInputType: `${name.charAt(0).toUpperCase() + name.slice(1)}Input`,
			createPayloadType: `Create${name.charAt(0).toUpperCase() + name.slice(1)}Payload`,
			deleteByPrimaryKey: `delete${name.charAt(0).toUpperCase() + name.slice(1)}`,
			deletePayloadType: `Delete${name.charAt(0).toUpperCase() + name.slice(1)}Payload`,
			edge: `${name.charAt(0).toUpperCase() + name.slice(1)}Edge`,
			edgeField: `${name}Edge`,
			enumType: `${name.charAt(0).toUpperCase() + name.slice(1)}`,
			filterType: `${name.charAt(0).toUpperCase() + name.slice(1)}Filter`,
			inputType: `${name.charAt(0).toUpperCase() + name.slice(1)}Input`,
			orderByType: `${name.charAt(0).toUpperCase() + name.slice(1)}OrderBy`,
			patchField: `patch${name.charAt(0).toUpperCase() + name.slice(1)}`,
			patchType: `${name.charAt(0).toUpperCase() + name.slice(1)}Patch`,
			tableFieldName: name,
			tableType: name.charAt(0).toUpperCase() + name.slice(1),
			typeName: name.charAt(0).toUpperCase() + name.slice(1),
			updateByPrimaryKey: `update${name.charAt(0).toUpperCase() + name.slice(1)}`,
			updatePayloadType: `Update${name.charAt(0).toUpperCase() + name.slice(1)}Payload`,
		},
		relations: {
			belongsTo: [],
			hasOne: [],
			hasMany: [],
			manyToMany: [],
		},
	};
}

/**
 * Get table-specific fields for mock tables
 */
function getTableSpecificFields(
	tableName: string,
): NonNullable<NonNullable<MetaQuery['_meta']>['tables']>[number]['fields'] {
	switch (tableName) {
		case 'users':
			return [
				createMockField('name', 'String', false),
				createMockField('email', 'String', false),
				createMockField('isActive', 'Boolean', false),
				createMockField('tags', 'String', true), // Array field
			];
		case 'posts':
			return [
				createMockField('title', 'String', false),
				createMockField('content', 'String', false),
				createMockField('published', 'Boolean', false),
				createMockField('authorId', 'UUID', false),
			];
		case 'actions':
			return [
				createMockField('title', 'String', false),
				createMockField('description', 'String', false),
				createMockField('location', 'GeometryPoint', false), // Complex field
				createMockField('timeRequired', 'Interval', false), // Complex field
				createMockField('metadata', 'JSON', false),
			];
		default:
			return [];
	}
}

/**
 * Create a mock field
 */
function createMockField(
	name: string,
	gqlType: string,
	isArray: boolean = false,
): NonNullable<NonNullable<NonNullable<MetaQuery['_meta']>['tables']>[number]['fields']>[number] {
	return {
		name,
		type: {
			gqlType,
			isArray,
			modifier: null,
			pgAlias: null,
			pgType: gqlType.toLowerCase(),
			subtype: null,
			typmod: null,
		},
	};
}

/**
 * Create a clean table for testing
 */
export function createCleanTable(name: string): CleanTable {
	const mockTable = createMockTable(name);

	return {
		name: mockTable.name,
		fields:
			mockTable.fields?.map((field) => ({
				name: field!.name,
				type: {
					gqlType: field!.type!.gqlType,
					isArray: field!.type!.isArray,
					modifier: field!.type!.modifier,
					pgAlias: field!.type!.pgAlias,
					pgType: field!.type!.pgType,
					subtype: field!.type!.subtype,
					typmod: field!.type!.typmod,
				},
			})) || [],
		relations: {
			belongsTo: [],
			hasOne: [],
			hasMany: [],
			manyToMany: [],
		},
	};
}

/**
 * Mock successful GraphQL responses
 */
export const mockResponses = {
	users: {
		users: {
			totalCount: 2,
			nodes: [
				{ id: '1', name: 'John Doe', email: 'john@example.com', isActive: true },
				{ id: '2', name: 'Jane Smith', email: 'jane@example.com', isActive: false },
			],
		},
	},
	posts: {
		posts: {
			totalCount: 1,
			nodes: [{ id: '1', title: 'Test Post', content: 'Test content', published: true, authorId: '1' }],
		},
	},
	actions: {
		actions: {
			totalCount: 1,
			nodes: [
				{
					id: '1',
					title: 'Test Action',
					description: 'Test description',
					location: { x: 10.5, y: 20.3 },
					timeRequired: { days: 1, hours: 2, minutes: 30, months: 0, seconds: 0, years: 0 },
					metadata: { key: 'value' },
				},
			],
		},
	},
};

/**
 * Mock error responses
 */
export const mockErrors = {
	networkError: new Error('Network error'),
	graphqlError: {
		errors: [
			{
				message: 'Field "invalidField" doesn\'t exist on type "User"',
				locations: [{ line: 2, column: 3 }],
				path: ['users'],
			},
		],
	},
	validationError: {
		errors: [
			{
				message: 'Variable "$input" of required type "CreateUserInput!" was not provided.',
				locations: [{ line: 1, column: 1 }],
			},
		],
	},
};

/**
 * Wait for async operations to complete
 */
export function waitForAsync(ms: number = 0): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create mock mutation responses
 */
export const mockMutationResponses = {
	createUser: {
		createUser: {
			user: {
				id: '3',
				name: 'New User',
				email: 'new@example.com',
				isActive: true,
			},
		},
	},
	updateUser: {
		updateUser: {
			user: {
				id: '1',
				name: 'Updated User',
				email: 'updated@example.com',
				isActive: true,
			},
		},
	},
	deleteUser: {
		deleteUser: {
			user: {
				id: '1',
			},
		},
	},
};

/**
 * Setup global mocks for testing
 */
export function setupGlobalMocks() {
	// Mock the execute function
	vi.mock('@/graphql/execute', () => ({
		execute: createMockExecute(),
	}));

	// Mock the meta query
	vi.mock('@/queries/use-meta', () => ({
		useMeta: () => ({
			data: createMockMetaResponse(),
			isLoading: false,
			error: null,
		}),
	}));
}
