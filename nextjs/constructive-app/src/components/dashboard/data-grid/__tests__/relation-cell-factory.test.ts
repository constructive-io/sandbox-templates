import { GridCellKind } from '@glideapps/glide-data-grid';
import { describe, expect, it } from 'vitest';

import { createCellContent } from '../cell-content-factory';
import type { CellCreationMetadata } from '../grid-cell-types';

function buildMetadata(overrides: Partial<CellCreationMetadata & { fieldMeta?: any }> = {}): CellCreationMetadata {
	return {
		cellType: 'relation',
		fieldName: 'testRelationId',
		fieldMeta: {
			__relationInfo: {
				kind: 'belongsTo',
				relationField: 'testRelation',
				displayCandidates: ['name', 'title'],
				foreignKeyField: 'testRelationId',
			},
			__relationOptions: {
				relationLabelMaxLength: 24,
			},
		},
		canEdit: true,
		isReadonly: false,
		activationBehavior: 'double-click',
		...overrides,
	} as CellCreationMetadata;
}

describe('RelationCellFactory heuristics', () => {
	it('uses displayCandidates when present', () => {
		const metadata = buildMetadata();
		const cell = createCellContent({ name: 'Acme Corp', id: 'uuid-1234' }, metadata);
		expect(cell.kind).toBe(GridCellKind.Text);
		expect((cell as any).data).toBe('Acme Corp');
	});

	it('falls back to UUID-like values when no candidates match', () => {
		const metadata = buildMetadata({
			fieldMeta: {
				__relationInfo: {
					kind: 'belongsTo',
					relationField: 'testRelation',
					displayCandidates: [],
					foreignKeyField: 'testRelationId',
				},
				__relationOptions: {},
			},
		});
		const uuid = '550e8400-e29b-41d4-a716-446655440000';
		const cell = createCellContent({ someField: 'n/a', value: uuid }, metadata);
		expect(cell.kind).toBe(GridCellKind.Text);
		expect((cell as any).data).toBe('550e8400-e29b-41d4-a716…');
	});

	it('omits null-like strings and uses first primitive as fallback', () => {
		const metadata = buildMetadata({
			fieldMeta: {
				__relationInfo: {
					kind: 'belongsTo',
					relationField: 'testRelation',
					displayCandidates: [],
					foreignKeyField: 'testRelationId',
				},
				__relationOptions: {},
			},
		});
		const cell = createCellContent({ status: 'null', description: 'Primary contact' }, metadata);
		expect(cell.kind).toBe(GridCellKind.Text);
		expect((cell as any).data).toBe('Primary contact');
	});

	it('joins array relation values respecting heuristics', () => {
		const metadata = buildMetadata({
			fieldMeta: {
				__relationInfo: {
					kind: 'hasMany',
					relationField: 'testRelation',
					displayCandidates: ['name'],
					foreignKeyField: undefined,
				},
				__relationOptions: { relationChipLimit: 5 },
			},
		});
		const cell = createCellContent([{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }], metadata);
		expect(cell.kind).toBe(GridCellKind.Bubble);
		expect((cell as any).data).toEqual(['Alice', 'Bob', 'Charlie']);
	});
});
