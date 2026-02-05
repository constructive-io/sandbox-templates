import { GridCell, GridCellKind } from '@glideapps/glide-data-grid';

import { compactJsonPreview } from './data-grid.formatters';
import type {
	BooleanCell,
	BubbleCell,
	CellCreationMetadata,
	ImageCell,
	NumberCell,
	TextCell,
	UriCell,
} from './grid-cell-types';

// PostgreSQL interval value structure
interface IntervalValue {
	years?: number;
	months?: number;
	days?: number;
	hours?: number;
	minutes?: number;
	seconds?: number;
}

/**
 * Format a PostgreSQL interval value for compact cell display.
 * Shows only non-zero units in descending order of magnitude.
 * Examples: "1y 6mo", "2h 30m", "7d", "45s"
 */
function formatIntervalForDisplay(value: unknown): string {
	if (value === null || value === undefined) return '';

	let interval: IntervalValue;

	if (typeof value === 'string') {
		// Try to parse JSON string
		try {
			interval = JSON.parse(value);
		} catch {
			// If it's already formatted (e.g., "1d 2h"), return as-is
			if (/\d+[yMwdhms]/.test(value)) {
				return value;
			}
			return value;
		}
	} else if (typeof value === 'object') {
		interval = value as IntervalValue;
	} else {
		return String(value);
	}

	const parts: string[] = [];

	// Years
	if (interval.years && interval.years !== 0) {
		parts.push(`${interval.years}y`);
	}

	// Months
	if (interval.months && interval.months !== 0) {
		parts.push(`${interval.months}mo`);
	}

	// Days
	if (interval.days && interval.days !== 0) {
		parts.push(`${interval.days}d`);
	}

	// Hours
	if (interval.hours && interval.hours !== 0) {
		parts.push(`${interval.hours}h`);
	}

	// Minutes
	if (interval.minutes && interval.minutes !== 0) {
		parts.push(`${interval.minutes}m`);
	}

	// Seconds
	if (interval.seconds && interval.seconds !== 0) {
		// Show decimal seconds if fractional
		const secs = interval.seconds;
		if (Number.isInteger(secs)) {
			parts.push(`${secs}s`);
		} else {
			parts.push(`${secs.toFixed(1)}s`);
		}
	}

	// If all values are zero or missing, show "0s"
	if (parts.length === 0) {
		return '0s';
	}

	return parts.join(' ');
}

// Minimal tsvector parser for previews: extracts lexemes and unique weights
function parseTsvectorForPreview(tsvector: string): Array<{ lexeme: string; weights: Array<'A' | 'B' | 'C' | 'D'> }> {
	if (!tsvector || typeof tsvector !== 'string') return [];
	const results: Array<{ lexeme: string; weights: Array<'A' | 'B' | 'C' | 'D'> }> = [];
	try {
		const regex = /'([^']+)':([0-9A-D,]+)/g;
		let match: RegExpExecArray | null;
		while ((match = regex.exec(tsvector)) !== null) {
			const lexeme = match[1];
			const posStr = match[2];
			const weights = Array.from(
				new Set(
					posStr
						.split(',')
						.map((p) => p.match(/[A-D]$/)?.[0] as 'A' | 'B' | 'C' | 'D' | undefined)
						.filter((w): w is 'A' | 'B' | 'C' | 'D' => !!w),
				),
			).sort();
			results.push({ lexeme, weights });
		}
	} catch {
		// ignore parsing errors
	}
	return results;
}

// Abstract factory base class
abstract class CellContentFactory {
	abstract canHandle(cellType: string, value: any): boolean;
	abstract create(
		value: any,
		metadata: CellCreationMetadata,
		createGeometryCell?: (_value: any) => GridCell,
	): GridCell;

	protected createActivationBehavior(metadata: CellCreationMetadata): 'single-click' | 'double-click' | undefined {
		// Always return the resolved activation behavior to avoid relying on cell-type defaults
		return metadata.activationBehavior;
	}
}

// Image cell factory
class ImageCellFactory extends CellContentFactory {
	canHandle(cellType: string, _value: any): boolean {
		return cellType === 'image' || cellType === 'upload';
	}

	create(value: any, metadata: CellCreationMetadata): ImageCell {
		// Handle null values by showing empty image cell
		if (value === null || value === undefined || value === '') {
			return {
				kind: GridCellKind.Image,
				data: [''],
				displayData: [''],
				allowOverlay: true,
				readonly: false,
				activationBehaviorOverride: this.createActivationBehavior(metadata),
			};
		}

		let url = '';
		if (typeof value === 'string') {
			url = value;
		} else if (typeof value === 'object' && value) {
			url = value.url || value.src || value.href || value.path || '';
		}

		return {
			kind: GridCellKind.Image,
			data: [url],
			displayData: [url],
			allowOverlay: true,
			readonly: false,
			activationBehaviorOverride: this.createActivationBehavior(metadata),
		};
	}
}

// URL/Email cell factory
class UriCellFactory extends CellContentFactory {
	canHandle(cellType: string, _value: any): boolean {
		return cellType === 'url' || cellType === 'email';
	}

	create(value: any, metadata: CellCreationMetadata): UriCell {
		// Handle null values by showing empty URI cell
		if (value === null || value === undefined || value === '') {
			return {
				kind: GridCellKind.Uri,
				data: '',
				displayData: '',
				allowOverlay: true,
				hoverEffect: false,
			};
		}

		const stringValue = String(value);
		const isEmail = metadata.cellType === 'email';

		if (isEmail) {
			return {
				kind: GridCellKind.Uri,
				data: `mailto:${stringValue}`,
				displayData: stringValue, // Show just the email, not mailto:
				allowOverlay: true,
				hoverEffect: true,
				onClickUri: () => {
					window.location.href = `mailto:${stringValue}`;
				},
			};
		}

		return {
			kind: GridCellKind.Uri,
			data: stringValue,
			displayData: stringValue,
			allowOverlay: true,
			hoverEffect: true,
			onClickUri: () => {
				window.open(stringValue, '_blank');
			},
		};
	}
}

// Array/Bubble cell factory
class ArrayCellFactory extends CellContentFactory {
	canHandle(cellType: string, _value: any): boolean {
		return cellType?.endsWith('-array') || cellType === 'array' || cellType === 'tsvector' || cellType === 'tags';
	}

	create(value: any, metadata: CellCreationMetadata): BubbleCell {
		// Handle null values by showing empty array
		if (value === null || value === undefined) {
			return {
				kind: GridCellKind.Bubble,
				data: [],
				allowOverlay: true,
			};
		}

		// Handle tags specially (common shape: comma-separated string)
		if (metadata.cellType === 'tags') {
			if (Array.isArray(value)) {
				return {
					kind: GridCellKind.Bubble,
					data: value.map((v) => (v == null ? '' : String(v))).filter((v) => v.length > 0),
					allowOverlay: true,
				};
			}
			if (typeof value === 'string') {
				const data = value
					.split(',')
					.map((v) => v.trim())
					.filter((v) => v.length > 0);
				return {
					kind: GridCellKind.Bubble,
					data,
					allowOverlay: true,
				};
			}
		}

		// Handle tsvector specially
		if (metadata.cellType === 'tsvector' && typeof value === 'string') {
			const tokens = parseTsvectorForPreview(value);
			const labels = tokens.map((t) => (t.weights.length ? `${t.lexeme} ${t.weights.join(',')}` : t.lexeme));
			return {
				kind: GridCellKind.Bubble,
				data: labels,
				allowOverlay: true,
			};
		}

		// Handle regular arrays
		if (Array.isArray(value)) {
			const stringData = value.map((item) => {
				if (item === null || item === undefined) return '';
				if (typeof item === 'string') return item;
				if (typeof item === 'number') return String(item);
				if (typeof item === 'boolean') return String(item);
				if (item instanceof Date) return item.toISOString().split('T')[0];
				if (typeof item === 'object') return JSON.stringify(item);
				return String(item);
			});

			return {
				kind: GridCellKind.Bubble,
				data: stringData,
				allowOverlay: true,
			};
		}

		// Fallback for non-array values that should be arrays
		return {
			kind: GridCellKind.Bubble,
			data: [String(value)],
			allowOverlay: true,
		};
	}
}

// Date/Time cell factory
class DateTimeCellFactory extends CellContentFactory {
	canHandle(cellType: string, _value: any): boolean {
		return ['date', 'datetime', 'timestamptz', 'time'].includes(cellType);
	}

	create(value: any, metadata: CellCreationMetadata): TextCell {
		// Handle null values by showing empty date cell
		if (value === null || value === undefined) {
			return {
				kind: GridCellKind.Text,
				data: '',
				displayData: '',
				allowOverlay: true,
				activationBehaviorOverride: this.createActivationBehavior(metadata),
			};
		}

		return {
			kind: GridCellKind.Text,
			data: String(value),
			displayData: String(value),
			allowOverlay: true,
			activationBehaviorOverride: this.createActivationBehavior(metadata),
		};
	}
}

// Interval cell factory - displays PostgreSQL interval in human-readable format
class IntervalCellFactory extends CellContentFactory {
	canHandle(cellType: string, _value: any): boolean {
		return cellType === 'interval';
	}

	create(value: any, metadata: CellCreationMetadata): TextCell {
		// Handle null values
		if (value === null || value === undefined) {
			return {
				kind: GridCellKind.Text,
				data: '',
				displayData: '',
				allowOverlay: true,
				activationBehaviorOverride: this.createActivationBehavior(metadata),
			};
		}

		// Format the interval for display
		const displayValue = formatIntervalForDisplay(value);

		// Store original value as data for editing, display formatted version
		const dataValue = typeof value === 'string' ? value : JSON.stringify(value);

		return {
			kind: GridCellKind.Text,
			data: dataValue,
			displayData: displayValue,
			allowOverlay: true,
			activationBehaviorOverride: this.createActivationBehavior(metadata),
		};
	}
}

// Geometry cell factory
class GeometryCellFactory extends CellContentFactory {
	canHandle(cellType: string, _value: any): boolean {
		return ['geometry', 'geometry-point', 'geometry-collection'].includes(cellType);
	}

	create(value: any, metadata: CellCreationMetadata, createGeometryCell?: (value: any) => GridCell): GridCell {
		if (createGeometryCell) {
			return createGeometryCell(value ?? null);
		}

		const display = compactJsonPreview(value, 80);
		return {
			kind: GridCellKind.Text,
			data: display,
			displayData: display,
			allowOverlay: true,
			activationBehaviorOverride: this.createActivationBehavior(metadata),
		};
	}
}

// Relation cell factory
const DEFAULT_MAX_RELATION_CHIPS = 3;
const DEFAULT_RELATION_LABEL_MAX_LEN = 24;

function truncateLabel(s: string, max: number): string {
	if (s.length <= max) return s;
	if (max <= 1) return '…';
	return s.slice(0, Math.max(0, max - 1)) + '…';
}

class RelationCellFactory extends CellContentFactory {
	canHandle(cellType: string, _value: any): boolean {
		return cellType === 'relation';
	}

	private deriveRelationLabel(relationValue: any, metadata: CellCreationMetadata, maxLength: number): string {
		if (relationValue == null) return '';

		const ensureString = (val: unknown): string => {
			if (val == null) return '';
			const str = String(val).trim();
			if (!str || str.toLowerCase() === 'null') return '';
			return str;
		};

		if (typeof relationValue === 'string' || typeof relationValue === 'number') {
			return truncateLabel(ensureString(relationValue), maxLength);
		}

		if (Array.isArray(relationValue)) {
			const labels = relationValue
				.map((item) => this.deriveRelationLabel(item, metadata, maxLength))
				.filter((label) => label.length > 0);
			return labels.join(', ');
		}

		if (typeof relationValue !== 'object') {
			return truncateLabel(ensureString(relationValue), maxLength);
		}

		const relInfo = (metadata.fieldMeta && (metadata.fieldMeta as any).__relationInfo) || undefined;
		const candidatesFromMeta: string[] = relInfo?.displayCandidates ?? [];
		const objectValue = relationValue as Record<string, unknown>;
		const keys = Object.keys(objectValue);

		const heuristicKeys = Array.from(
			new Set(
				[
					...candidatesFromMeta,
					...keys.filter((key) => /(name|label|title|display|email)/i.test(key)),
					'displayName',
					'fullName',
					'name',
					'title',
					'label',
					'description',
					'username',
					'email',
					'code',
					'id',
					'uuid',
					'nodeId',
				].filter(Boolean),
			),
		);

		for (const candidate of heuristicKeys) {
			if (!candidate) continue;
			const candidateValue = ensureString(objectValue[candidate]);
			if (candidateValue) {
				return truncateLabel(candidateValue, maxLength);
			}
		}

		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		const uuidLike = keys.map((key) => ensureString(objectValue[key])).find((val) => val && uuidRegex.test(val));
		if (uuidLike) {
			return truncateLabel(uuidLike, maxLength);
		}

		const firstPrimitive = keys
			.map((key) => objectValue[key])
			.find((val) => val != null && ['string', 'number', 'boolean'].includes(typeof val));
		if (firstPrimitive !== undefined) {
			return truncateLabel(ensureString(firstPrimitive), maxLength);
		}

		return truncateLabel(compactJsonPreview(objectValue, 80), maxLength);
	}

	create(value: any, metadata: CellCreationMetadata): TextCell | BubbleCell {
		const relInfo: { kind?: string } | undefined =
			(metadata.fieldMeta && (metadata.fieldMeta as any).__relationInfo) || undefined;
		const relOptions: { relationChipLimit?: number; relationLabelMaxLength?: number } | undefined =
			(metadata.fieldMeta && (metadata.fieldMeta as any).__relationOptions) || undefined;
		const chipLimit = relOptions?.relationChipLimit ?? DEFAULT_MAX_RELATION_CHIPS;
		const labelMax = relOptions?.relationLabelMaxLength ?? DEFAULT_RELATION_LABEL_MAX_LEN;

		const isListRelation = relInfo?.kind === 'hasMany' || relInfo?.kind === 'manyToMany';

		if (isListRelation) {
			const arr = Array.isArray(value) ? value : [];
			const labelsAll = arr
				.map((entry) => this.deriveRelationLabel(entry, metadata, labelMax))
				.filter((label) => label.length > 0);
			const labels = labelsAll.slice(0, chipLimit);
			const remaining = labelsAll.length - labels.length;
			const finalData = remaining > 0 ? [...labels, `+${remaining}`] : labels;
			return {
				kind: GridCellKind.Bubble,
				data: finalData,
				allowOverlay: true,
				activationBehaviorOverride: this.createActivationBehavior(metadata),
			};
		}

		const display = this.deriveRelationLabel(value, metadata, labelMax);

		return {
			kind: GridCellKind.Text,
			data: display,
			displayData: display,
			allowOverlay: true,
			activationBehaviorOverride: this.createActivationBehavior(metadata),
		};
	}
}

// Number cell factory
class NumberCellFactory extends CellContentFactory {
	canHandle(cellType: string, _value: any): boolean {
		return ['number', 'integer', 'decimal', 'currency', 'smallint', 'percentage', 'rating'].includes(cellType);
	}

	create(value: any, _metadata: CellCreationMetadata): NumberCell {
		// Null/undefined -> empty NumberCell (data: undefined is valid per Glide docs)
		if (value === null || value === undefined) {
			return {
				kind: GridCellKind.Number,
				data: undefined,
				displayData: '',
				allowOverlay: true,
			};
		}

		const numValue = typeof value === 'number' ? value : parseFloat(value);
		// Invalid number -> still return NumberCell with undefined data
		if (isNaN(numValue)) {
			return {
				kind: GridCellKind.Number,
				data: undefined,
				displayData: '',
				allowOverlay: true,
			};
		}

		return {
			kind: GridCellKind.Number,
			data: numValue,
			displayData: String(numValue),
			allowOverlay: true,
		};
	}
}

// Boolean cell factory
class BooleanCellFactory extends CellContentFactory {
	canHandle(cellType: string, _value: any): boolean {
		return ['boolean', 'bit', 'toggle'].includes(cellType);
	}

	create(value: any, _metadata: CellCreationMetadata): BooleanCell {
		// For null/undefined values, show unchecked boolean cell (allows interaction)
		const boolValue = value === null || value === undefined ? false : (typeof value === 'boolean' ? value : Boolean(value));
		return {
			kind: GridCellKind.Boolean,
			data: boolValue,
			allowOverlay: false,
		};
	}
}

// Default text cell factory (fallback)
class TextCellFactory extends CellContentFactory {
	canHandle(_cellType: string, _value: any): boolean {
		return true; // This is the fallback factory
	}

	create(value: any, metadata: CellCreationMetadata): TextCell {
		// Treat nullish values as empty string to avoid showing "null"/"undefined"
		if (value === null || value === undefined) {
			return {
				kind: GridCellKind.Text,
				data: '',
				displayData: '',
				allowOverlay: true,
				activationBehaviorOverride: this.createActivationBehavior(metadata),
			};
		}

		if (typeof value === 'string') {
			return {
				kind: GridCellKind.Text,
				data: value,
				displayData: value,
				allowOverlay: true,
				activationBehaviorOverride: this.createActivationBehavior(metadata),
			};
		}

		// For complex objects, create a JSON preview
		const display = compactJsonPreview(value, 80);
		return {
			kind: GridCellKind.Text,
			data: display,
			displayData: display,
			allowOverlay: true,
			activationBehaviorOverride: this.createActivationBehavior(metadata),
		};
	}
}

// Registry of all factories (order matters - more specific first)
const CELL_FACTORIES: CellContentFactory[] = [
	new ImageCellFactory(),
	new UriCellFactory(),
	new ArrayCellFactory(),
	new DateTimeCellFactory(),
	new IntervalCellFactory(),
	new GeometryCellFactory(),
	new RelationCellFactory(),
	new NumberCellFactory(),
	new BooleanCellFactory(),
	new TextCellFactory(), // Fallback - must be last
];

// Main factory function
export function createCellContent(
	value: any,
	metadata: CellCreationMetadata,
	createGeometryCell?: (_value: any) => GridCell,
): GridCell {
	// Handle null/undefined values first
	if (value === null || value === undefined) {
		// Ensure geometry cells receive the renderer even when value is null
		return createEmptyCell(metadata, createGeometryCell);
	}

	// Find appropriate factory
	const factory = CELL_FACTORIES.find((f) => f.canHandle(metadata.cellType, value));

	if (!factory) {
		// This should never happen due to TextCellFactory fallback, but just in case
		return {
			kind: GridCellKind.Text,
			data: String(value),
			displayData: String(value),
			allowOverlay: true,
		};
	}

	return factory.create(value, metadata, createGeometryCell);
}

// Helper function for creating empty cells
function createEmptyCell(
	metadata: CellCreationMetadata,
	createGeometryCell?: (_value: any) => GridCell,
): GridCell {
	const { cellType } = metadata;

	// Delegate to appropriate factory with empty/null value
	const factory = CELL_FACTORIES.find((f) => f.canHandle(cellType, null));

	if (factory) {
		return factory.create(null, metadata, createGeometryCell);
	}

	// Ultimate fallback
	return {
		kind: GridCellKind.Text,
		data: '',
		displayData: '',
		allowOverlay: true,
	};
}
