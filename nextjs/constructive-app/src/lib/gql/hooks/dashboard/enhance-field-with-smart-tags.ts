/**
 * Utility to enhance field metadata with smartTags.
 *
 * This is the core function that merges smartTags.pgAlias into the field type,
 * fixing the Upload type rendering issue where _meta returns pgAlias="text"
 * but smartTags contains pgAlias="upload".
 */

import type { MetaField } from '@/lib/dynamic-form';
import type { FieldSmartTagsMap } from '@/lib/gql/hooks/schema-builder/use-field-smart-tags';
import { extractPgAliasFromSmartTags } from '@/lib/gql/hooks/schema-builder/use-field-smart-tags';

/**
 * Convert camelCase to snake_case.
 * Used to normalize field names between _meta (camelCase) and schema-builder (snake_case).
 */
function camelToSnake(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Enhances a single field's type info with smartTags.pgAlias if available.
 *
 * Priority:
 * 1. smartTags.pgAlias (from schema-builder, most specific)
 * 2. Original field.type.pgAlias (from _meta PostgreSQL introspection)
 *
 * @param field - The field metadata from _meta query
 * @param smartTags - Optional smartTags object for this field
 * @returns Enhanced field with updated pgAlias if smartTags override exists
 */
export function enhanceFieldWithSmartTags(
	field: MetaField,
	smartTags?: Record<string, unknown> | null,
): MetaField {
	if (!field || !smartTags) return field;

	const smartTagsPgAlias = extractPgAliasFromSmartTags(smartTags);
	if (!smartTagsPgAlias) return field;

	// Only override if different from existing pgAlias
	if (field.type?.pgAlias === smartTagsPgAlias) return field;

	// Create enhanced field with updated pgAlias
	return {
		...field,
		type: {
			...field.type,
			pgAlias: smartTagsPgAlias,
		},
	} as MetaField;
}

/**
 * Builds an enhanced fieldMetaMap by merging smartTags from schema-builder.
 *
 * @param fields - Array of field metadata from _meta query
 * @param tableName - Name of the table (for smartTags lookup)
 * @param smartTagsMap - SmartTags map from useFieldSmartTags hook
 * @returns Map of fieldName -> enhanced MetaField
 */
export function buildEnhancedFieldMetaMap(
	fields: MetaField[],
	tableName: string,
	smartTagsMap: FieldSmartTagsMap | null,
): Map<string, MetaField> {
	const map = new Map<string, MetaField>();

	if (!fields || fields.length === 0) return map;

	const tableSmartTags = smartTagsMap?.byTable.get(tableName);

	for (const field of fields) {
		if (!field?.name) continue;

		// _meta returns camelCase field names, schema-builder uses snake_case
		// Try both formats to find smartTags
		const snakeCaseName = camelToSnake(field.name);
		const fieldSmartTags = tableSmartTags?.get(field.name) ?? tableSmartTags?.get(snakeCaseName);
		const enhancedField = enhanceFieldWithSmartTags(field, fieldSmartTags ?? null);
		map.set(field.name, enhancedField);
	}

	return map;
}
