import type { FieldDefinition } from '@/lib/schema';

import { parseOrCreateSchema } from './migration';
import { createEmptySchema } from './node-factory';
import type { UISchema } from './types';
import { isUISchema } from './types';

const CONFIG_KEY = 'formBuilderConfig';

export function parseFromSmartTags(
	smartTags: Record<string, unknown> | undefined | null,
	fields: FieldDefinition[],
	schemaId?: string,
): UISchema {
	if (!smartTags || typeof smartTags !== 'object') {
		return createEmptySchema(schemaId);
	}

	const config = smartTags[CONFIG_KEY];
	if (!config) {
		return createEmptySchema(schemaId);
	}

	return parseOrCreateSchema(config, fields, schemaId);
}

export function prepareForSmartTags(
	existingSmartTags: Record<string, unknown> | undefined | null,
	schema: UISchema,
): Record<string, unknown> {
	return {
		...(existingSmartTags || {}),
		[CONFIG_KEY]: schema,
	};
}

export function serializeSchema(schema: UISchema): string {
	return JSON.stringify(schema);
}

export function deserializeSchema(json: string, schemaId?: string): UISchema {
	try {
		const parsed = JSON.parse(json);
		if (isUISchema(parsed)) {
			return parsed;
		}
		return createEmptySchema(schemaId);
	} catch {
		return createEmptySchema(schemaId);
	}
}
