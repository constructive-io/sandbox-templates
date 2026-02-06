import { GridCellKind } from '@glideapps/glide-data-grid';
import { describe, expect, it } from 'vitest';

import { createGeometryCell } from '../custom-cells/geometry-cell';

describe('Geometry Cell Renderer', () => {
	describe('createGeometryCell', () => {
		it('should create a custom geometry cell for Point geometry', () => {
			const pointGeometry = {
				geojson: { type: 'Point', coordinates: [-74.004034996, 40.724461793] },
				srid: 4326,
				x: -74.004034996,
				y: 40.724461793,
			};

			const cell = createGeometryCell(pointGeometry);

			expect(cell.kind).toBe(GridCellKind.Custom);
			expect(cell.allowOverlay).toBe(true);
			expect(cell.data.kind).toBe('geometry-cell');
			expect(cell.data.value).toEqual(pointGeometry);
			expect(cell.data.geometryType).toBe('Point');
			expect(cell.data.hasValidGeometry).toBe(true);
			expect(cell.data.coordinates).toEqual([40.724461793, -74.004034996]); // lat, lng
			expect(cell.data.displayText).toContain('Point');
			expect(cell.data.displayText).toContain('-74.0040, 40.7245');
			expect(cell.data.displayText).toContain('SRID:4326');
		});

		it('should create a custom geometry cell for raw GeoJSON Point', () => {
			const geoJsonPoint = {
				type: 'Point',
				coordinates: [-74.004034996, 40.724461793],
			};

			const cell = createGeometryCell(geoJsonPoint);

			expect(cell.kind).toBe(GridCellKind.Custom);
			expect(cell.data.kind).toBe('geometry-cell');
			expect(cell.data.value).toEqual(geoJsonPoint);
			expect(cell.data.geometryType).toBe('Point');
			expect(cell.data.hasValidGeometry).toBe(true);
			expect(cell.data.coordinates).toEqual([40.724461793, -74.004034996]); // lat, lng
			expect(cell.data.displayText).toContain('Point');
			expect(cell.data.displayText).toContain('40.7245, -74.0040');
		});

		it('should create a custom geometry cell for Polygon geometry', () => {
			const polygonGeometry = {
				geojson: {
					type: 'Polygon',
					coordinates: [
						[
							[-74.0, 40.7],
							[-74.0, 40.8],
							[-73.9, 40.8],
							[-73.9, 40.7],
							[-74.0, 40.7],
						],
					],
				},
				srid: 4326,
				x: -73.95,
				y: 40.75,
			};

			const cell = createGeometryCell(polygonGeometry);

			expect(cell.kind).toBe(GridCellKind.Custom);
			expect(cell.data.kind).toBe('geometry-cell');
			expect(cell.data.value).toEqual(polygonGeometry);
			expect(cell.data.geometryType).toBe('Polygon');
			expect(cell.data.hasValidGeometry).toBe(true);
			expect(cell.data.displayText).toContain('Polygon');
			expect(cell.data.displayText).toContain('-73.9500, 40.7500');
			expect(cell.data.displayText).toContain('SRID:4326');
		});

		it('should handle null geometry gracefully', () => {
			const cell = createGeometryCell(null);

			expect(cell.kind).toBe(GridCellKind.Custom);
			expect(cell.data.kind).toBe('geometry-cell');
			expect(cell.data.value).toBe(null);
			expect(cell.data.geometryType).toBe('Unknown');
			expect(cell.data.hasValidGeometry).toBe(false);
			expect(cell.data.displayText).toBe('null');
			expect(cell.data.coordinates).toBeUndefined();
		});

		it('should handle invalid geometry gracefully', () => {
			const invalidGeometry = { invalid: 'data' };

			const cell = createGeometryCell(invalidGeometry);

			expect(cell.kind).toBe(GridCellKind.Custom);
			expect(cell.data.kind).toBe('geometry-cell');
			expect(cell.data.value).toEqual(invalidGeometry);
			expect(cell.data.geometryType).toBe('Unknown');
			expect(cell.data.hasValidGeometry).toBe(false);
			expect(cell.data.displayText).toContain('{"invalid":"data"}');
		});

		it('should truncate long JSON strings', () => {
			const longGeometry = {
				type: 'FeatureCollection',
				features: Array.from({ length: 100 }, (_, i) => ({
					type: 'Feature',
					geometry: { type: 'Point', coordinates: [i, i] },
					properties: { id: i, name: `Point ${i}` },
				})),
			};

			const cell = createGeometryCell(longGeometry);

			expect(cell.kind).toBe(GridCellKind.Custom);
			expect(cell.data.kind).toBe('geometry-cell');
			expect(cell.data.value).toEqual(longGeometry);
			expect(cell.data.geometryType).toBe('FeatureCollection');
			expect(cell.data.hasValidGeometry).toBe(true); // FeatureCollection is valid GeoJSON
			// FeatureCollection is detected as valid GeoJSON, so it shows just the type name
			expect(cell.data.displayText).toBe('FeatureCollection');
		});

		it('should handle GeometryCollection type', () => {
			const geometryCollection = {
				geojson: {
					type: 'GeometryCollection',
					geometries: [
						{ type: 'Point', coordinates: [-74.0, 40.7] },
						{
							type: 'LineString',
							coordinates: [
								[-74.0, 40.7],
								[-73.9, 40.8],
							],
						},
					],
				},
				srid: 4326,
				x: -73.95,
				y: 40.75,
			};

			const cell = createGeometryCell(geometryCollection);

			expect(cell.kind).toBe(GridCellKind.Custom);
			expect(cell.data.kind).toBe('geometry-cell');
			expect(cell.data.value).toEqual(geometryCollection);
			expect(cell.data.geometryType).toBe('GeometryCollection');
			expect(cell.data.hasValidGeometry).toBe(true);
			expect(cell.data.displayText).toContain('GeometryCollection');
			expect(cell.data.displayText).toContain('-73.9500, 40.7500');
			expect(cell.data.displayText).toContain('SRID:4326');
		});

		it('should provide correct copyData', () => {
			const pointGeometry = {
				geojson: { type: 'Point', coordinates: [-74.004034996, 40.724461793] },
				srid: 4326,
				x: -74.004034996,
				y: 40.724461793,
			};

			const cell = createGeometryCell(pointGeometry);

			expect(cell.copyData).toBe(cell.data.displayText);
			expect(cell.copyData).toContain('Point');
			expect(cell.copyData).toContain('-74.0040, 40.7245');
		});
	});

	describe('Geometry display formatting', () => {
		it('should format coordinates with correct precision', () => {
			const pointGeometry = {
				geojson: { type: 'Point', coordinates: [-74.004034996123456, 40.724461793987654] },
				srid: 4326,
				x: -74.004034996123456,
				y: 40.724461793987654,
			};

			const cell = createGeometryCell(pointGeometry);

			// Should be formatted to 4 decimal places
			expect(cell.data.displayText).toContain('-74.0040, 40.7245');
			expect(cell.data.displayText).not.toContain('40.724461793987654');
		});

		it('should handle different geometry types with appropriate icons', () => {
			const lineStringGeometry = {
				geojson: {
					type: 'LineString',
					coordinates: [
						[-74.0, 40.7],
						[-73.9, 40.8],
					],
				},
				srid: 4326,
				x: -73.95,
				y: 40.75,
			};

			const cell = createGeometryCell(lineStringGeometry);

			expect(cell.data.geometryType).toBe('LineString');
			expect(cell.data.displayText).toContain('LineString');
			// Should not be a Point, so coordinates should be different format
			expect(cell.data.coordinates).toEqual([40.75, -73.95]);
		});
	});
});
