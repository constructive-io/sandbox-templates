// What the API's filter inputs accept, read from the generated SDK.
//
// `_meta` can't say which columns the filter plugin exposes: a domain type
// such as `email` is left out of `<Type>Filter`, and a search that names it
// fails as a whole. When codegen has run, its input types list each filter's
// fields, so search fields and dashboard filters are narrowed to those.

import type { AppModel } from './app-spec.ts';

/** Filter type name → field name → the field's filter input type (e.g. `StringFilter`). */
export type FilterFields = Map<string, Map<string, string>>;

const INTERFACE = /export interface (\w+Filter) \{\n([\s\S]*?)\n\}/g;
const FIELD = /^\s*(\w+)\?: (\w+)(\[\])?;/gm;

export function parseFilterFields(inputTypes: string): FilterFields {
	const filters: FilterFields = new Map();
	for (const [, name, body] of inputTypes.matchAll(INTERFACE)) {
		if (filters.has(name)) continue;
		const fields = new Map<string, string>();
		for (const [, field, type] of body.matchAll(FIELD)) fields.set(field, type);
		filters.set(name, fields);
	}
	return filters;
}

// Filter inputs with the case-insensitive `includesInsensitive` operator search uses.
const TEXT_FILTERS = new Set(['StringFilter', 'StringTrgmFilter']);

/** Narrows search fields and dashboard filters to what the API accepts. */
export function applyFilterFields(model: AppModel, filters: FilterFields) {
	for (const ir of model.resources) {
		const fields = filters.get(ir.filterType);
		if (!fields) continue;
		const dropped = ir.searchFields.filter((name) => !TEXT_FILTERS.has(fields.get(name) ?? ''));
		if (dropped.length) {
			ir.searchFields = ir.searchFields.filter((name) => !dropped.includes(name));
			model.warnings.push(`${ir.name}: ${dropped.join(', ')} can't be searched (not in ${ir.filterType}).`);
		}
	}
	for (const tile of model.dashboard) {
		if (tile.kind !== 'count' || !tile.filters) continue;
		const ir = model.resources.find((resource) => resource.name === tile.resource);
		const fields = ir && filters.get(ir.filterType);
		if (!fields) continue;
		for (const key of Object.keys(tile.filters)) {
			if (fields.has(key)) continue;
			delete tile.filters[key];
			model.warnings.push(`Dashboard tile "${tile.label}": ${key} can't be filtered (not in ${ir.filterType}).`);
		}
		if (!Object.keys(tile.filters).length) delete tile.filters;
	}
}
