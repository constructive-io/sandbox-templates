/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from 'vitest';

import type { RelationInfo } from '@/store/data-grid-slice';

import type { RelationSaveData } from '../editors/relation-editor';
import type { ImageSaveData } from '../editors/image-editor';

/**
 * Tests for overlay editor optimistic update logic.
 *
 * These tests verify that when an editor with internal mutations saves,
 * the optimistic update correctly patches the grid cache:
 *
 * Relation Editor:
 * - belongsTo: both FK field and relation display field
 * - hasOne: only the relation display field
 * - hasMany: only the relation display field (array)
 * - manyToMany: only the relation display field (array)
 *
 * Image Editor:
 * - patches the column with the uploaded image metadata
 */

type RelationKind = 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany';

interface MockRelationInfo {
	kind: RelationKind;
	relationField?: string;
	foreignKeyField?: string;
}

/**
 * Simulates the patch creation logic from data-grid.tsx handleRelationSaveComplete
 */
function createOptimisticPatch(
	colKey: string,
	relationInfo: MockRelationInfo | undefined,
	data: RelationSaveData,
): Record<string, unknown> {
	const patch: Record<string, unknown> = {};

	// For belongsTo: update both FK field and relation display field
	if (relationInfo?.kind === 'belongsTo' && relationInfo.foreignKeyField) {
		patch[relationInfo.foreignKeyField] = data.foreignKeyValue;
	}

	// Update the relation display field
	const displayField = relationInfo?.relationField || colKey;
	patch[displayField] = data.relationData;

	return patch;
}

/**
 * Simulates the cell update logic from data-grid.tsx handleRelationSaveComplete
 */
function getCellsToUpdate(
	colKey: string,
	rowIndex: number,
	relationInfo: MockRelationInfo | undefined,
	gridColumnKeys: string[],
): Array<{ cell: [number, number] }> {
	const colIndex = gridColumnKeys.indexOf(colKey);
	if (colIndex < 0) return [];

	const cellsToUpdate: Array<{ cell: [number, number] }> = [{ cell: [colIndex, rowIndex] }];

	// For belongsTo, also update FK column if visible
	if (relationInfo?.kind === 'belongsTo' && relationInfo.foreignKeyField) {
		const fkColIndex = gridColumnKeys.indexOf(relationInfo.foreignKeyField);
		if (fkColIndex >= 0 && fkColIndex !== colIndex) {
			cellsToUpdate.push({ cell: [fkColIndex, rowIndex] });
		}
	}

	return cellsToUpdate;
}

describe('Relation save optimistic update patch creation', () => {
	describe('belongsTo relations', () => {
		it('patches both FK field and relation display field', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'belongsTo',
				relationField: 'author',
				foreignKeyField: 'authorId',
			};

			const saveData: RelationSaveData = {
				relationData: { id: 'user-123', name: 'John Doe' },
				foreignKeyValue: 'user-123',
			};

			const patch = createOptimisticPatch('author', relationInfo, saveData);

			expect(patch).toEqual({
				authorId: 'user-123',
				author: { id: 'user-123', name: 'John Doe' },
			});
		});

		it('handles null foreign key value when relation is cleared', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'belongsTo',
				relationField: 'author',
				foreignKeyField: 'authorId',
			};

			const saveData: RelationSaveData = {
				relationData: null,
				foreignKeyValue: null,
			};

			const patch = createOptimisticPatch('author', relationInfo, saveData);

			expect(patch).toEqual({
				authorId: null,
				author: null,
			});
		});
	});

	describe('hasOne relations', () => {
		it('patches only the relation display field', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'hasOne',
				relationField: 'profile',
				foreignKeyField: 'userId', // FK is on related table, not parent
			};

			const saveData: RelationSaveData = {
				relationData: { id: 'profile-456', bio: 'Software Engineer' },
				foreignKeyValue: null, // Always null for hasOne
			};

			const patch = createOptimisticPatch('profile', relationInfo, saveData);

			expect(patch).toEqual({
				profile: { id: 'profile-456', bio: 'Software Engineer' },
			});
			expect(patch).not.toHaveProperty('userId');
		});
	});

	describe('hasMany relations', () => {
		it('patches with array of related records', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'hasMany',
				relationField: 'comments',
				foreignKeyField: 'postId', // FK is on related table
			};

			const saveData: RelationSaveData = {
				relationData: [
					{ id: 'comment-1', text: 'Great post!' },
					{ id: 'comment-2', text: 'Thanks for sharing' },
				],
				foreignKeyValue: null,
			};

			const patch = createOptimisticPatch('comments', relationInfo, saveData);

			expect(patch).toEqual({
				comments: [
					{ id: 'comment-1', text: 'Great post!' },
					{ id: 'comment-2', text: 'Thanks for sharing' },
				],
			});
		});

		it('handles empty array when all relations removed', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'hasMany',
				relationField: 'comments',
			};

			const saveData: RelationSaveData = {
				relationData: [],
				foreignKeyValue: null,
			};

			const patch = createOptimisticPatch('comments', relationInfo, saveData);

			expect(patch).toEqual({ comments: [] });
		});
	});

	describe('manyToMany relations', () => {
		it('patches with array of related records', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'manyToMany',
				relationField: 'tags',
			};

			const saveData: RelationSaveData = {
				relationData: [
					{ id: 'tag-1', name: 'React' },
					{ id: 'tag-2', name: 'TypeScript' },
				],
				foreignKeyValue: null, // manyToMany uses junction table
			};

			const patch = createOptimisticPatch('tags', relationInfo, saveData);

			expect(patch).toEqual({
				tags: [
					{ id: 'tag-1', name: 'React' },
					{ id: 'tag-2', name: 'TypeScript' },
				],
			});
		});
	});

	describe('fallback behavior', () => {
		it('falls back to colKey when relationField is not set', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'belongsTo',
				foreignKeyField: 'categoryId',
				// relationField is undefined
			};

			const saveData: RelationSaveData = {
				relationData: { id: 'cat-1', name: 'Technology' },
				foreignKeyValue: 'cat-1',
			};

			const patch = createOptimisticPatch('category', relationInfo, saveData);

			expect(patch).toEqual({
				categoryId: 'cat-1',
				category: { id: 'cat-1', name: 'Technology' },
			});
		});

		it('uses colKey when no relationInfo available', () => {
			const saveData: RelationSaveData = {
				relationData: { id: 'rel-1', value: 'test' },
				foreignKeyValue: 'rel-1',
			};

			const patch = createOptimisticPatch('someRelation', undefined, saveData);

			expect(patch).toEqual({
				someRelation: { id: 'rel-1', value: 'test' },
			});
		});
	});
});

describe('Relation save cell update targeting', () => {
	const gridColumnKeys = ['id', 'name', 'authorId', 'author', 'comments', 'tags'];

	describe('belongsTo relations', () => {
		it('returns both relation cell and FK cell when FK column is visible', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'belongsTo',
				relationField: 'author',
				foreignKeyField: 'authorId',
			};

			const cells = getCellsToUpdate('author', 5, relationInfo, gridColumnKeys);

			expect(cells).toHaveLength(2);
			expect(cells).toContainEqual({ cell: [3, 5] }); // author column
			expect(cells).toContainEqual({ cell: [2, 5] }); // authorId column
		});

		it('returns only relation cell when FK column is not visible', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'belongsTo',
				relationField: 'author',
				foreignKeyField: 'hiddenFkId', // Not in gridColumnKeys
			};

			const cells = getCellsToUpdate('author', 5, relationInfo, gridColumnKeys);

			expect(cells).toHaveLength(1);
			expect(cells).toContainEqual({ cell: [3, 5] });
		});
	});

	describe('hasOne/hasMany/manyToMany relations', () => {
		it('returns only the relation cell for hasOne', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'hasOne',
				relationField: 'profile',
			};

			const cells = getCellsToUpdate('name', 3, relationInfo, gridColumnKeys);

			expect(cells).toHaveLength(1);
			expect(cells).toContainEqual({ cell: [1, 3] }); // name column at index 1
		});

		it('returns only the relation cell for hasMany', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'hasMany',
				relationField: 'comments',
			};

			const cells = getCellsToUpdate('comments', 7, relationInfo, gridColumnKeys);

			expect(cells).toHaveLength(1);
			expect(cells).toContainEqual({ cell: [4, 7] }); // comments column
		});

		it('returns only the relation cell for manyToMany', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'manyToMany',
				relationField: 'tags',
			};

			const cells = getCellsToUpdate('tags', 2, relationInfo, gridColumnKeys);

			expect(cells).toHaveLength(1);
			expect(cells).toContainEqual({ cell: [5, 2] }); // tags column
		});
	});

	describe('edge cases', () => {
		it('returns empty array when column not found', () => {
			const cells = getCellsToUpdate('nonexistent', 0, undefined, gridColumnKeys);
			expect(cells).toEqual([]);
		});

		it('does not duplicate cell when FK column equals relation column', () => {
			const relationInfo: MockRelationInfo = {
				kind: 'belongsTo',
				relationField: 'author',
				foreignKeyField: 'author', // Same as relation field
			};

			const cells = getCellsToUpdate('author', 5, relationInfo, gridColumnKeys);

			expect(cells).toHaveLength(1);
			expect(cells).toContainEqual({ cell: [3, 5] });
		});
	});
});

/**
 * Simulates ImageEditor patch creation
 */
function createImagePatch(colKey: string, saveData: ImageSaveData): Record<string, unknown> {
	return { [colKey]: saveData.imageData };
}

describe('Image editor optimistic update patch creation', () => {
	it('patches the column with image metadata', () => {
		const saveData: ImageSaveData = {
			imageData: {
				url: 'https://example.com/image.jpg',
				filename: 'image.jpg',
				size: 1024,
				mime: 'image/jpeg',
				width: 800,
				height: 600,
			},
		};

		const patch = createImagePatch('profileImage', saveData);

		expect(patch).toEqual({
			profileImage: {
				url: 'https://example.com/image.jpg',
				filename: 'image.jpg',
				size: 1024,
				mime: 'image/jpeg',
				width: 800,
				height: 600,
			},
		});
	});

	it('handles null when image is removed', () => {
		const saveData: ImageSaveData = {
			imageData: null,
		};

		const patch = createImagePatch('avatar', saveData);

		expect(patch).toEqual({ avatar: null });
	});

	it('handles partial image metadata', () => {
		const saveData: ImageSaveData = {
			imageData: {
				url: 'https://example.com/photo.png',
			},
		};

		const patch = createImagePatch('photo', saveData);

		expect(patch).toEqual({
			photo: {
				url: 'https://example.com/photo.png',
			},
		});
	});
});

/**
 * Simulates the unified handleEditorSaveComplete from data-grid.tsx
 */
function getUnifiedCellsToUpdate(
	colKey: string,
	rowIndex: number,
	patch: Record<string, unknown>,
	gridColumnKeys: string[],
): Array<{ cell: [number, number] }> {
	const cellsToUpdate: Array<{ cell: [number, number] }> = [];

	// Add all patched columns that are visible in the grid
	for (const patchedKey of Object.keys(patch)) {
		const colIndex = gridColumnKeys.indexOf(patchedKey);
		if (colIndex >= 0) {
			cellsToUpdate.push({ cell: [colIndex, rowIndex] });
		}
	}

	// Always include the primary column being edited
	const primaryColIndex = gridColumnKeys.indexOf(colKey);
	if (primaryColIndex >= 0 && !cellsToUpdate.some((c) => c.cell[0] === primaryColIndex)) {
		cellsToUpdate.push({ cell: [primaryColIndex, rowIndex] });
	}

	return cellsToUpdate;
}

describe('Unified editor save cell update targeting', () => {
	const gridColumnKeys = ['id', 'name', 'authorId', 'author', 'avatar', 'profileImage'];

	it('updates all patched columns when visible', () => {
		const patch = { authorId: 'user-1', author: { id: 'user-1', name: 'John' } };

		const cells = getUnifiedCellsToUpdate('author', 3, patch, gridColumnKeys);

		expect(cells).toHaveLength(2);
		expect(cells).toContainEqual({ cell: [2, 3] }); // authorId
		expect(cells).toContainEqual({ cell: [3, 3] }); // author
	});

	it('updates only single column for image upload', () => {
		const patch = { avatar: { url: 'https://example.com/img.jpg' } };

		const cells = getUnifiedCellsToUpdate('avatar', 5, patch, gridColumnKeys);

		expect(cells).toHaveLength(1);
		expect(cells).toContainEqual({ cell: [4, 5] }); // avatar
	});

	it('includes primary column even if not in patch keys', () => {
		// Edge case: primary column might not be in patch if it's a computed/virtual field
		const patch = { authorId: 'user-1' };

		const cells = getUnifiedCellsToUpdate('author', 2, patch, gridColumnKeys);

		expect(cells).toHaveLength(2);
		expect(cells).toContainEqual({ cell: [2, 2] }); // authorId (from patch)
		expect(cells).toContainEqual({ cell: [3, 2] }); // author (primary)
	});

	it('skips patched columns not visible in grid', () => {
		const patch = { hiddenField: 'value', name: 'visible' };

		const cells = getUnifiedCellsToUpdate('name', 1, patch, gridColumnKeys);

		expect(cells).toHaveLength(1);
		expect(cells).toContainEqual({ cell: [1, 1] }); // name only
	});
});
