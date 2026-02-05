import { CellRegistry } from '@/lib/cell-registry';
import { CellType } from '@/lib/types/cell-types';

import { CellFormWrapper } from './cell-form-wrapper';
import { FormFieldRegistryEntry, FormFieldValidation } from './types';

/**
 * Bridge system that automatically creates form field entries from cell registry entries
 * This ensures consistency between data grid display and form input components
 */
export class CellToFormBridge {
	/**
	 * Generate form field entries from cell registry entries that don't have dedicated form components
	 */
	static generateFormFieldsFromCells(): FormFieldRegistryEntry[] {
		const formFields: FormFieldRegistryEntry[] = [];
		const allCellEntries = CellRegistry.getAll();
		const allCellTypes = allCellEntries.map((entry) => entry.type);

		// Get existing form field types to avoid duplicates
		const existingFormTypes = new Set<CellType>();

		for (const cellType of allCellTypes) {
			if (existingFormTypes.has(cellType)) {
				continue; // Skip if we already have a dedicated form field
			}

			const cellEntry = CellRegistry.get(cellType);
			if (!cellEntry) continue;

			// Create form field from cell entry
			const formField = this.createFormFieldFromCell(cellEntry);
			if (formField) {
				formFields.push(formField);
			}
		}

		return formFields;
	}

	/**
	 * Create a form field entry from a cell registry entry
	 */
	private static createFormFieldFromCell(cellEntry: any): FormFieldRegistryEntry | null {
		const { type, component, validator, formatter, parser, defaultValue, metadata } = cellEntry;

		// Skip relation and unknown types - they need specialized handling
		if (type === 'relation' || type === 'unknown') {
			return null;
		}

		return {
			type,
			component: CellFormWrapper.createFormWrapper(component, type),
			validator: this.adaptCellValidatorToForm(validator),
			formatter: formatter || ((value) => String(value || '')),
			parser: parser || ((input) => input),
			defaultValue: defaultValue || (() => this.getDefaultValueForType(type)),
			metadata: this.adaptCellMetadataToForm(metadata, type),
		};
	}

	/**
	 * Adapt cell validator to form validator interface
	 */
	private static adaptCellValidatorToForm(
		cellValidator?: (value: any) => boolean,
	): ((value: any, validation?: FormFieldValidation) => string | undefined) | undefined {
		if (!cellValidator) {
			return (value, validation) => {
				if (validation?.required && (value === null || value === undefined || value === '')) {
					return 'This field is required';
				}
				return undefined;
			};
		}

		return (value, validation) => {
			// Check required first
			if (validation?.required && (value === null || value === undefined || value === '')) {
				return 'This field is required';
			}

			// Check with cell validator
			if (value !== null && value !== undefined && value !== '' && !cellValidator(value)) {
				return `Please enter a valid ${this.getTypeDisplayName(value)}`;
			}

			// Additional form-specific validations
			if (validation?.minLength && typeof value === 'string' && value.length < validation.minLength) {
				return `Must be at least ${validation.minLength} characters`;
			}
			if (validation?.maxLength && typeof value === 'string' && value.length > validation.maxLength) {
				return `Must be no more than ${validation.maxLength} characters`;
			}
			if (validation?.min !== undefined && typeof value === 'number' && value < validation.min) {
				return `Value must be at least ${validation.min}`;
			}
			if (validation?.max !== undefined && typeof value === 'number' && value > validation.max) {
				return `Value must be at most ${validation.max}`;
			}
			if (validation?.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
				return 'Please enter a valid format';
			}

			return undefined;
		};
	}

	/**
	 * Adapt cell metadata to form metadata
	 */
	private static adaptCellMetadataToForm(cellMetadata: any, type: CellType): any {
		if (!cellMetadata) {
			return {
				name: this.getTypeDisplayName(type),
				description: `${this.getTypeDisplayName(type)} input field`,
				category: this.getCategoryForType(type),
				supportsValidation: true,
				width: this.getDefaultWidthForType(type),
			};
		}

		return {
			name: cellMetadata.name || this.getTypeDisplayName(type),
			description: cellMetadata.description || `${cellMetadata.name || this.getTypeDisplayName(type)} input`,
			category: cellMetadata.category || this.getCategoryForType(type),
			inputType: this.getInputTypeForCellType(type),
			multiline: this.isMultilineType(type),
			rows: this.getRowsForType(type),
			supportsValidation: true,
			width: this.getDefaultWidthForType(type),
			// Copy cell-specific metadata that's relevant to forms
			step: this.getStepForType(type),
			min: cellMetadata.min,
			max: cellMetadata.max,
		};
	}

	/**
	 * Get appropriate HTML input type for cell type
	 */
	private static getInputTypeForCellType(type: CellType): string {
		const inputTypeMap: Record<CellType, string> = {
			// Text types
			text: 'text',
			textarea: 'textarea',
			email: 'email',
			url: 'url',
			phone: 'tel',
			citext: 'text',
			bpchar: 'text',

			// Numeric types
			number: 'number',
			integer: 'number',
			smallint: 'number',
			decimal: 'number',
			currency: 'number',
			percentage: 'number',

			// Date/time types
			date: 'date',
			datetime: 'datetime-local',
			time: 'time',
			timestamptz: 'datetime-local',
			interval: 'text',

			// Boolean types
			boolean: 'checkbox',
			toggle: 'checkbox',
			bit: 'checkbox',

			// Structured data types
			json: 'textarea',
			jsonb: 'textarea',
			array: 'textarea',

			// Array types
			'text-array': 'textarea',
			'uuid-array': 'textarea',
			'number-array': 'textarea',
			'integer-array': 'textarea',
			'date-array': 'textarea',

			// Geometric types
			geometry: 'textarea',
			'geometry-point': 'textarea',
			'geometry-collection': 'textarea',

			// Network types
			inet: 'text',

			// Media types
			image: 'url',
			file: 'file',
			video: 'url',
			audio: 'url',
			upload: 'file',

			// Special types
			uuid: 'text',
			color: 'color',
			rating: 'number',
			tags: 'textarea',
			tsvector: 'textarea',
			origin: 'text',

			// Relation types
			relation: 'textarea',

			// Fallback
			unknown: 'text',
		};

		return inputTypeMap[type] || 'text';
	}

	/**
	 * Check if type should use multiline input
	 */
	private static isMultilineType(type: CellType): boolean {
		return [
			'textarea',
			'json',
			'jsonb',
			'array',
			'text-array',
			'uuid-array',
			'number-array',
			'integer-array',
			'date-array',
			'geometry',
			'geometry-point',
			'geometry-collection',
			'tsvector',
			'tags',
			'relation',
		].includes(type);
	}

	/**
	 * Get number of rows for multiline types
	 */
	private static getRowsForType(type: CellType): number | undefined {
		const rowsMap: Partial<Record<CellType, number>> = {
			textarea: 4,
			json: 6,
			jsonb: 6,
			array: 4,
			'text-array': 4,
			'uuid-array': 4,
			'number-array': 4,
			'integer-array': 4,
			'date-array': 4,
			geometry: 6,
			'geometry-point': 4,
			'geometry-collection': 6,
			tsvector: 3,
			tags: 2,
			relation: 3,
		};

		return rowsMap[type];
	}

	/**
	 * Get step value for numeric inputs
	 */
	private static getStepForType(type: CellType): number | undefined {
		const stepMap: Partial<Record<CellType, number>> = {
			integer: 1,
			smallint: 1,
			number: 0.01,
			decimal: 0.01,
			currency: 0.01,
			percentage: 0.01,
			rating: 1,
		};

		return stepMap[type];
	}

	/**
	 * Get default width for form field
	 */
	private static getDefaultWidthForType(type: CellType): 'full' | 'half' | 'third' | 'quarter' {
		// Full width types (need more space)
		if (
			[
				'textarea',
				'json',
				'jsonb',
				'array',
				'text-array',
				'uuid-array',
				'number-array',
				'integer-array',
				'date-array',
				'geometry',
				'geometry-point',
				'geometry-collection',
				'tsvector',
				'tags',
				'relation',
				'url',
				'email',
				'image',
				'file',
				'video',
				'audio',
				'upload',
			].includes(type)
		) {
			return 'full';
		}

		// Half width types (moderate space)
		if (
			[
				'text',
				'phone',
				'citext',
				'uuid',
				'date',
				'datetime',
				'timestamptz',
				'time',
				'interval',
				'inet',
				'color',
				'origin',
			].includes(type)
		) {
			return 'half';
		}

		// Quarter width types (compact)
		if (['boolean', 'toggle', 'bit'].includes(type)) {
			return 'quarter';
		}

		// Default to half for numeric and others
		return 'half';
	}

	/**
	 * Get default value for a cell type
	 */
	private static getDefaultValueForType(type: CellType): any {
		const defaultMap: Partial<Record<CellType, any>> = {
			// Text types
			text: '',
			textarea: '',
			email: '',
			url: '',
			phone: '',
			citext: '',
			bpchar: '',

			// Numeric types
			number: 0,
			integer: 0,
			smallint: 0,
			decimal: 0,
			currency: 0,
			percentage: 0,

			// Date/time types
			date: null,
			datetime: null,
			time: null,
			timestamptz: null,
			interval: { days: 0, hours: 0, minutes: 0, seconds: 0 },

			// Boolean types
			boolean: false,
			toggle: false,
			bit: false,

			// Structured data types
			json: {},
			jsonb: {},
			array: [],

			// Array types
			'text-array': [],
			'uuid-array': [],
			'number-array': [],
			'integer-array': [],
			'date-array': [],

			// Geometric types
			geometry: { geojson: { type: 'Point', coordinates: [0, 0] }, srid: 4326, x: 0, y: 0 },
			'geometry-point': { geojson: { type: 'Point', coordinates: [0, 0] }, srid: 4326, x: 0, y: 0 },
			'geometry-collection': { geojson: { type: 'GeometryCollection', geometries: [] }, srid: 4326, x: 0, y: 0 },

			// Network types
			inet: '',

			// Media types
			image: '',
			file: null,
			video: '',
			audio: '',
			upload: null,

			// Special types
			uuid: '',
			color: '#000000',
			rating: 0,
			tags: [],
			tsvector: '',
			origin: '',

			// Relation types
			relation: null,

			// Fallback
			unknown: '',
		};

		return defaultMap[type] ?? '';
	}

	/**
	 * Get display name for type
	 */
	private static getTypeDisplayName(type: CellType | any): string {
		if (typeof type !== 'string') return 'value';

		const nameMap: Record<CellType, string> = {
			text: 'Text',
			textarea: 'Text Area',
			email: 'Email',
			url: 'URL',
			phone: 'Phone',
			citext: 'Case-insensitive Text',
			bpchar: 'Character',
			number: 'Number',
			integer: 'Integer',
			smallint: 'Small Integer',
			decimal: 'Decimal',
			currency: 'Currency',
			percentage: 'Percentage',
			date: 'Date',
			datetime: 'Date Time',
			time: 'Time',
			timestamptz: 'Timestamp with Timezone',
			interval: 'Time Interval',
			boolean: 'Boolean',
			toggle: 'Toggle',
			bit: 'Bit',
			json: 'JSON',
			jsonb: 'JSONB',
			array: 'Array',
			'text-array': 'Text Array',
			'uuid-array': 'UUID Array',
			'number-array': 'Number Array',
			'integer-array': 'Integer Array',
			'date-array': 'Date Array',
			geometry: 'Geometry',
			'geometry-point': 'Geometry Point',
			'geometry-collection': 'Geometry Collection',
			inet: 'IP Address',
			image: 'Image',
			file: 'File',
			video: 'Video',
			audio: 'Audio',
			upload: 'File Upload',
			uuid: 'UUID',
			color: 'Color',
			rating: 'Rating',
			tags: 'Tags',
			tsvector: 'TSVector',
			origin: 'Origin',
			relation: 'Relation',
			unknown: 'Unknown',
		};

		return nameMap[type as CellType] || 'Value';
	}

	/**
	 * Get category for type
	 */
	private static getCategoryForType(type: CellType): string {
		if (['text', 'textarea', 'email', 'url', 'phone', 'citext', 'bpchar'].includes(type)) return 'text';
		if (['number', 'integer', 'smallint', 'decimal', 'currency', 'percentage', 'rating'].includes(type))
			return 'numeric';
		if (['date', 'datetime', 'time', 'timestamptz', 'interval'].includes(type)) return 'date';
		if (['boolean', 'toggle', 'bit'].includes(type)) return 'boolean';
		if (
			[
				'json',
				'jsonb',
				'array',
				'text-array',
				'uuid-array',
				'number-array',
				'integer-array',
				'date-array',
				'tags',
			].includes(type)
		)
			return 'structured';
		if (['geometry', 'geometry-point', 'geometry-collection'].includes(type)) return 'geometric';
		if (['inet'].includes(type)) return 'network';
		if (['image', 'file', 'video', 'audio', 'upload'].includes(type)) return 'media';
		return 'special';
	}
}
