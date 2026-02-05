import type { FieldDefinition } from '@/lib/schema';

import { createEmptySchema, createNodeFromField } from './node-factory';
import type { UISchema } from './types';
import { isUISchema } from './types';

export function parseOrCreateSchema(
	config: unknown,
	fields: FieldDefinition[],
	schemaId?: string,
): UISchema {
	if (isUISchema(config)) {
		return config;
	}

	const schema = createEmptySchema(schemaId);
	for (const field of fields) {
		schema.page.children.push(createNodeFromField(field));
	}
	return schema;
}
