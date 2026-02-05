import { CellRegistry } from '@/lib/cell-registry';
import { CellType } from '@/lib/types/cell-types';

import { ADVANCED_FORM_FIELDS } from './advanced-form-fields';
import { GeometryFormWrapper, RelationFormWrapper } from './cell-form-wrapper';
import { CellToFormBridge } from './cell-to-form-bridge';
import { DEFAULT_FORM_FIELDS } from './default-form-fields';
import { FormFieldRegistryEntry } from './types';

/**
 * Complete form field registry that combines:
 * 1. Manually crafted form fields (DEFAULT_FORM_FIELDS)
 * 2. Enhanced form fields (ADVANCED_FORM_FIELDS)
 * 3. Auto-generated form fields from cell registry (via bridge)
 * 4. Specialized form wrappers for complex types
 *
 * This ensures 100% coverage of all cell types with optimal form components
 */

// Create specialized form field entries for complex types
const SPECIALIZED_FORM_FIELDS: FormFieldRegistryEntry[] = [
	// Geometry types with specialized form handling
	{
		type: 'geometry',
		component: GeometryFormWrapper,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			if (value && typeof value === 'string') {
				try {
					JSON.parse(value);
				} catch {
					return 'Please enter valid geometry JSON';
				}
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (typeof value === 'string') return value;
			return JSON.stringify(value, null, 2);
		},
		parser: (input) => {
			try {
				return JSON.parse(input);
			} catch {
				return input;
			}
		},
		defaultValue: () => ({
			geojson: { type: 'Point', coordinates: [0, 0] },
			srid: 4326,
			x: 0,
			y: 0,
		}),
		metadata: {
			name: 'Geometry',
			description: 'Geographic shapes and coordinates',
			category: 'geometric',
			inputType: 'textarea',
			multiline: true,
			rows: 6,
			supportsValidation: true,
			width: 'full',
		},
	},

	{
		type: 'geometry-point',
		component: GeometryFormWrapper,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (typeof value === 'object' && value !== null && 'x' in value && 'y' in value) {
				return `Point(${value.x}, ${value.y})`;
			}
			return JSON.stringify(value, null, 2);
		},
		parser: (input) => {
			try {
				return JSON.parse(input);
			} catch {
				return input;
			}
		},
		defaultValue: () => ({
			geojson: { type: 'Point', coordinates: [0, 0] },
			srid: 4326,
			x: 0,
			y: 0,
		}),
		metadata: {
			name: 'Geometry Point',
			description: 'Geographic point with X/Y coordinates',
			category: 'geometric',
			inputType: 'textarea',
			multiline: true,
			rows: 4,
			supportsValidation: true,
			width: 'full',
		},
	},

	{
		type: 'geometry-collection',
		component: GeometryFormWrapper,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (typeof value === 'string') return value;
			return JSON.stringify(value, null, 2);
		},
		parser: (input) => {
			try {
				return JSON.parse(input);
			} catch {
				return input;
			}
		},
		defaultValue: () => ({
			geojson: { type: 'GeometryCollection', geometries: [] },
			srid: 4326,
			x: 0,
			y: 0,
		}),
		metadata: {
			name: 'Geometry Collection',
			description: 'Collection of geometric shapes',
			category: 'geometric',
			inputType: 'textarea',
			multiline: true,
			rows: 6,
			supportsValidation: true,
			width: 'full',
		},
	},

	// Relation type with specialized handling
	{
		type: 'relation',
		component: RelationFormWrapper,
		validator: (value, validation) => {
			if (validation?.required && (!value || value === '')) {
				return 'This field is required';
			}
			return undefined;
		},
		formatter: (value) => {
			if (value === null || value === undefined) return '';
			if (Array.isArray(value)) return `${value.length} related records`;
			if (typeof value === 'object') return 'Related record';
			return String(value);
		},
		parser: (input) => {
			try {
				return JSON.parse(input);
			} catch {
				return input;
			}
		},
		defaultValue: () => null,
		metadata: {
			name: 'Relation',
			description: 'Related table records (read-only in forms)',
			category: 'special',
			supportsValidation: true,
			width: 'full',
		},
	},
];

/**
 * Get all available form field entries with complete coverage
 */
export function getAllFormFields(): FormFieldRegistryEntry[] {
	const allFields: FormFieldRegistryEntry[] = [];
	const seenTypes = new Set<CellType>();

	// 1. Add manually crafted default form fields (highest priority)
	for (const field of DEFAULT_FORM_FIELDS) {
		allFields.push(field);
		seenTypes.add(field.type);
	}

	// 2. Add advanced form fields (override defaults where they exist)
	for (const field of ADVANCED_FORM_FIELDS) {
		// Replace default with advanced version
		const existingIndex = allFields.findIndex((f) => f.type === field.type);
		if (existingIndex >= 0) {
			allFields[existingIndex] = field;
		} else {
			allFields.push(field);
			seenTypes.add(field.type);
		}
	}

	// 3. Add specialized form fields (override any existing versions)
	for (const field of SPECIALIZED_FORM_FIELDS) {
		const existingIndex = allFields.findIndex((f) => f.type === field.type);
		if (existingIndex >= 0) {
			allFields[existingIndex] = field;
		} else {
			allFields.push(field);
			seenTypes.add(field.type);
		}
	}

	// 4. Generate form fields from cell registry for any missing types
	const bridgeFields = CellToFormBridge.generateFormFieldsFromCells();
	for (const field of bridgeFields) {
		if (!seenTypes.has(field.type)) {
			allFields.push(field);
			seenTypes.add(field.type);
		}
	}

	return allFields;
}

/**
 * Get form field entries organized by category
 */
export function getFormFieldsByCategory(): Record<string, FormFieldRegistryEntry[]> {
	const allFields = getAllFormFields();
	const categories: Record<string, FormFieldRegistryEntry[]> = {};

	for (const field of allFields) {
		const category = field.metadata?.category || 'other';
		if (!categories[category]) {
			categories[category] = [];
		}
		categories[category].push(field);
	}

	// Sort categories by logical order
	const orderedCategories = [
		'text',
		'numeric',
		'date',
		'boolean',
		'structured',
		'geometric',
		'network',
		'media',
		'special',
		'other',
	];
	const sortedCategories: Record<string, FormFieldRegistryEntry[]> = {};

	for (const category of orderedCategories) {
		if (categories[category]) {
			sortedCategories[category] = categories[category].sort((a, b) =>
				(a.metadata?.name || a.type).localeCompare(b.metadata?.name || b.type),
			);
		}
	}

	return sortedCategories;
}

/**
 * Get statistics about form field coverage
 */
export function getFormFieldCoverageStats(): {
	totalCellTypes: number;
	coveredTypes: number;
	missingTypes: CellType[];
	coveragePercentage: number;
	fieldsBySource: {
		manual: number;
		advanced: number;
		specialized: number;
		bridged: number;
	};
} {
	const allCellTypes = CellRegistry.getAll().map((entry) => entry.type);
	const allFormFields = getAllFormFields();
	const coveredTypes = new Set(allFormFields.map((f) => f.type));
	const missingTypes = allCellTypes.filter((type) => !coveredTypes.has(type));

	// Count fields by source
	const manualCount = DEFAULT_FORM_FIELDS.length;
	const advancedCount = ADVANCED_FORM_FIELDS.length;
	const specializedCount = SPECIALIZED_FORM_FIELDS.length;
	const bridgedCount =
		allFormFields.length -
		manualCount -
		advancedCount -
		specializedCount +
		// Account for overlaps
		ADVANCED_FORM_FIELDS.filter((f) => DEFAULT_FORM_FIELDS.some((df) => df.type === f.type)).length +
		SPECIALIZED_FORM_FIELDS.filter((f) =>
			[...DEFAULT_FORM_FIELDS, ...ADVANCED_FORM_FIELDS].some((df) => df.type === f.type),
		).length;

	return {
		totalCellTypes: allCellTypes.length,
		coveredTypes: coveredTypes.size,
		missingTypes,
		// When there are no cell types, coverage is 100% (nothing to cover)
		coveragePercentage: allCellTypes.length === 0 ? 100 : Math.round((coveredTypes.size / allCellTypes.length) * 100),
		fieldsBySource: {
			manual: manualCount,
			advanced: advancedCount,
			specialized: specializedCount,
			bridged: Math.max(0, bridgedCount),
		},
	};
}

/**
 * Validate that all cell types have corresponding form fields
 */
export function validateFormFieldCoverage(): {
	isComplete: boolean;
	missingTypes: CellType[];
	errors: string[];
} {
	const stats = getFormFieldCoverageStats();
	const errors: string[] = [];

	if (stats.missingTypes.length > 0) {
		errors.push(`Missing form fields for types: ${stats.missingTypes.join(', ')}`);
	}

	if (stats.coveragePercentage < 100) {
		errors.push(`Form field coverage is ${stats.coveragePercentage}%, should be 100%`);
	}

	return {
		isComplete: stats.missingTypes.length === 0,
		missingTypes: stats.missingTypes,
		errors,
	};
}

export const COMPLETE_FORM_FIELDS = getAllFormFields();
