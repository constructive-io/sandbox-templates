import React from 'react';

import { GridCellKind, type GridCell } from '@glideapps/glide-data-grid';
import { describe, expect, it } from 'vitest';

import type { CellType } from '@/lib/types/cell-types';

import { createCellContent } from '../cell-content-factory';
import { createEditor } from '../editor-registry';
import type { CellCreationMetadata } from '../grid-cell-types';

function makeMetadata(cellType: string): CellCreationMetadata {
	return {
		cellType,
		fieldName: 'field',
		fieldMeta: undefined,
		canEdit: true,
		isReadonly: false,
		activationBehavior: 'double-click',
	};
}

const createGeometryCell = (value: unknown): GridCell =>
	({
		kind: GridCellKind.Custom,
		allowOverlay: true,
		copyData: '',
		data: { kind: 'geometry-cell', value },
	} as any);

const EXPECTED_KIND_BY_CELL_TYPE = {
	text: GridCellKind.Text,
	textarea: GridCellKind.Text,
	email: GridCellKind.Uri,
	url: GridCellKind.Uri,
	phone: GridCellKind.Text,
	citext: GridCellKind.Text,
	bpchar: GridCellKind.Text,

	number: GridCellKind.Number,
	integer: GridCellKind.Number,
	smallint: GridCellKind.Number,
	decimal: GridCellKind.Number,
	currency: GridCellKind.Number,
	percentage: GridCellKind.Number,

	date: GridCellKind.Text,
	datetime: GridCellKind.Text,
	time: GridCellKind.Text,
	timestamptz: GridCellKind.Text,
	interval: GridCellKind.Text,

	boolean: GridCellKind.Boolean,
	toggle: GridCellKind.Boolean,
	bit: GridCellKind.Boolean,

	json: GridCellKind.Text,
	jsonb: GridCellKind.Text,
	array: GridCellKind.Bubble,

	'text-array': GridCellKind.Bubble,
	'uuid-array': GridCellKind.Bubble,
	'number-array': GridCellKind.Bubble,
	'integer-array': GridCellKind.Bubble,
	'date-array': GridCellKind.Bubble,

	geometry: GridCellKind.Custom,
	'geometry-point': GridCellKind.Custom,
	'geometry-collection': GridCellKind.Custom,

	inet: GridCellKind.Text,

	image: GridCellKind.Image,
	file: GridCellKind.Text,
	video: GridCellKind.Text,
	audio: GridCellKind.Text,
	upload: GridCellKind.Image,

	uuid: GridCellKind.Text,
	color: GridCellKind.Text,
	rating: GridCellKind.Number,
	tags: GridCellKind.Bubble,
	tsvector: GridCellKind.Bubble,
	origin: GridCellKind.Text,
	relation: GridCellKind.Text,
	unknown: GridCellKind.Text,
} satisfies Record<CellType, GridCellKind>;

describe('Draft row cell routing', () => {
	it.each(Object.entries(EXPECTED_KIND_BY_CELL_TYPE) as Array<[CellType, GridCellKind]>)(
		'uses correct empty cell kind for %s',
		(cellType, expectedKind) => {
			const cell = createCellContent(null, makeMetadata(cellType), createGeometryCell);
		expect(cell.kind).toBe(expectedKind);
		},
	);

	it('uses bubble for hasMany relations even when empty', () => {
		const meta = makeMetadata('relation');
		(meta as any).fieldMeta = { __relationInfo: { kind: 'hasMany' } };
		const cell = createCellContent(null, meta, createGeometryCell);
		expect(cell.kind).toBe(GridCellKind.Bubble);
	});

	it('uses text for belongsTo relations even when empty', () => {
		const meta = makeMetadata('relation');
		(meta as any).fieldMeta = { __relationInfo: { kind: 'belongsTo' } };
		const cell = createCellContent(null, meta, createGeometryCell);
		expect(cell.kind).toBe(GridCellKind.Text);
	});
});

describe('Draft row editor routing', () => {
	it('routes jsonb to the JSON editor even for empty values', () => {
		const activeCellRef = { current: [0, 0] as any } as React.RefObject<any>;
		const result = createEditor({
			cell: {
				kind: GridCellKind.Text,
				data: '',
				displayData: '',
				allowOverlay: true,
			} as any,
			cellType: 'jsonb',
			colKey: 'payload',
			rowData: {},
			tableName: 't',
			activeCellRef,
			data: [{ payload: null }],
			columnKeys: ['payload'],
			fieldMetaMap: new Map(),
		});
		expect(result).not.toBeUndefined();
	});

	it('routes array subtypes to the array editor even for empty bubble cells', () => {
		const activeCellRef = { current: [0, 0] as any } as React.RefObject<any>;
		const result = createEditor({
			cell: {
				kind: GridCellKind.Bubble,
				data: [],
				allowOverlay: true,
			} as any,
			cellType: 'text-array',
			colKey: 'tags',
			rowData: {},
			tableName: 't',
			activeCellRef,
			data: [{ tags: [] }],
			columnKeys: ['tags'],
			fieldMetaMap: new Map(),
		});
		expect(result).not.toBeUndefined();
	});
});
