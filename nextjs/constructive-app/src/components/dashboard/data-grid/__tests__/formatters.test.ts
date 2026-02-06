import { describe, expect, it } from 'vitest';

import {
	compactJsonPreview,
	formatArrayPreview,
	formatGeometryPreview,
	formatImagePreview,
} from '../data-grid.formatters';

describe('DataGridV2 formatters', () => {
	it('compactJsonPreview truncates long values and keeps short ones', () => {
		expect(compactJsonPreview({ a: 1 }, 80)).toContain('{"a":1');
		const long = 'x'.repeat(200);
		const out = compactJsonPreview(long, 20);
		expect(out.length).toBe(20);
		expect(out.endsWith('…')).toBe(true);
	});

	it('formatArrayPreview shows first items and +N', () => {
		expect(formatArrayPreview(['a', 'b'])).toBe('a, b');
		expect(formatArrayPreview(['a', 'b', 'c', 'd'])).toMatch(/a, b, c \+1/);
	});

	it('formatImagePreview extracts filename from url or object', () => {
		expect(formatImagePreview('https://cdn/x/y/z.png')).toBe('z.png');
		expect(formatImagePreview({ url: 'https://cdn/u/v.jpg' })).toBe('v.jpg');
		expect(formatImagePreview({ filename: 'photo.jpeg' })).toBe('photo.jpeg');
	});

	it('formatGeometryPreview shows geojson type or fallback', () => {
		expect(formatGeometryPreview({ geojson: { type: 'Point' }, srid: 4326 })).toBe('Point');
		expect(formatGeometryPreview({ type: 'Polygon' })).toBe('Polygon');
		expect(formatGeometryPreview({ foo: 'bar' })).toMatch(/\{/);
	});
});
