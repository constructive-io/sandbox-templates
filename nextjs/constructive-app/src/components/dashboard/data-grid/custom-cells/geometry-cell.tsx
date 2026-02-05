import { GridCellKind, type CustomCell, type CustomRenderer } from '@glideapps/glide-data-grid';

// Icons not drawn via Lucide here; using emojis in canvas

interface GeometryData {
	kind: 'geometry-cell';
	value: any;
	displayText: string;
	geometryType:
		| 'Point'
		| 'LineString'
		| 'Polygon'
		| 'MultiPoint'
		| 'MultiLineString'
		| 'MultiPolygon'
		| 'GeometryCollection'
		| 'Unknown';
	coordinates?: [number, number]; // For Point types
	hasValidGeometry: boolean;
	isEmpty?: boolean;
}

export interface GeometryCell extends CustomCell {
	readonly kind: GridCellKind.Custom;
	readonly data: GeometryData;
}

// Helper functions from the original geometry cell
function safeToFixed(value: number | undefined | null, decimals: number = 6): string {
	if (typeof value !== 'number' || !isFinite(value)) return '0';
	return value.toFixed(decimals);
}

function formatCoordinateDisplay(x: any, y: any, decimals: number = 4): string {
	const xStr = safeToFixed(x, decimals);
	const yStr = safeToFixed(y, decimals);
	return `${xStr}, ${yStr}`;
}

function isValidGeoJSON(obj: any): boolean {
	if (!obj || typeof obj !== 'object') return false;
	if (!obj.type || typeof obj.type !== 'string') return false;
	return true; // Simplified validation for display purposes
}

function isValidGeometry(obj: any): boolean {
	if (!obj || typeof obj !== 'object') return false;
	// Legacy/wrapped format with required properties
	if ('geojson' in obj && 'srid' in obj && 'x' in obj && 'y' in obj) {
		return isValidGeoJSON((obj as any).geojson);
	}
	return false;
}

// Accept wrapped objects which only contain a valid `geojson` property (no srid/x/y)
function isWrappedGeoJSON(obj: any): boolean {
	if (!obj || typeof obj !== 'object') return false;
	if (!('geojson' in obj)) return false;
	return isValidGeoJSON((obj as any).geojson);
}

function createGeometryDisplayText(geometry: any): {
	displayText: string;
	geometryType: string;
	coordinates?: [number, number];
	hasValidGeometry: boolean;
	isEmpty?: boolean;
} {
	if (geometry === null || geometry === undefined || geometry === '') {
		return {
			displayText: geometry === null ? 'null' : '',
			geometryType: 'Unknown',
			hasValidGeometry: false,
			isEmpty: true,
		};
	}

	try {
		// If geometry is a string, normalize empties and try to parse as JSON
		if (typeof geometry === 'string') {
			const trimmed = geometry.trim();
			if (trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
				return {
					displayText: '',
					geometryType: 'Unknown',
					hasValidGeometry: false,
					isEmpty: true,
				};
			}
			try {
				const parsed = JSON.parse(trimmed);
				geometry = parsed;
			} catch {
				// Not valid JSON string; keep as-is for fallback below
			}
		}

		// If parsing resulted in null, treat as empty
		if (geometry === null) {
			return {
				displayText: 'null',
				geometryType: 'Unknown',
				hasValidGeometry: false,
				isEmpty: true,
			};
		}

		// Handle raw GeoJSON (most common from PostGIS)
		if (isValidGeoJSON(geometry)) {
			const type = geometry.type || 'Unknown';
			if (type === 'Point' && Array.isArray(geometry.coordinates)) {
				const [lng, lat] = geometry.coordinates;
				const coordDisplay = `${safeToFixed(lat, 4)}, ${safeToFixed(lng, 4)}`;
				return {
					displayText: `📍 Point (${coordDisplay})`,
					geometryType: type,
					coordinates: [lat, lng],
					hasValidGeometry: true,
				};
			}
			return {
				displayText: type,
				geometryType: type,
				hasValidGeometry: true,
			};
		}

		// Handle wrapped geometry format (full object with srid/x/y)
		if (isValidGeometry(geometry)) {
			const geom = geometry as any;
			const type = geom.geojson?.type || 'Unknown';
			const coordinateDisplay = formatCoordinateDisplay(geom.x, geom.y, 4);
			const srid = geom.srid ? ` SRID:${geom.srid}` : '';
			const icon = type === 'Point' ? '📍' : '🗺️';
			return {
				displayText: `${icon} ${type} (${coordinateDisplay})${srid}`,
				geometryType: type,
				coordinates: [geom.y, geom.x], // Note: x,y in geometry object is lng,lat
				hasValidGeometry: true,
			};
		}

		// Handle wrapped geometry objects which only contain valid geojson
		if (isWrappedGeoJSON(geometry)) {
			const geom = geometry as any;
			const gj = geom.geojson;
			const type = gj?.type || 'Unknown';
			if (type === 'Point' && Array.isArray(gj.coordinates)) {
				const [lng, lat] = gj.coordinates;
				const coordDisplay = `${safeToFixed(lat, 4)}, ${safeToFixed(lng, 4)}`;
				return {
					displayText: `📍 Point (${coordDisplay})`,
					geometryType: type,
					coordinates: [lat, lng],
					hasValidGeometry: true,
				};
			}
			return {
				displayText: type,
				geometryType: type,
				hasValidGeometry: true,
			};
		}

		// Fallback to JSON preview
		const jsonPreview = typeof geometry === 'object' ? JSON.stringify(geometry) : String(geometry);
		return {
			displayText: `Invalid: ${jsonPreview}`,
			geometryType: 'Unknown',
			hasValidGeometry: false,
		};
	} catch {
		return {
			displayText: '',
			geometryType: 'Unknown',
			hasValidGeometry: false,
			isEmpty: true,
		};
	}
}

export function createGeometryCell(value: any): GeometryCell {
	const { displayText, geometryType, coordinates, hasValidGeometry, isEmpty } = createGeometryDisplayText(value);

	return {
		kind: GridCellKind.Custom,
		allowOverlay: true,
		copyData: displayText,
		data: {
			kind: 'geometry-cell',
			value,
			displayText,
			geometryType: geometryType as any,
			coordinates,
			hasValidGeometry,
			isEmpty,
		},
	};
}

const GeometryRenderer: CustomRenderer<GeometryCell> = {
	kind: GridCellKind.Custom,
	isMatch: (c): c is GeometryCell => (c.data as any).kind === 'geometry-cell',
	draw: (args, cell) => {
		const { ctx, theme, rect } = args;
		const { data } = cell;
	const { displayText, geometryType, hasValidGeometry, isEmpty } = data;

		// Do not paint over the entire cell background.
		// Glide draws backgrounds and borders; overpainting here hides the grid lines.
		// We only render content (icons/text) inside the cell.

		// If empty, render nothing (blank cell)
		if (isEmpty) {
			return;
		}

		// Set up text styling
		ctx.fillStyle = theme.textDark;
		ctx.font = `${theme.baseFontStyle} ${theme.fontFamily}`;

		// Calculate icon and text positioning
		const padding = 8;
		const iconSize = 14;
		const iconY = rect.y + (rect.height - iconSize) / 2;
		const textX = rect.x + padding + iconSize + 6;
		const textY = rect.y + rect.height / 2 + 4; // Approximate vertical center

		// Draw icon based on geometry type and validity
		ctx.save();
		ctx.font = `${iconSize}px Arial`; // Use a standard font for icons

		if (hasValidGeometry) {
			if (geometryType === 'Point') {
				// Draw a pin icon for points
				ctx.fillStyle = '#3b82f6'; // Blue color
				ctx.fillText('📍', rect.x + padding, iconY + iconSize);
			} else {
				// Draw a map icon for other geometries
				ctx.fillStyle = '#10b981'; // Green color
				ctx.fillText('🗺️', rect.x + padding, iconY + iconSize);
			}
		} else if (!isEmpty) {
			// Draw a warning icon for invalid geometries (but not for empty cells)
			ctx.fillStyle = '#ef4444'; // Red color
			ctx.fillText('⚠️', rect.x + padding, iconY + iconSize);
		}

		ctx.restore();

		// Choose a concise text representation for the cell
		let textToRender = '';
		const maxTextWidth = rect.width - textX - padding;

		const fits = (s: string) => ctx.measureText(s).width <= maxTextWidth;

		if (hasValidGeometry) {
			if (geometryType === 'Point' && data.coordinates) {
				const [lat, lng] = data.coordinates;

				// Prefer numeric-friendly strategies instead of character truncation
				const candidates: string[] = [];
				// With space
				candidates.push(`${safeToFixed(lat, 4)}, ${safeToFixed(lng, 4)}`);
				candidates.push(`${safeToFixed(lat, 3)}, ${safeToFixed(lng, 3)}`);
				candidates.push(`${safeToFixed(lat, 2)}, ${safeToFixed(lng, 2)}`);
				candidates.push(`${safeToFixed(lat, 1)}, ${safeToFixed(lng, 1)}`);
				// Without space
				candidates.push(`${safeToFixed(lat, 2)},${safeToFixed(lng, 2)}`);
				candidates.push(`${safeToFixed(lat, 1)},${safeToFixed(lng, 1)}`);
				// Only latitude if needed
				candidates.push(`${safeToFixed(lat, 2)}`);
				candidates.push(`${safeToFixed(lat, 1)}`);

				textToRender = candidates.find(fits) || `${safeToFixed(lat, 0)},${safeToFixed(lng, 0)}`;
			} else if (geometryType) {
				textToRender = geometryType;
			}
		} else if (!isEmpty) {
			textToRender = 'Invalid';
		}

		if (!textToRender && displayText) {
			textToRender = displayText;
		}

		if (textToRender) {
			ctx.fillStyle = hasValidGeometry ? theme.textDark : theme.textMedium;
			ctx.font = `${theme.baseFontStyle} ${theme.fontFamily}`;

			// Avoid ellipsis for numeric coordinates to prevent awkward "40...." cases
			if (!fits(textToRender) && geometryType !== 'Point') {
				let renderText = textToRender;
				while (renderText.length > 3 && !fits(renderText + '…')) {
					renderText = renderText.slice(0, -1);
				}
				renderText += '…';
				ctx.fillText(renderText, textX, textY);
			} else {
				ctx.fillText(textToRender, textX, textY);
			}
		}
	},
	provideEditor: () => undefined, // Editor is handled by the main DataGridV2 provideEditor
	onPaste: () => undefined, // Paste is handled by the main DataGridV2
};

export default GeometryRenderer;
