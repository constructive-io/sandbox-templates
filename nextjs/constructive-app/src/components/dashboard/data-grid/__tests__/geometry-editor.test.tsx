/**
 * Geometry Editor Logic Tests
 * Consolidated: GeoJSON validation, parsing, detection, formatting
 */
import { describe, expect, it } from 'vitest';

// ============================================================================
// Test utilities
// ============================================================================

const VALID_GEOJSON_TYPES = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection', 'Feature', 'FeatureCollection'];

function isValidGeoJSON(obj: any): boolean {
	if (!obj || typeof obj !== 'object' || !obj.type || typeof obj.type !== 'string') return false;
	if (!VALID_GEOJSON_TYPES.includes(obj.type)) return false;

	switch (obj.type) {
		case 'Point':
			return Array.isArray(obj.coordinates) && obj.coordinates.length >= 2;
		case 'LineString':
			return Array.isArray(obj.coordinates) && obj.coordinates.length >= 2 && obj.coordinates.every((c: any) => Array.isArray(c) && c.length >= 2);
		case 'Polygon':
			return Array.isArray(obj.coordinates) && obj.coordinates.length >= 1 && obj.coordinates.every((r: any) => Array.isArray(r) && r.length >= 4);
		case 'Feature':
			return obj.geometry !== undefined && obj.properties !== undefined;
		case 'FeatureCollection':
			return Array.isArray(obj.features);
		default:
			return true;
	}
}

function isValidGeometry(obj: any): boolean {
	if (!obj || typeof obj !== 'object') return false;
	if (!('geojson' in obj) || !('srid' in obj) || !('x' in obj) || !('y' in obj)) return false;
	return Number.isInteger(obj.srid) && Number.isFinite(obj.x) && Number.isFinite(obj.y);
}

function parseGeometryValue(value: any): any {
	if (!value) return null;
	try {
		let parsed = typeof value === 'string' ? JSON.parse(value) : value;
		if (parsed?.type && ['Point', 'LineString', 'Polygon'].includes(parsed.type)) {
			const x = parsed.type === 'Point' && Array.isArray(parsed.coordinates) ? parsed.coordinates[0] : 0;
			const y = parsed.type === 'Point' && Array.isArray(parsed.coordinates) ? parsed.coordinates[1] : 0;
			return { geojson: parsed, srid: 4326, x: Number(x), y: Number(y) };
		}
		return parsed;
	} catch {
		return null;
	}
}

function formatGeometry(val: any): string {
	if (val === null || val === undefined) return '';
	try {
		if (typeof val === 'string') return JSON.stringify(JSON.parse(val), null, 2);
		if (typeof val === 'object') return JSON.stringify(val, null, 2);
		return String(val);
	} catch {
		return String(val);
	}
}

// ============================================================================
// Tests
// ============================================================================

describe('Geometry Editor Logic', () => {
	describe('GeoJSON validation', () => {
		const validGeometries = [
			{ type: 'Point', coordinates: [-73.985, 40.758] },
			{ type: 'LineString', coordinates: [[-73.985, 40.758], [-73.986, 40.759], [-73.987, 40.76]] },
			{ type: 'Polygon', coordinates: [[[-73.985, 40.758], [-73.986, 40.758], [-73.986, 40.759], [-73.985, 40.759], [-73.985, 40.758]]] },
		];

		const invalidGeometries = [
			null, undefined, {},
			{ type: 'InvalidType' },
			{ type: 'Point' }, // Missing coordinates
			{ type: 'Point', coordinates: [] }, // Empty coordinates
			{ type: 'LineString', coordinates: [[1, 2]] }, // Too few points
		];

		it.each(validGeometries)('validates %s geometry', (geom) => {
			expect(isValidGeoJSON(geom)).toBe(true);
		});

		it.each(invalidGeometries)('rejects invalid: %j', (geom) => {
			expect(isValidGeoJSON(geom)).toBe(false);
		});
	});

	describe('Geometry object validation', () => {
		it('validates complete geometry object', () => {
			const geometry = {
				geojson: { type: 'Point', coordinates: [-73.985, 40.758] },
				srid: 4326,
				x: -73.985,
				y: 40.758,
			};
			expect(isValidGeometry(geometry)).toBe(true);
		});

		const incompleteGeometries = [
			{ geojson: { type: 'Point', coordinates: [0, 0] } }, // Missing srid, x, y
			{ geojson: { type: 'Point', coordinates: [0, 0] }, srid: 4326 }, // Missing x, y
			{ geojson: { type: 'Point', coordinates: [0, 0] }, srid: '4326', x: 0, y: 0 }, // Invalid srid
			{ geojson: { type: 'Point', coordinates: [0, 0] }, srid: 4326, x: 0, y: NaN }, // Invalid y
		];

		it.each(incompleteGeometries)('rejects incomplete: %j', (geom) => {
			expect(isValidGeometry(geom)).toBe(false);
		});
	});

	describe('Geometry parsing', () => {
		it('parses Point GeoJSON to geometry object', () => {
			const result = parseGeometryValue('{"type": "Point", "coordinates": [-73.985, 40.758]}');
			expect(result).toEqual({
				geojson: { type: 'Point', coordinates: [-73.985, 40.758] },
				srid: 4326,
				x: -73.985,
				y: 40.758,
			});
		});

		it('parses LineString with default x/y', () => {
			const result = parseGeometryValue('{"type": "LineString", "coordinates": [[-73.985, 40.758], [-73.986, 40.759]]}');
			expect(result.geojson.type).toBe('LineString');
			expect(result.x).toBe(0);
			expect(result.y).toBe(0);
		});

		const nullishCases = [null, undefined, '', 'not valid json'];
		it.each(nullishCases)('returns null for %j', (val) => {
			expect(parseGeometryValue(val)).toBeNull();
		});
	});

	describe('Geometry formatting', () => {
		it('formats geometry objects as pretty JSON', () => {
			const geometry = { geojson: { type: 'Point', coordinates: [-73.985, 40.758] }, srid: 4326, x: -73.985, y: 40.758 };
			const formatted = formatGeometry(geometry);
			expect(formatted).toContain('"type": "Point"');
			expect(formatted).toContain('"srid": 4326');
		});

		const edgeCases = [
			[null, ''],
			[undefined, ''],
			['invalid json', 'invalid json'],
			[123, '123'],
		] as const;

		it.each(edgeCases)('handles %j → %s', (input, expected) => {
			expect(formatGeometry(input)).toBe(expected);
		});
	});
});
