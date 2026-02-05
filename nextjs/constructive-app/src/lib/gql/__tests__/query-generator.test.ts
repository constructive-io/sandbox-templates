/**
 * Query Generator Tests
 * Consolidated: table utilities, select/findOne/count, mutations, edge cases
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CleanTable, QueryOptions } from '../data.types';
import {
	buildCount,
	buildFindOne,
	buildPostGraphileCreate,
	buildPostGraphileDelete,
	buildPostGraphileUpdate,
	buildSelect,
	createASTQueryBuilder,
	toCamelCasePlural,
} from '../query-generator';
import { complexTable, queryOptionsFixtures, simpleTable } from './fixtures';
import { createCleanTable } from './test-utils';

vi.mock('@/lib/query-builder', () => ({
	QueryBuilder: vi.fn().mockImplementation(() => ({
		query: vi.fn().mockReturnThis(),
		getMany: vi.fn().mockReturnThis(),
		getOne: vi.fn().mockReturnThis(),
		create: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		print: vi.fn().mockReturnValue({ _hash: 'mock-hash', _queryName: 'mockQuery' }),
	})),
}));

describe('query-generator', () => {
	let testTable: CleanTable;
	let allTables: CleanTable[];

	beforeEach(() => {
		testTable = complexTable;
		allTables = [complexTable, simpleTable];
		vi.clearAllMocks();
	});

	describe('toCamelCasePlural', () => {
		const cases = [
			['user', 'users'],
			['post', 'posts'],
			['category', 'categories'],
			['user_profile', 'userProfiles'],
			['blog_post', 'blogPosts'],
			['users', 'users'],
			['data', 'data'],
			['', 's'],
		] as const;

		it.each(cases)('converts %s → %s', (input, expected) => {
			expect(toCamelCasePlural(input)).toBe(expected);
		});
	});

	describe('buildSelect', () => {
		const selectCases = [
			['basic', { fieldSelection: 'display' }],
			['with pagination', queryOptionsFixtures.withPagination],
			['with sorting', queryOptionsFixtures.withSorting],
			['with filtering', queryOptionsFixtures.withFiltering],
			['complex', queryOptionsFixtures.complex],
			['empty', {}],
			['undefined', undefined],
		] as const;

		it.each(selectCases)('builds %s query', (_, options) => {
			const result = buildSelect(testTable, allTables, options as any);
			expect(result).toBeDefined();
			expect(typeof result.toString()).toBe('string');
		});
	});

	describe('buildFindOne', () => {
		it('builds with default and custom primary key', () => {
			expect(buildFindOne(testTable)).toBeDefined();
			expect(buildFindOne(testTable, 'customId')).toBeDefined();
		});

		it('handles table without id field', () => {
			const tableWithoutId = createCleanTable('no_id');
			tableWithoutId.fields = [{ name: 'name', type: { gqlType: 'String', isArray: false, modifier: null, pgAlias: null, pgType: 'text', subtype: null, typmod: null } }];
			expect(buildFindOne(tableWithoutId)).toBeDefined();
		});
	});

	describe('buildCount', () => {
		it('builds count query', () => {
			expect(buildCount(testTable)).toBeDefined();
			expect(typeof buildCount(testTable).toString()).toBe('string');
		});
	});

	describe('PostGraphile mutations', () => {
		const mutationCases = [
			['create default', () => buildPostGraphileCreate(testTable, allTables)],
			['create all fields', () => buildPostGraphileCreate(testTable, allTables, { fieldSelection: 'all' })],
			['create specific', () => buildPostGraphileCreate(testTable, allTables, { fieldSelection: { select: ['id', 'name'] } })],
			['update default', () => buildPostGraphileUpdate(testTable, allTables)],
			['update display', () => buildPostGraphileUpdate(testTable, allTables, { fieldSelection: 'display' })],
			['delete default', () => buildPostGraphileDelete(testTable, allTables)],
			['delete simple', () => buildPostGraphileDelete(simpleTable, allTables)],
		] as const;

		it.each(mutationCases)('builds %s mutation', (_, buildFn) => {
			const result = buildFn();
			expect(result).toBeDefined();
			expect(typeof result.toString()).toBe('string');
		});
	});

	describe('createASTQueryBuilder', () => {
		it('creates builder with tables', () => {
			expect(createASTQueryBuilder(allTables)).toBeDefined();
			expect(createASTQueryBuilder([testTable])).toBeDefined();
		});
	});

	describe('edge cases', () => {
		it('handles empty fields', () => {
			const emptyTable = createCleanTable('empty');
			emptyTable.fields = [];
			expect(buildSelect(emptyTable, [emptyTable])).toBeDefined();
		});

		it('handles invalid field selection', () => {
			const options: QueryOptions = { fieldSelection: { select: ['nonExistent'] } };
			expect(buildSelect(testTable, allTables, options)).toBeDefined();
		});

		it('handles complex nested filters', () => {
			const options: QueryOptions = {
				where: {
					and: [
						{ or: [{ name: { includes: 'test' } }, { email: { endsWith: '.com' } }] },
						{ and: [{ isActive: { equalTo: true } }, { age: { greaterThan: 18 } }] },
					],
				},
			};
			expect(buildSelect(testTable, allTables, options)).toBeDefined();
		});

		it('handles null/undefined options', () => {
			const options: QueryOptions = { fieldSelection: undefined, where: undefined, orderBy: undefined };
			expect(buildSelect(testTable, allTables, options)).toBeDefined();
		});
	});
});
