import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { Ajv2020 } from 'ajv/dist/2020.js';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const schema = read(join(import.meta.dirname, '..', 'app-spec.schema.json'));
const foodBank = read(join(import.meta.dirname, '__fixtures__', 'food-bank', 'app-spec.json'));

// The desktop validates every plan against this file, with Ajv's strict defaults.
const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);

function firstError(spec: unknown): string {
	assert.equal(validate(spec), false, 'expected the spec to be rejected');
	const [error] = validate.errors ?? [];
	return `${error?.instancePath} ${error?.message}`;
}

describe('AppSpec schema', () => {
	it('accepts a custom backend with links, seed and ui, and a blueprint with resource names', () => {
		assert.ok(validate(foodBank), JSON.stringify(validate.errors));
		const blueprint = {
			version: 1,
			name: 'CRM',
			backend: { kind: 'blueprint', slug: 'agentic_crm' },
			ui: { nav: ['contacts', 'deal-stages'], resources: { contacts: { titleField: 'firstName' } } },
		};
		assert.ok(validate(blueprint), JSON.stringify(validate.errors));
	});

	it('accepts a blueprint extended with tables, columns, keys and links, with errors inside the extension', () => {
		const extend = {
			entities: [{ name: 'notes', fields: [{ name: 'body', type: 'long_text' }], belongsTo: [{ field: 'contact_id', to: 'contacts' }] }],
			fields: { contacts: [{ name: 'tier', type: 'text', enum: ['gold', 'silver'] }] },
			belongsTo: { deals: [{ field: 'owner_contact_id', to: 'contacts', onDelete: 'set_null' }] },
			links: [{ between: ['notes', 'deals'] }],
		};
		const spec = { version: 1, name: 'CRM', backend: { kind: 'blueprint', slug: 'agentic_crm', extend } };
		assert.ok(validate(spec), JSON.stringify(validate.errors));
		const badField = { ...spec, backend: { ...spec.backend, extend: { fields: { contacts: [{ name: 'tier', type: 'enum' }] } } } };
		assert.equal(firstError(badField), '/backend/extend/fields/contacts/0/type must be equal to one of the allowed values');
	});

	it('points the error at the field that is wrong, not at the other backend kind', () => {
		const withEntity = (entity: unknown) => ({ ...foodBank, backend: { kind: 'custom', entities: [entity] } });
		assert.equal(
			firstError(withEntity({ name: 'Shifts', fields: [{ name: 'a', type: 'text' }] })),
			'/backend/entities/0/name must match pattern "^[a-z][a-z0-9_]*$"',
		);
		assert.equal(
			firstError(withEntity({ name: 'shifts', fields: [{ name: 'a', type: 'string' }] })),
			'/backend/entities/0/fields/0/type must be equal to one of the allowed values',
		);
		assert.match(firstError({ ...foodBank, ui: { dashboard: { tiles: [{ kind: 'recent', resource: 'shifts', limit: 99 }] } } }), /^\/ui\/dashboard\/tiles\/0\/limit /);
	});
});
