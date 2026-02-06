import { GridCellKind, type GridCell } from '@glideapps/glide-data-grid';
import { describe, expect, it, vi } from 'vitest';

import { handleCellEdit } from '../data-grid.utils';

// Minimal FieldMetadata matching the resolver's interface
type FieldMeta = {
	name: string;
	type?: {
		gqlType: string;
		pgType?: string | null;
		pgAlias?: string | null;
		isArray?: boolean;
		subtype?: string | null;
	};
};

describe('handleCellEdit value parsing', () => {
	const row = { id: '1' } as const;
	const data = [row];
	const columnKeys = ['location', 'jsonField'];

	it('parses geometry JSON string to object for GraphQL patch', async () => {
		const fieldMetaMap = new Map<string, FieldMeta>();
		fieldMetaMap.set('location', {
			name: 'location',
			type: { gqlType: 'GeoJSON', isArray: false },
		});

		const updateFn = vi.fn(async () => ({}));

		const newValue: GridCell = {
			kind: GridCellKind.Text,
			data: JSON.stringify({ type: 'Point', coordinates: [139.7638947, 35.6768601] }),
			displayData: JSON.stringify({ type: 'Point', coordinates: [139.7638947, 35.6768601] }),
			allowOverlay: true,
		};

		await handleCellEdit([0, 0], newValue, data as any[], columnKeys, fieldMetaMap as any, updateFn);

		expect(updateFn).toHaveBeenCalledTimes(1);
		const args = updateFn.mock.calls[0] as any[];
		expect(args).toBeDefined();
		expect(args.length).toBeGreaterThan(1);
		const patch = args[1];
		expect(patch.location).toEqual({ type: 'Point', coordinates: [139.7638947, 35.6768601] });
	});

	it('parses JSON string to object for JSON field', async () => {
		const fieldMetaMap = new Map<string, FieldMeta>();
		fieldMetaMap.set('jsonField', {
			name: 'jsonField',
			type: { gqlType: 'JSON', isArray: false },
		});

		const updateFn = vi.fn(async () => ({}));

		const newValue: GridCell = {
			kind: GridCellKind.Text,
			data: JSON.stringify({ a: 1, b: 'two' }),
			displayData: JSON.stringify({ a: 1, b: 'two' }),
			allowOverlay: true,
		};

		await handleCellEdit([0, 0], newValue, [row], ['jsonField'], fieldMetaMap as any, updateFn);

		expect(updateFn).toHaveBeenCalledTimes(1);
		const args = updateFn.mock.calls[0] as any[];
		expect(args).toBeDefined();
		expect(args.length).toBeGreaterThan(1);
		const patch = args[1];
		expect(patch.jsonField).toEqual({ a: 1, b: 'two' });
	});

	it('parses JSON array string for array fields', async () => {
		const fieldMetaMap = new Map<string, FieldMeta>();
		// Simulate a GraphQL array type mapping to text-array
		fieldMetaMap.set('tags', {
			name: 'tags',
			type: { gqlType: '[String]', isArray: true },
		});

		const updateFn = vi.fn(async () => ({}));

		const newValue: GridCell = {
			kind: GridCellKind.Text,
			data: JSON.stringify(['a', 'b', 'c']),
			displayData: JSON.stringify(['a', 'b', 'c']),
			allowOverlay: true,
		};

		await handleCellEdit([0, 0], newValue, [row], ['tags'], fieldMetaMap as any, updateFn);

		expect(updateFn).toHaveBeenCalledTimes(1);
		const args = updateFn.mock.calls[0] as any[];
		expect(args).toBeDefined();
		expect(args.length).toBeGreaterThan(1);
		const patch = args[1];
		expect(patch.tags).toEqual(['a', 'b', 'c']);
	});

	it('parses interval JSON string for interval field', async () => {
		const fieldMetaMap = new Map<string, FieldMeta>();
		fieldMetaMap.set('timeRequired', {
			name: 'timeRequired',
			type: { gqlType: 'Interval', isArray: false },
		});

		const updateFn = vi.fn(async () => ({}));

		const intervalObj = { days: 1, hours: 2, minutes: 30, seconds: 0 };
		const newValue: GridCell = {
			kind: GridCellKind.Text,
			data: JSON.stringify(intervalObj),
			displayData: JSON.stringify(intervalObj),
			allowOverlay: true,
		};

		await handleCellEdit([0, 0], newValue, [row], ['timeRequired'], fieldMetaMap as any, updateFn);

		expect(updateFn).toHaveBeenCalledTimes(1);
		const args = updateFn.mock.calls[0] as any[];
		expect(args).toBeDefined();
		expect(args.length).toBeGreaterThan(1);
		const patch = args[1];
		expect(patch.timeRequired).toEqual(intervalObj);
	});

	it('sends null for empty string in geometry/json fields', async () => {
		const fieldMetaMap = new Map<string, FieldMeta>();
		fieldMetaMap.set('location', { name: 'location', type: { gqlType: 'GeoJSON', isArray: false } });

		const updateFn = vi.fn(async () => ({}));

		const newValue: GridCell = {
			kind: GridCellKind.Text,
			data: '',
			displayData: '',
			allowOverlay: true,
		};

		await handleCellEdit([0, 0], newValue, data as any[], ['location'], fieldMetaMap as any, updateFn);

		expect(updateFn).toHaveBeenCalledTimes(1);
		const args = updateFn.mock.calls[0] as any[];
		expect(args).toBeDefined();
		expect(args.length).toBeGreaterThan(1);
		const patch = args[1];
		expect(patch.location).toBeNull();
	});
});
