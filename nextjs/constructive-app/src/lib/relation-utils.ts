import type { CleanTable } from '@/lib/gql/data.types';

type PrimitiveId = string | number | null;

function extractPrimitiveId(candidate: unknown): PrimitiveId {
	if (candidate === null || candidate === undefined) return null;
	if (typeof candidate === 'string' || typeof candidate === 'number') {
		return candidate;
	}
	if (typeof candidate === 'object') {
		const record = candidate as Record<string, unknown>;
		const id = record.id;
		if (typeof id === 'string' || typeof id === 'number') {
			return id;
		}
	}
	return null;
}

export function normalizeForeignKeyValue(input: unknown): unknown {
	if (input === undefined) return undefined;
	if (input === null) return null;

	if (Array.isArray(input)) {
		return input.map((entry) => extractPrimitiveId(entry)).filter((entry): entry is PrimitiveId => entry !== undefined);
	}

	return extractPrimitiveId(input);
}

/**
 * Find the foreign key field in a related table that references the current table
 */
function findForeignKeyField(
	currentTableName: string,
	relatedTableName: string,
	allTables?: CleanTable[],
): string | undefined {
	if (!allTables) return undefined;

	// Find the related table
	const relatedTable = allTables.find((table) => table.name === relatedTableName);
	if (!relatedTable) return undefined;

	// Look for a belongsTo relation in the related table that references our current table
	const belongsToRelation = relatedTable.relations.belongsTo.find(
		(relation) => relation.referencesTable === currentTableName,
	);

	if (belongsToRelation && belongsToRelation.keys?.[0]?.name) {
		return belongsToRelation.keys[0].name;
	}

	return undefined;
}

export interface RelationshipInfo {
	relationType: 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany';
	relationField: string;
	relatedTableName: string;
	foreignKeyField?: string;
	junctionTableName?: string;
	junctionLeftKey?: string;
	junctionRightKey?: string;
}

/**
 * Extract relationship information from table metadata for a specific field
 * For hasMany/hasOne relations, we need to find the actual foreign key field in the related table
 */
export function getRelationshipInfo(
	currentTable: CleanTable,
	relationFieldName: string,
	allTables?: CleanTable[],
): RelationshipInfo | null {
	const { relations } = currentTable;

	// Check belongsTo relations
	const belongsToRelation = relations.belongsTo.find((rel) => rel.fieldName === relationFieldName);
	if (belongsToRelation) {
		// For belongsTo: get the foreign key field name from the keys array
		const foreignKeyField = belongsToRelation.keys?.[0]?.name;
		return {
			relationType: 'belongsTo',
			relationField: relationFieldName,
			relatedTableName: belongsToRelation.referencesTable,
			foreignKeyField: foreignKeyField,
		};
	}

	// Check hasOne relations
	const hasOneRelation = relations.hasOne.find((rel) => rel.fieldName === relationFieldName);
	if (hasOneRelation) {
		// For hasOne: find the foreign key field in the related table that references our current table
		const foreignKeyField = findForeignKeyField(currentTable.name, hasOneRelation.referencedByTable, allTables);
		return {
			relationType: 'hasOne',
			relationField: relationFieldName,
			relatedTableName: hasOneRelation.referencedByTable,
			foreignKeyField: foreignKeyField,
		};
	}

	// Check hasMany relations
	const hasManyRelation = relations.hasMany.find((rel) => rel.fieldName === relationFieldName);
	if (hasManyRelation) {
		// For hasMany: find the foreign key field in the related table that references our current table
		const foreignKeyField = findForeignKeyField(currentTable.name, hasManyRelation.referencedByTable, allTables);
		return {
			relationType: 'hasMany',
			relationField: relationFieldName,
			relatedTableName: hasManyRelation.referencedByTable,
			foreignKeyField: foreignKeyField,
		};
	}

	// Check manyToMany relations
	const manyToManyRelation = relations.manyToMany.find((rel) => rel.fieldName === relationFieldName);
	if (manyToManyRelation) {
		return {
			relationType: 'manyToMany',
			relationField: relationFieldName,
			relatedTableName: manyToManyRelation.rightTable,
			junctionTableName: manyToManyRelation.junctionTable,
			// Note: We need to determine the junction keys from the metadata
			// This is a simplified version - in practice, we might need more complex logic
			junctionLeftKey: 'leftId', // Placeholder - should be derived from metadata
			junctionRightKey: 'rightId', // Placeholder - should be derived from metadata
		};
	}

	return null;
}

/**
 * Get a display-friendly label from a record using common field patterns
 */
export function getRecordDisplayLabel(record: any): string {
	if (!record || typeof record !== 'object') {
		return String(record || '');
	}

	// Try common display field patterns
	const displayFields = ['name', 'title', 'label', 'displayName', 'fullName', 'email', 'username', 'description'];

	for (const field of displayFields) {
		if (record[field] != null && String(record[field]).trim()) {
			return String(record[field]);
		}
	}

	// Fallback to ID or first available field
	if (record.id != null) {
		return `Record ${record.id}`;
	}

	const keys = Object.keys(record);
	if (keys.length > 0) {
		const firstValue = record[keys[0]];
		if (firstValue != null) {
			return String(firstValue);
		}
	}

	return 'Unknown Record';
}

/**
 * Get record ID, handling different ID field patterns
 */
export function getRecordId(record: any): string {
	if (!record || typeof record !== 'object') {
		return String(record || '');
	}

	// Try common ID field patterns
	const idFields = ['id', 'uuid', '_id', 'pk'];

	for (const field of idFields) {
		if (record[field] != null) {
			return String(record[field]);
		}
	}

	// Fallback to first field value
	const keys = Object.keys(record);
	if (keys.length > 0) {
		return String(record[keys[0]] || '');
	}

	return '';
}
