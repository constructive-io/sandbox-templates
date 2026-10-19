import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AppModel } from '../app-spec.ts';
import type { ResourceIR } from '../meta-ir.ts';
import { applyFilterFields, parseFilterFields } from '../sdk-filters.ts';

// As codegen writes it for a table whose `email` column is an email domain:
// the filter plugin leaves that column out.
const INPUT_TYPES = `
export interface StringFilter {
  includesInsensitive?: string;
}
export interface VolunteerFilter {
  /** Filter by the object’s \`fullName\` field. */
  fullName?: StringFilter;
  /** Filter by the object’s \`phone\` field. */
  phone?: StringFilter;
  /** Filter by the object’s \`isActive\` field. */
  isActive?: BooleanFilter;
  /** Checks for any expressions in this list. */
  or?: VolunteerFilter[];
}
`;

function model(): AppModel {
	const volunteers = {
		name: 'volunteers',
		filterType: 'VolunteerFilter',
		searchFields: ['fullName', 'email', 'phone'],
	} as ResourceIR;
	return {
		app: { name: 'Food bank' },
		resources: [volunteers],
		nav: ['volunteers'],
		dashboard: [{ kind: 'count', resource: 'volunteers', label: 'Active', filters: { isActive: true, email: 'x' } }],
		junctions: [],
		skipped: [],
		warnings: [],
	};
}

describe('narrowing to the generated filter inputs', () => {
	it('drops search fields and tile filters the API filter does not accept, with a warning', () => {
		const app = model();
		applyFilterFields(app, parseFilterFields(INPUT_TYPES));
		assert.deepEqual(app.resources[0].searchFields, ['fullName', 'phone']);
		assert.deepEqual(app.dashboard[0], { kind: 'count', resource: 'volunteers', label: 'Active', filters: { isActive: true } });
		assert.equal(app.warnings.length, 2);
	});

	it('leaves a resource alone when the SDK has no filter type for it', () => {
		const app = model();
		applyFilterFields(app, parseFilterFields('export interface OtherFilter {\n  a?: StringFilter;\n}'));
		assert.deepEqual(app.resources[0].searchFields, ['fullName', 'email', 'phone']);
	});
});
