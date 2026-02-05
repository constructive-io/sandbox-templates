/**
 * Integration test for selective relation columns loading feature
 */
import { describe, expect, it } from 'vitest';

import type { CleanTable } from '../data.types';
import { convertToSelectionOptions } from '../field-selector';

// Mock table with relations for testing
const createEmptyRelations = (): CleanTable['relations'] => ({
	belongsTo: [],
	hasOne: [],
	hasMany: [],
	manyToMany: [],
});

const mockTable: CleanTable = {
	name: 'posts',
	fields: [
		{
			name: 'id',
			type: {
				gqlType: 'UUID',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'uuid',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'title',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'content',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
	],
	relations: {
		belongsTo: [
			{
				fieldName: 'author',
				referencesTable: 'users',
				keys: [],
				isUnique: false,
				type: 'belongsTo',
			},
			{
				fieldName: 'category',
				referencesTable: 'categories',
				keys: [],
				isUnique: false,
				type: 'belongsTo',
			},
		],
		hasOne: [],
		hasMany: [
			{
				fieldName: 'comments',
				referencedByTable: 'comments',
				keys: [],
				isUnique: false,
				type: 'hasMany',
			},
		],
		manyToMany: [
			{
				fieldName: 'tags',
				rightTable: 'tags',
				junctionTable: 'post_tags',
				leftKeyAttributes: [],
				rightKeyAttributes: [],
				junctionLeftKeyAttributes: [],
				junctionRightKeyAttributes: [],
				junctionLeftConstraint: null,
				junctionRightConstraint: null,
				type: 'manyToMany',
			},
		],
	},
};

const mockUsersTable: CleanTable = {
	name: 'users',
	fields: [
		{
			name: 'id',
			type: {
				gqlType: 'UUID',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'uuid',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'name',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'title',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
	],
	relations: createEmptyRelations(),
};

const mockCategoriesTable: CleanTable = {
	name: 'categories',
	fields: [
		{
			name: 'id',
			type: {
				gqlType: 'UUID',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'uuid',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'name',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'title',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'slug',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
	],
	relations: createEmptyRelations(),
};

const mockCommentsTable: CleanTable = {
	name: 'comments',
	fields: [
		{
			name: 'id',
			type: {
				gqlType: 'UUID',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'uuid',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'body',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
	],
	relations: createEmptyRelations(),
};

const mockTagsTable: CleanTable = {
	name: 'tags',
	fields: [
		{
			name: 'id',
			type: {
				gqlType: 'UUID',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'uuid',
				subtype: null,
				typmod: null,
			},
		},
		{
			name: 'name',
			type: {
				gqlType: 'String',
				isArray: false,
				modifier: null,
				pgAlias: null,
				pgType: 'text',
				subtype: null,
				typmod: null,
			},
		},
	],
	relations: createEmptyRelations(),
};

const mockAllTables: CleanTable[] = [mockTable, mockUsersTable, mockCategoriesTable, mockCommentsTable, mockTagsTable];

describe('Relation Columns Integration', () => {
	describe('Field Selection with includeRelations', () => {
		it('should convert includeRelations to proper SelectionOptions', () => {
			const fieldSelection = {
				select: ['id', 'title'],
				includeRelations: ['author', 'category'],
			};

			const result = convertToSelectionOptions(mockTable, mockAllTables, fieldSelection);

			expect(result).toBeDefined();
			expect(result).toHaveProperty('id', true);
			expect(result).toHaveProperty('title', true);
			expect(result).toHaveProperty('author');
			expect(result).toHaveProperty('category');

			// Check that relations have proper nested structure
			expect(result?.author).toEqual({
				select: { id: true, name: true, title: true },
				variables: {},
			});
			expect(result?.category).toEqual({
				select: { id: true, name: true, title: true, slug: true },
				variables: {},
			});
		});

		it('should work with only includeRelations (no select)', () => {
			const fieldSelection = {
				includeRelations: ['author'],
			};

			const result = convertToSelectionOptions(mockTable, mockAllTables, fieldSelection);

			expect(result).toBeDefined();
			// Should include all non-relational fields by default
			expect(result).toHaveProperty('id', true);
			expect(result).toHaveProperty('title', true);
			expect(result).toHaveProperty('content', true);
			// Should include the specified relation
			expect(result).toHaveProperty('author');
			expect(result?.author).toEqual({
				select: { id: true, name: true, title: true },
				variables: {},
			});
		});

		it('should work with both includeRelations and include', () => {
			const fieldSelection = {
				includeRelations: ['author'],
				include: {
					category: ['id', 'name', 'slug'],
				},
			};

			const result = convertToSelectionOptions(mockTable, mockAllTables, fieldSelection);

			expect(result).toBeDefined();
			// Should include the includeRelations field
			expect(result).toHaveProperty('author');
			expect(result?.author).toEqual({
				select: { id: true, name: true, title: true },
				variables: {},
			});

			// Should include the detailed include field
			expect(result).toHaveProperty('category');
			expect(result?.category).toEqual({
				select: { id: true, name: true, slug: true },
				variables: {},
			});
		});

		it('should handle empty includeRelations array', () => {
			const fieldSelection = {
				select: ['id', 'title'],
				includeRelations: [],
			};

			const result = convertToSelectionOptions(mockTable, mockAllTables, fieldSelection);

			expect(result).toBeDefined();
			expect(result).toHaveProperty('id', true);
			expect(result).toHaveProperty('title', true);
			// Should not have any relation fields
			expect(result).not.toHaveProperty('author');
			expect(result).not.toHaveProperty('category');
		});
	});

	describe('Preset behavior with relations', () => {
		it('should not include relations with "all" preset by default', () => {
			const result = convertToSelectionOptions(mockTable, mockAllTables, 'all');

			expect(result).toBeDefined();
			// Should include all non-relational fields
			expect(result).toHaveProperty('id', true);
			expect(result).toHaveProperty('title', true);
			expect(result).toHaveProperty('content', true);
			// Should NOT include relation fields
			expect(result).not.toHaveProperty('author');
			expect(result).not.toHaveProperty('category');
			expect(result).not.toHaveProperty('comments');
			expect(result).not.toHaveProperty('tags');
		});

		it('should include relations with "full" preset', () => {
			const result = convertToSelectionOptions(mockTable, mockAllTables, 'full');

			expect(result).toBeDefined();
			// Should include all fields including relations
			expect(result).toHaveProperty('id', true);
			expect(result).toHaveProperty('title', true);
			expect(result).toHaveProperty('content', true);
			expect(result).not.toHaveProperty('author');
			expect(result).not.toHaveProperty('category');
			expect(result).not.toHaveProperty('comments');
			expect(result).not.toHaveProperty('tags');
		});
	});
});
