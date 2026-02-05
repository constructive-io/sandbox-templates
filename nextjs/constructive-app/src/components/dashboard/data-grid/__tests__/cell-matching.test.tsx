/**
 * Tests for DataGridV2 cell matching logic
 * Consolidated: parameterized tests, removed debug/console.log tests
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CellRegistry } from '@/lib/cell-registry';
import { mapToFrontendCellType } from '@/lib/gql/type-mapping';

// Mock CellRegistry methods
beforeEach(() => {
	vi.spyOn(CellRegistry, 'findByMatch').mockImplementation((metadata) => {
		if (metadata.pgAlias === 'relation' || metadata.gqlType === 'Relation') {
			return { type: 'relation', component: vi.fn() as any, match: (m: any) => m.pgAlias === 'relation' };
		}
		if (metadata.pgType === 'geometry' || metadata.gqlType === 'GeoJSON') {
			const geojsonType = metadata.value?.geojson?.type;
			if (geojsonType === 'Point') {
				return { type: 'geometry-point', component: vi.fn() as any, match: () => true };
			} else if (geojsonType === 'GeometryCollection') {
				return { type: 'geometry-collection', component: vi.fn() as any, match: () => true };
			}
			return { type: 'geometry', component: vi.fn() as any, match: () => true };
		}
		return undefined;
	});

	vi.spyOn(CellRegistry, 'get').mockImplementation((type) => {
		const mockEntry = { type, component: vi.fn() as any };
		if (type === 'relation') return { ...mockEntry, match: (m: any) => m.pgAlias === 'relation' };
		if (['geometry', 'geometry-point', 'geometry-collection'].includes(type)) {
			return { ...mockEntry, match: () => true };
		}
		if (['text', 'image', 'array', 'text-array', 'number-array'].includes(type)) return mockEntry;
		return undefined;
	});

	vi.spyOn(CellRegistry, 'getComponentWithMatch').mockImplementation((type, metadata) => {
		if (metadata) {
			const matched = CellRegistry.findByMatch(metadata);
			if (matched) return matched.component;
		}
		return CellRegistry.get(type)?.component;
	});
});

// Helper to infer cell type from data string
function inferCellTypeFromData(data: string): string | undefined {
	if (!data || typeof data !== 'string') return undefined;
	try {
		const parsed = JSON.parse(data);
		// Wrapped geometry format
		if (parsed?.geojson) {
			if (parsed.geojson.type === 'Point') return 'geometry-point';
			if (parsed.geojson.type === 'GeometryCollection') return 'geometry-collection';
			return 'geometry';
		}
		// Raw GeoJSON
		if (parsed?.type && parsed?.coordinates) {
			const geoTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
			if (geoTypes.includes(parsed.type)) {
				if (parsed.type === 'Point') return 'geometry-point';
				if (parsed.type === 'GeometryCollection') return 'geometry-collection';
				return 'geometry';
			}
		}
		if (Array.isArray(parsed)) return 'array';
		if (parsed && typeof parsed === 'object' && (parsed.url || parsed.src || parsed.href || parsed.path)) return 'image';
		if (typeof parsed === 'string' && /^\d{4}-\d{2}-\d{2}/.test(parsed)) {
			return parsed.includes('T') ? 'datetime' : 'date';
		}
		return 'json';
	} catch {
		if (/^\d{4}-\d{2}-\d{2}/.test(data)) return data.includes('T') ? 'datetime' : 'date';
		if (/^\d{2}:\d{2}/.test(data)) return 'time';
		return undefined;
	}
}

describe('DataGridV2 Cell Matching Logic', () => {
	describe('Match-based lookup', () => {
		it('matches relation fields using match function', () => {
			const relationMetadata = {
				gqlType: 'Relation', isArray: false, pgAlias: 'relation', pgType: 'relation',
				subtype: null, fieldName: 'user', value: { id: 1, name: 'John' },
			};
			const matched = CellRegistry.findByMatch(relationMetadata);
			expect(matched?.type).toBe('relation');

			// pgAlias relation without gqlType Relation
			const altMetadata = { ...relationMetadata, gqlType: 'SomeType', pgType: 'varchar' };
			expect(CellRegistry.findByMatch(altMetadata)?.type).toBe('relation');

			// Non-relation should not match
			const textMetadata = {
				gqlType: 'String', isArray: false, pgAlias: 'text', pgType: 'varchar',
				subtype: null, fieldName: 'name', value: 'John Doe',
			};
			expect(CellRegistry.findByMatch(textMetadata)).toBeUndefined();
		});
	});

	describe('Type-based fallback', () => {
		const typeMappings = [
			[{ gqlType: 'String', isArray: false, pgAlias: 'text', pgType: 'varchar', subtype: null }, 'text'],
			[{ gqlType: 'Int', isArray: false, pgAlias: 'integer', pgType: 'int4', subtype: null }, 'integer'],
			[{ gqlType: '[String]', isArray: true, pgAlias: 'text-array', pgType: '_varchar', subtype: null }, 'text-array'],
			[{ gqlType: 'String', isArray: false, pgAlias: 'image', pgType: 'varchar', subtype: null }, 'image'],
			[{ gqlType: 'String', isArray: false, pgAlias: 'url', pgType: 'varchar', subtype: null }, 'url'],
			[{ gqlType: 'String', isArray: false, pgAlias: 'email', pgType: 'varchar', subtype: null }, 'email'],
		] as const;

		it.each(typeMappings)('maps %j to %s', (input, expected) => {
			expect(mapToFrontendCellType(input)).toBe(expected);
		});
	});

	describe('Geometry cell type mapping', () => {
		const geometryCases = [
			['generic geometry', { gqlType: 'GeoJSON', pgType: 'geometry', subtype: null }, 'geometry'],
			['geometry-point', { gqlType: 'GeoJSON', pgType: 'point', subtype: 'GeometryPoint' }, 'geometry-point'],
			['geometry-collection', { gqlType: 'GeometryGeometryCollection', pgType: null, subtype: null }, 'geometry-collection'],
		] as const;

		it.each(geometryCases)('maps %s correctly', (_, input, expected) => {
			expect(mapToFrontendCellType({ ...input, isArray: false, pgAlias: null })).toBe(expected);
		});

		it('handles null geometry values and GeoJSON without subtype', () => {
			const nullGeometry = {
				gqlType: 'GeoJSON', isArray: false, pgAlias: null, pgType: 'geometry',
				subtype: null, fieldName: 'location', value: null,
			};
			expect(CellRegistry.findByMatch(nullGeometry)?.type).toBe('geometry');
			expect(mapToFrontendCellType(nullGeometry)).toBe('geometry');

			const geoJsonNoSubtype = { ...nullGeometry, pgType: null, fieldName: 'shape' };
			expect(CellRegistry.findByMatch(geoJsonNoSubtype)?.type).toBe('geometry');
			expect(mapToFrontendCellType(geoJsonNoSubtype)).toBe('geometry');
		});
	});

	describe('Cell registry integration', () => {
		it('has correct match functions for cell types', () => {
			const relationEntry = CellRegistry.get('relation');
			expect(relationEntry?.match).toBeDefined();

			const textEntry = CellRegistry.get('text');
			expect(textEntry?.match).toBeUndefined();

			const geometryEntry = CellRegistry.get('geometry');
			expect(geometryEntry?.match).toBeDefined();
		});
	});

	describe('Geometry editor routing', () => {
		it('routes geometry cells to geometry editor in provideEditor logic', () => {
			const mockFieldMeta = {
				type: { gqlType: 'GeoJSON', isArray: false, pgAlias: null, pgType: 'geometry', subtype: null },
			};

			const cellType = mapToFrontendCellType(mockFieldMeta.type);
			expect(cellType).toBe('geometry');

			const shouldProvideGeometryEditor =
				cellType === 'geometry' || cellType === 'geometry-point' || cellType === 'geometry-collection';
			expect(shouldProvideGeometryEditor).toBe(true);

			// Test with Point value
			const pointMetadata = {
				...mockFieldMeta.type, fieldName: 'location',
				value: { geojson: { type: 'Point', coordinates: [0, 0] }, srid: 4326, x: 0, y: 0 },
			};
			const matched = CellRegistry.findByMatch(pointMetadata);
			expect(matched?.type).toBe('geometry-point');
		});
	});

	describe('Data-based cell type inference', () => {
		const inferenceCases = [
			['wrapped Point geometry', JSON.stringify({ geojson: { type: 'Point', coordinates: [-74, 40] }, srid: 4326 }), 'geometry-point'],
			['wrapped GeometryCollection', JSON.stringify({ geojson: { type: 'GeometryCollection', geometries: [] }, srid: 4326 }), 'geometry-collection'],
			['wrapped LineString', JSON.stringify({ geojson: { type: 'LineString', coordinates: [[-74, 40], [-75, 41]] }, srid: 4326 }), 'geometry'],
			['raw GeoJSON Point', JSON.stringify({ type: 'Point', coordinates: [-74, 40] }), 'geometry-point'],
			['array data', JSON.stringify(['item1', 'item2']), 'array'],
			['image data', JSON.stringify({ url: 'https://example.com/image.jpg' }), 'image'],
			['generic JSON', JSON.stringify({ name: 'John', age: 30 }), 'json'],
		] as const;

		it.each(inferenceCases)('detects %s', (_, data, expected) => {
			expect(inferCellTypeFromData(data)).toBe(expected);
		});

		const dateTimeCases = [
			['date', '2024-01-15', 'date'],
			['datetime', '2024-01-15T10:30:00Z', 'datetime'],
			['time', '10:30:00', 'time'],
		] as const;

		it.each(dateTimeCases)('detects %s data', (_, data, expected) => {
			expect(inferCellTypeFromData(data)).toBe(expected);
		});

		it('returns undefined for non-JSON strings and empty data', () => {
			expect(inferCellTypeFromData('just plain text')).toBeUndefined();
			expect(inferCellTypeFromData('')).toBeUndefined();
		});
	});
});
