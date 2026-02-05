/**
 * Tests for data.types.ts
 * Tests core type definitions, utilities, and type conversion functions
 */
import { beforeEach, describe, expect, it } from 'vitest';

import { cleanTable } from '../data.types';
import type { CleanTable, Filter, MetaTable } from '../data.types';
import { complexTable, filterFixtures, simpleTable } from './fixtures';
import { createMockMetaResponse, createMockTable } from './test-utils';

describe('data.types', () => {
	describe('cleanTable', () => {
		it('should convert MetaTable to CleanTable', () => {
			const metaTable = createMockTable('users')!;
			const result = cleanTable(metaTable);

			expect(result).toEqual({
				name: 'users',
				fields: expect.arrayContaining([
					expect.objectContaining({
						name: 'id',
						type: expect.objectContaining({
							gqlType: 'UUID',
							isArray: false,
						}),
					}),
					expect.objectContaining({
						name: 'name',
						type: expect.objectContaining({
							gqlType: 'String',
							isArray: false,
						}),
					}),
				]),
				relations: expect.objectContaining({
					belongsTo: [],
					hasOne: [],
					hasMany: [],
					manyToMany: [],
				}),
			});
		});

		it('should handle null fields gracefully', () => {
			const metaTable = {
				name: 'test_table',
				fields: [null, undefined],
				relations: null,
			} as MetaTable;

			const result = cleanTable(metaTable);

			expect(result.name).toBe('test_table');
			expect(result.fields).toEqual([]);
			expect(result.relations).toEqual({
				belongsTo: [],
				hasOne: [],
				hasMany: [],
				manyToMany: [],
			});
		});

		it('should preserve all field type information', () => {
			const metaTable = {
				name: 'complex_table',
				fields: [
					{
						name: 'complexField',
						type: {
							gqlType: 'GeometryPoint',
							isArray: false,
							modifier: null,
							pgAlias: 'point',
							pgType: 'geometry',
							subtype: 'Point',
							typmod: 4326,
						},
					},
				],
				relations: null,
			} as MetaTable;

			const result = cleanTable(metaTable);

			expect(result.fields[0]).toEqual({
				name: 'complexField',
				type: {
					gqlType: 'GeometryPoint',
					isArray: false,
					modifier: null,
					pgAlias: 'point',
					pgType: 'geometry',
					subtype: 'Point',
					typmod: 4326,
				},
			});
		});
	});

	describe('field conversion within cleanTable', () => {
		it('should convert fields correctly within table conversion', () => {
			const metaTable = {
				name: 'testTable',
				fields: [
					{
						name: 'testField',
						type: {
							gqlType: 'String',
							isArray: false,
							modifier: null,
							pgAlias: 'text',
							pgType: 'text',
							subtype: null,
							typmod: null,
						},
					},
				],
				relations: null,
			} as MetaTable;

			const result = cleanTable(metaTable);

			expect(result.fields[0]).toEqual({
				name: 'testField',
				type: {
					gqlType: 'String',
					isArray: false,
					modifier: null,
					pgAlias: 'text',
					pgType: 'text',
					subtype: null,
					typmod: null,
				},
			});
		});

		it('should handle array fields correctly', () => {
			const metaTable = {
				name: 'testTable',
				fields: [
					{
						name: 'arrayField',
						type: {
							gqlType: 'String',
							isArray: true,
							modifier: null,
							pgAlias: 'text',
							pgType: 'text[]',
							subtype: null,
							typmod: null,
						},
					},
				],
				relations: null,
			} as MetaTable;

			const result = cleanTable(metaTable);

			expect(result.fields[0].type.isArray).toBe(true);
			expect(result.fields[0].type.pgType).toBe('text[]');
		});

		it('should preserve complex type information', () => {
			const metaTable = {
				name: 'testTable',
				fields: [
					{
						name: 'geometryField',
						type: {
							gqlType: 'GeometryPoint',
							isArray: false,
							modifier: null,
							pgAlias: 'point',
							pgType: 'geometry',
							subtype: 'Point',
							typmod: 4326,
						},
					},
				],
				relations: null,
			} as MetaTable;

			const result = cleanTable(metaTable);

			expect(result.fields[0].type).toEqual({
				gqlType: 'GeometryPoint',
				isArray: false,
				modifier: null,
				pgAlias: 'point',
				pgType: 'geometry',
				subtype: 'Point',
				typmod: 4326,
			});
		});
	});

	describe('relations conversion within cleanTable', () => {
		it('should handle null relations gracefully', () => {
			const metaTable = {
				name: 'testTable',
				fields: [],
				relations: null,
			} as MetaTable;

			const result = cleanTable(metaTable);

			expect(result.relations).toEqual({
				belongsTo: [],
				hasOne: [],
				hasMany: [],
				manyToMany: [],
			});
		});

		it('should convert relations correctly', () => {
			const metaTable = {
				name: 'testTable',
				fields: [],
				relations: {
					belongsTo: [
						{
							fieldName: 'ownerId',
							isUnique: true,
							references: { name: 'users' },
							type: 'belongsTo',
						},
					],
					hasOne: [],
					hasMany: [],
					manyToMany: [],
				},
			} as MetaTable;

			const result = cleanTable(metaTable);

			expect(result.relations.belongsTo).toHaveLength(1);
			expect(result.relations.belongsTo[0]).toEqual({
				fieldName: 'ownerId',
				isUnique: true,
				referencesTable: 'users',
				type: 'belongsTo',
				keys: [], // keys field is always present in CleanBelongsToRelation
			});
		});
	});

	describe('Filter type validation', () => {
		it('should accept valid simple filters', () => {
			const filter: Filter = filterFixtures.simple;

			expect(filter).toEqual({
				isActive: { equalTo: true },
			});
		});

		it('should accept valid string operator filters', () => {
			const filter: Filter = filterFixtures.stringOperators;

			expect(filter).toEqual({
				name: { includes: 'test' },
				email: { endsWith: '@example.com' },
				description: { startsWith: 'Important' },
			});
		});

		it('should accept valid numeric operator filters', () => {
			const filter: Filter = filterFixtures.numericOperators;

			expect(filter).toEqual({
				age: { greaterThan: 18 },
				score: { lessThanOrEqualTo: 100 },
				rating: { in: [4, 5] },
			});
		});

		it('should accept valid logical operator filters', () => {
			const filter: Filter = filterFixtures.logicalOperators;

			expect(filter).toHaveProperty('and');
			expect(filter).toHaveProperty('or');
			expect(Array.isArray(filter.and)).toBe(true);
			expect(Array.isArray(filter.or)).toBe(true);
		});

		it('should accept valid nested filters', () => {
			const filter: Filter = filterFixtures.nested;

			expect(filter).toHaveProperty('and');
			expect(Array.isArray(filter.and)).toBe(true);
			expect(filter.and).toHaveLength(2);
		});

		it('should accept valid relational filters', () => {
			const filter: Filter = filterFixtures.relational;

			expect(filter).toHaveProperty('posts');
			expect(filter).toHaveProperty('profile');
			expect(filter.posts).toHaveProperty('some');
			expect(filter.profile).toHaveProperty('every');
		});
	});

	describe('Type safety and edge cases', () => {
		it('should handle empty table names', () => {
			const metaTable = {
				name: '',
				fields: [],
				relations: null,
			} as MetaTable;

			const result = cleanTable(metaTable);
			expect(result.name).toBe('');
		});

		it('should handle fields with missing type information', () => {
			const metaTable = {
				name: 'testTable',
				fields: [
					{
						name: 'incompleteField',
						type: {
							gqlType: 'String',
							isArray: false,
							modifier: null,
							pgAlias: 'text',
							pgType: 'text',
							subtype: null,
							typmod: null,
						},
					},
				],
				relations: null,
			} as MetaTable;

			const result = cleanTable(metaTable);
			expect(result.fields[0].type.pgType).toBe('text');
		});

		it('should preserve undefined and null values correctly', () => {
			const metaTable = {
				name: 'testTable',
				fields: [
					{
						name: 'testField',
						type: {
							gqlType: 'String',
							isArray: false,
							modifier: null,
							pgAlias: 'text',
							pgType: 'text',
							subtype: null,
							typmod: null,
						},
					},
				],
				relations: null,
			} as MetaTable;

			const result = cleanTable(metaTable);
			expect(result.fields[0].type.modifier).toBeNull();
			expect(result.fields[0].type.pgAlias).toBe('text');
			expect(result.fields[0].type.subtype).toBeNull();
			expect(result.fields[0].type.typmod).toBeNull();
		});
	});
});
