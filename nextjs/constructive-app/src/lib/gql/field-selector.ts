/**
 * Simplified field selection system
 * Replaces the complex field selection logic with a simple, intuitive API
 */
import type { SelectionOptions } from '@/lib/query-builder/types';

import type { CleanTable } from './data.types';

/**
 * Simplified field selection options
 */
export interface SimpleFieldSelection {
	/** Specific fields to include */
	select?: string[];
	/** Relations to include with their fields */
	include?: Record<string, string[] | boolean>;
	/** Specific relation fields to include (simple API) */
	includeRelations?: string[];
	/** Fields to exclude */
	exclude?: string[];
	/** Maximum depth for nested relations */
	maxDepth?: number;
}

/**
 * Predefined field selection presets
 */
export type FieldSelectionPreset =
	| 'minimal' // Just id and primary display field
	| 'display' // Common display fields (id, name, title, etc.)
	| 'all' // All scalar fields
	| 'full'; // All fields including relations

/**
 * Main field selection options - can be a preset or custom selection
 */
export type FieldSelection = FieldSelectionPreset | SimpleFieldSelection;

/**
 * Convert simplified field selection to QueryBuilder SelectionOptions
 */
export function convertToSelectionOptions(
	table: CleanTable,
	allTables: CleanTable[],
	selection?: FieldSelection,
): SelectionOptions | null {
	if (!selection) {
		return convertPresetToSelection(table, 'display');
	}

	if (typeof selection === 'string') {
		return convertPresetToSelection(table, selection);
	}

	return convertCustomSelectionToOptions(table, allTables, selection);
}

/**
 * Convert preset to selection options
 */
function convertPresetToSelection(table: CleanTable, preset: FieldSelectionPreset): SelectionOptions {
	const options: SelectionOptions = {};

	switch (preset) {
		case 'minimal':
			// Just id and first display field
			const minimalFields = getMinimalFields(table);
			minimalFields.forEach((field) => {
				options[field] = true;
			});
			break;

		case 'display':
			// Common display fields
			const displayFields = getDisplayFields(table);
			displayFields.forEach((field) => {
				options[field] = true;
			});
			break;

		case 'all':
			// All non-relational fields (includes complex fields like JSON, geometry, etc.)
			const allFields = getNonRelationalFields(table);
			allFields.forEach((field) => {
				options[field] = true;
			});
			break;

		case 'full':
			// All fields including basic relations
			table.fields.forEach((field) => {
				options[field.name] = true;
			});
			break;

		default:
			// Default to display
			const defaultFields = getDisplayFields(table);
			defaultFields.forEach((field) => {
				options[field] = true;
			});
	}

	return options;
}

/**
 * Convert custom selection to options
 */
function convertCustomSelectionToOptions(
	table: CleanTable,
	_allTables: CleanTable[], // Unused but kept for API compatibility
	selection: SimpleFieldSelection,
): SelectionOptions {
	const options: SelectionOptions = {};

	// Start with selected fields or all non-relational fields (including complex types)
	let fieldsToInclude: string[];

	if (selection.select) {
		fieldsToInclude = selection.select;
	} else {
		fieldsToInclude = getNonRelationalFields(table);
	}

	// Add basic fields
	fieldsToInclude.forEach((field) => {
		if (table.fields.some((f) => f.name === field)) {
			options[field] = true;
		}
	});

	// Handle includeRelations (simple API for relation fields)
	if (selection.includeRelations) {
		selection.includeRelations.forEach((relationField) => {
			if (isRelationalField(relationField, table)) {
				// Include with dynamically determined scalar fields from the related table
				options[relationField] = {
					select: getRelatedTableScalarFields(relationField, table, _allTables),
					variables: {},
				};
			}
		});
	}

	// Handle includes (relations) - more detailed API
	if (selection.include) {
		Object.entries(selection.include).forEach(([relationField, relationSelection]) => {
			if (isRelationalField(relationField, table)) {
				if (relationSelection === true) {
					// Include with dynamically determined scalar fields from the related table
					options[relationField] = {
						select: getRelatedTableScalarFields(relationField, table, _allTables),
						variables: {},
					};
				} else if (Array.isArray(relationSelection)) {
					// Include with specific fields
					const selectObj: Record<string, boolean> = {};
					relationSelection.forEach((field) => {
						selectObj[field] = true;
					});
					options[relationField] = {
						select: selectObj,
						variables: {},
					};
				}
			}
		});
	}

	// Handle excludes
	if (selection.exclude) {
		selection.exclude.forEach((field) => {
			delete options[field];
		});
	}

	return options;
}

/**
 * Get minimal fields - completely schema-driven, no hardcoded assumptions
 */
function getMinimalFields(table: CleanTable): string[] {
	// Get all non-relational fields from the actual schema
	const nonRelationalFields = getNonRelationalFields(table);

	// Return the first few fields from the schema (typically includes primary key and basic fields)
	// This is completely dynamic based on what the schema actually provides
	return nonRelationalFields.slice(0, 3); // Limit to first 3 fields for minimal selection
}

/**
 * Get display fields - completely schema-driven, no hardcoded field names
 */
function getDisplayFields(table: CleanTable): string[] {
	// Get all non-relational fields from the actual schema
	const nonRelationalFields = getNonRelationalFields(table);

	// Return a reasonable subset for display purposes (first half of available fields)
	// This is completely dynamic based on what the schema actually provides
	const maxDisplayFields = Math.max(5, Math.floor(nonRelationalFields.length / 2));
	return nonRelationalFields.slice(0, maxDisplayFields);
}

/**
 * Build a Set of all relational field names for O(1) lookup
 */
function getRelationalFieldSet(table: CleanTable): Set<string> {
	const { belongsTo, hasOne, hasMany, manyToMany } = table.relations;
	const fieldNames = new Set<string>();

	for (const rel of belongsTo) if (rel.fieldName) fieldNames.add(rel.fieldName);
	for (const rel of hasOne) if (rel.fieldName) fieldNames.add(rel.fieldName);
	for (const rel of hasMany) if (rel.fieldName) fieldNames.add(rel.fieldName);
	for (const rel of manyToMany) if (rel.fieldName) fieldNames.add(rel.fieldName);

	return fieldNames;
}

/**
 * Get all non-relational fields (includes both scalar and complex fields)
 * Complex fields like JSON, geometry, images should be included by default
 */
function getNonRelationalFields(table: CleanTable): string[] {
	const relationalFields = getRelationalFieldSet(table);
	const result: string[] = [];
	for (const field of table.fields) {
		if (!relationalFields.has(field.name)) {
			result.push(field.name);
		}
	}
	return result;
}

/**
 * Check if a field is relational using table metadata
 */
function isRelationalField(fieldName: string, table: CleanTable): boolean {
	return getRelationalFieldSet(table).has(fieldName);
}

/**
 * Get scalar fields for a related table to include in relation queries
 * Uses only the _meta query data - no hardcoded field names or assumptions
 */
function getRelatedTableScalarFields(
	relationField: string,
	table: CleanTable,
	allTables: CleanTable[],
): Record<string, boolean> {
	// Build lookup maps for O(1) access
	const { belongsTo, hasOne, hasMany, manyToMany } = table.relations;

	// Find the referenced table name with early exit
	let referencedTableName: string | undefined;

	for (const rel of belongsTo) {
		if (rel.fieldName === relationField) {
			referencedTableName = rel.referencesTable;
			break;
		}
	}
	if (!referencedTableName) {
		for (const rel of hasOne) {
			if (rel.fieldName === relationField) {
				referencedTableName = rel.referencedByTable;
				break;
			}
		}
	}
	if (!referencedTableName) {
		for (const rel of hasMany) {
			if (rel.fieldName === relationField) {
				referencedTableName = rel.referencedByTable;
				break;
			}
		}
	}
	if (!referencedTableName) {
		for (const rel of manyToMany) {
			if (rel.fieldName === relationField) {
				referencedTableName = rel.rightTable;
				break;
			}
		}
	}

	if (!referencedTableName) {
		return {};
	}

	// Find the related table in allTables
	const relatedTable = allTables.find((t) => t.name === referencedTableName);
	if (!relatedTable) {
		return {};
	}

	// Get scalar fields using Set for O(1) lookup
	const relationalFieldSet = getRelationalFieldSet(relatedTable);
	const scalarFieldSet = new Set<string>();
	for (const field of relatedTable.fields) {
		if (!relationalFieldSet.has(field.name)) {
			scalarFieldSet.add(field.name);
		}
	}

	// Perf guardrail: select a small, display-oriented subset.
	const MAX_RELATED_FIELDS = 8;
	const preferred = [
		'displayName',
		'fullName',
		'preferredName',
		'nickname',
		'firstName',
		'lastName',
		'username',
		'email',
		'name',
		'title',
		'label',
		'slug',
		'code',
		'createdAt',
		'updatedAt',
	];

	// Use Set for O(1) duplicate checking
	const includedSet = new Set<string>();
	const included: string[] = [];

	const push = (fieldName: string | undefined) => {
		if (!fieldName) return;
		if (!scalarFieldSet.has(fieldName)) return;
		if (includedSet.has(fieldName)) return;
		if (included.length >= MAX_RELATED_FIELDS) return;
		includedSet.add(fieldName);
		included.push(fieldName);
	};

	// Always try to include stable identifiers first.
	push('id');
	push('nodeId');

	for (const fieldName of preferred) push(fieldName);
	for (const fieldName of scalarFieldSet) push(fieldName);

	const selection: Record<string, boolean> = {};
	for (const fieldName of included) selection[fieldName] = true;
	return selection;
}

/**
 * Get all available relation fields from a table
 */
export function getAvailableRelations(table: CleanTable): Array<{
	fieldName: string;
	type: 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany';
	referencedTable?: string;
}> {
	const relations: Array<{
		fieldName: string;
		type: 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany';
		referencedTable?: string;
	}> = [];

	// Add belongsTo relations
	table.relations.belongsTo.forEach((rel) => {
		if (rel.fieldName) {
			relations.push({
				fieldName: rel.fieldName,
				type: 'belongsTo',
				referencedTable: rel.referencesTable || undefined,
			});
		}
	});

	// Add hasOne relations
	table.relations.hasOne.forEach((rel) => {
		if (rel.fieldName) {
			relations.push({
				fieldName: rel.fieldName,
				type: 'hasOne',
				referencedTable: rel.referencedByTable || undefined,
			});
		}
	});

	// Add hasMany relations
	table.relations.hasMany.forEach((rel) => {
		if (rel.fieldName) {
			relations.push({
				fieldName: rel.fieldName,
				type: 'hasMany',
				referencedTable: rel.referencedByTable || undefined,
			});
		}
	});

	// Add manyToMany relations
	table.relations.manyToMany.forEach((rel) => {
		if (rel.fieldName) {
			relations.push({
				fieldName: rel.fieldName,
				type: 'manyToMany',
				referencedTable: rel.rightTable || undefined,
			});
		}
	});

	return relations;
}

/**
 * Validate field selection against table schema
 */
export function validateFieldSelection(
	selection: FieldSelection,
	table: CleanTable,
): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (typeof selection === 'string') {
		// Presets are always valid
		return { isValid: true, errors: [] };
	}

	// Build Sets for O(1) lookups
	const tableFieldNameSet = new Set(table.fields.map((f) => f.name));
	const relationalFieldSet = getRelationalFieldSet(table);

	// Validate select fields
	if (selection.select) {
		for (const field of selection.select) {
			if (!tableFieldNameSet.has(field)) {
				errors.push(`Field '${field}' does not exist in table '${table.name}'`);
			}
		}
	}

	// Validate includeRelations fields
	if (selection.includeRelations) {
		for (const field of selection.includeRelations) {
			if (!relationalFieldSet.has(field)) {
				errors.push(`Field '${field}' is not a relational field in table '${table.name}'`);
			}
		}
	}

	// Validate include fields
	if (selection.include) {
		for (const field of Object.keys(selection.include)) {
			if (!relationalFieldSet.has(field)) {
				errors.push(`Field '${field}' is not a relational field in table '${table.name}'`);
			}
		}
	}

	// Validate exclude fields
	if (selection.exclude) {
		for (const field of selection.exclude) {
			if (!tableFieldNameSet.has(field)) {
				errors.push(`Exclude field '${field}' does not exist in table '${table.name}'`);
			}
		}
	}

	// Validate maxDepth
	if (selection.maxDepth !== undefined) {
		if (typeof selection.maxDepth !== 'number' || selection.maxDepth < 0 || selection.maxDepth > 5) {
			errors.push('maxDepth must be a number between 0 and 5');
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}
