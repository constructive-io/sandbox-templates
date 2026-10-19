// AppSpec v1 types and the overlay that applies a spec to the `_meta` model.
// `app-spec.schema.json` is the source of truth for the shape; the desktop
// validates specs against it before they reach the generator.

import { finishLayout, toneFor, type FieldInput, type FieldIR, type MetaModel, type ResourceIR } from './meta-ir.ts';
import { humanize, kebabCase, normalizeKey } from './names.ts';

export type SpecFieldType =
	| 'text'
	| 'long_text'
	| 'integer'
	| 'decimal'
	| 'money'
	| 'boolean'
	| 'date'
	| 'timestamp'
	| 'email'
	| 'url'
	| 'uuid'
	| 'json';

export type SpecField = {
	name: string;
	type: SpecFieldType;
	required?: boolean;
	default?: unknown;
	enum?: string[];
	label?: string;
};

export type SpecBelongsTo = { field: string; to: string; onDelete?: 'cascade' | 'set_null' | 'restrict'; label?: string };

export type SpecEntity = {
	name: string;
	label?: string;
	access?: 'shared' | 'private';
	fields: SpecField[];
	belongsTo?: SpecBelongsTo[];
};

export type SpecLink = { name?: string; between: [string, string] };

/** Additions to a curated blueprint: new tables, new columns and keys on its tables, new links. */
export type BackendExtend = {
	entities?: SpecEntity[];
	fields?: Record<string, SpecField[]>;
	belongsTo?: Record<string, SpecBelongsTo[]>;
	links?: SpecLink[];
};

export type FilterValue = string | number | boolean | null;

export type DashboardTileSpec =
	| { kind: 'count'; resource: string; label?: string; filters?: Record<string, FilterValue> }
	| { kind: 'recent'; resource: string; limit?: number; label?: string };

/** The signed-in user's id, filled in by the app on create. */
export const CURRENT_USER_ID = '$currentUserId';

export type FieldUiSpec = {
	label?: string;
	/** Help text under the input. */
	description?: string;
	/** Allowed values; the field becomes a select. */
	options?: string[];
	hidden?: boolean;
	input?: FieldInput;
	/** Overrides `_meta`, e.g. false for a column a trigger fills. */
	required?: boolean;
	/** `$currentUserId` or a literal sent on create when the form has none. */
	default?: FilterValue;
};

export type ResourceUiSpec = {
	label?: string;
	singular?: string;
	icon?: string;
	titleField?: string;
	columns?: string[];
	formFields?: string[];
	hidden?: boolean;
	fields?: Record<string, FieldUiSpec>;
};

export type AppSpec = {
	version: 1;
	name: string;
	tagline?: string;
	backend:
		| { kind: 'blueprint'; slug: string; extend?: BackendExtend }
		| { kind: 'custom'; entities: SpecEntity[]; links?: SpecLink[] };
	seed?: Record<string, Array<Record<string, unknown>>>;
	ui?: {
		nav?: string[];
		resources?: Record<string, ResourceUiSpec>;
		dashboard?: { tiles: DashboardTileSpec[] };
	};
};

export type DashboardTile =
	| { kind: 'count'; resource: string; label: string; filters?: Record<string, FilterValue> }
	| { kind: 'recent'; resource: string; label: string; limit: number };

export type AppModel = {
	app: { name: string; tagline?: string };
	/** Registry order: nav resources first, in nav order. */
	resources: ResourceIR[];
	nav: string[];
	dashboard: DashboardTile[];
	junctions: MetaModel['junctions'];
	skipped: MetaModel['skipped'];
	warnings: string[];
};

export type ApplySpecOptions = {
	/** True when a lucide icon with this kebab-case name exists. Unchecked when omitted. */
	iconExists?: (kebabName: string) => boolean;
};

export const DEFAULT_APP_NAME = 'App';
export const DEFAULT_ICON = 'table-2';
const DEFAULT_RECENT_LIMIT = 5;

/** Rejects anything that is not an AppSpec v1 object; the full check is the JSON Schema. */
export function assertAppSpec(value: unknown): asserts value is AppSpec {
	const spec = value as Partial<AppSpec> | null;
	if (!spec || typeof spec !== 'object') throw new Error('The AppSpec must be a JSON object.');
	if (spec.version !== 1) throw new Error(`Unsupported AppSpec version ${String(spec.version)} (expected 1).`);
	if (typeof spec.name !== 'string' || !spec.name.trim()) throw new Error('The AppSpec needs a name.');
}

export function applySpec(model: MetaModel, spec?: AppSpec, options: ApplySpecOptions = {}): AppModel {
	const warnings: string[] = [];
	const resources = model.resources;
	const findResource = (key: string) =>
		resources.find((ir) =>
			[ir.name, ir.queryAll, ir.table, ir.typeName].some((name) => normalizeKey(name) === normalizeKey(key)),
		);
	const findField = (ir: ResourceIR, key: string) =>
		ir.fields.find(
			(field) =>
				normalizeKey(field.name) === normalizeKey(key) ||
				(field.columnName !== undefined && normalizeKey(field.columnName) === normalizeKey(key)),
		) ??
		// A spec names foreign keys by column (`location_id`); a many-to-many field by target (`volunteers`).
		ir.fields.find((field) => normalizeKey(field.name) === normalizeKey(`${key}Id`));

	const refineTable = (ir: ResourceIR, fields: SpecField[], belongsTo: SpecBelongsTo[]) => {
		for (const fieldSpec of fields) {
			const field = findField(ir, fieldSpec.name);
			if (field) refineField(field, fieldSpec);
		}
		for (const link of belongsTo) {
			const field = findField(ir, link.field);
			if (field && link.label) field.label = link.label;
		}
	};
	const backend = spec?.backend;
	const extend = backend?.kind === 'blueprint' ? backend.extend : undefined;
	const entities = backend?.kind === 'custom' ? backend.entities : (extend?.entities ?? []);
	for (const entity of entities) {
		const ir = findResource(entity.name);
		if (!ir) {
			warnings.push(`AppSpec entity "${entity.name}" is not in _meta.`);
			continue;
		}
		if (entity.label) ir.label = entity.label;
		refineTable(ir, entity.fields, entity.belongsTo ?? []);
	}
	// The blueprint's own tables keep its field shapes; `extend` refines only the columns it added.
	for (const table of new Set([...Object.keys(extend?.fields ?? {}), ...Object.keys(extend?.belongsTo ?? {})])) {
		const ir = findResource(table);
		if (ir) refineTable(ir, extend?.fields?.[table] ?? [], extend?.belongsTo?.[table] ?? []);
		else warnings.push(`backend.extend names table "${table}", which is not in _meta.`);
	}

	const keep = new Map<ResourceIR, { titleField?: boolean; columns?: boolean; formFields?: boolean }>();
	for (const [key, ui] of Object.entries(spec?.ui?.resources ?? {})) {
		const ir = findResource(key);
		if (!ir) {
			warnings.push(`ui.resources."${key}" matches no table.`);
			continue;
		}
		const flags: { titleField?: boolean; columns?: boolean; formFields?: boolean } = {};
		for (const [name, hints] of Object.entries(ui.fields ?? {})) {
			const field = findField(ir, name);
			if (field) applyFieldHints(ir, field, hints);
			else warnings.push(`ui.resources."${key}".fields names unknown field "${name}".`);
		}
		if (ui.label) ir.label = ui.label;
		if (ui.singular) ir.singular = ui.singular;
		if (ui.icon) ir.icon = ui.icon;
		if (ui.hidden !== undefined) ir.inNav = !ui.hidden;
		if (ui.titleField) {
			const field = findField(ir, ui.titleField);
			if (field) {
				ir.titleField = field.name;
				flags.titleField = true;
			} else warnings.push(`ui.resources."${key}".titleField "${ui.titleField}" is not a field.`);
		}
		const pick = (names: string[] | undefined, what: string) => {
			if (!names) return undefined;
			const picked: string[] = [];
			for (const name of names) {
				const field = findField(ir, name);
				if (field && !field.hidden && !picked.includes(field.name)) picked.push(field.name);
				else if (!field) warnings.push(`ui.resources."${key}".${what} names unknown field "${name}".`);
			}
			return picked.length ? picked : undefined;
		};
		const columns = pick(ui.columns, 'columns');
		if (columns) {
			ir.columns = columns;
			flags.columns = true;
		}
		const formFields = pick(ui.formFields, 'formFields')?.filter(
			(name) => !ir.fields.find((field) => field.name === name)?.readOnly,
		);
		if (formFields?.length) {
			// Required fields can't be left out of the form, or create always fails.
			const required = ir.fields.filter((f) => f.required && !f.hidden && !formFields.includes(f.name));
			ir.formFields = [...formFields, ...required.map((f) => f.name)];
			flags.formFields = true;
		}
		keep.set(ir, flags);
	}
	for (const ir of resources) {
		const flags = keep.get(ir) ?? {};
		finishLayout(ir, flags);
		// Kept lists come from the spec, which may name a field a hint has since hidden.
		const shown = (name: string) => !ir.fields.find((field) => field.name === name)?.hidden;
		ir.columns = ir.columns.filter(shown);
		ir.formFields = ir.formFields.filter(shown);
		ir.icon = resolveIcon(ir.icon, options, warnings, ir.name);
	}

	const navResources = resources.filter((ir) => ir.inNav);
	const ordered: ResourceIR[] = [];
	for (const key of spec?.ui?.nav ?? []) {
		const ir = findResource(key);
		if (!ir) warnings.push(`ui.nav names unknown resource "${key}".`);
		else if (!ordered.includes(ir) && ir.inNav) ordered.push(ir);
	}
	for (const ir of navResources) if (!ordered.includes(ir)) ordered.push(ir);
	const registry = [...ordered, ...resources.filter((ir) => !ordered.includes(ir))];

	return {
		app: {
			name: spec?.name?.trim() || DEFAULT_APP_NAME,
			...(spec?.tagline ? { tagline: spec.tagline } : {}),
		},
		resources: registry,
		nav: ordered.map((ir) => ir.name),
		dashboard: buildDashboard(spec, ordered, findResource, findField, warnings),
		junctions: model.junctions,
		skipped: model.skipped,
		warnings,
	};
}

function setOptions(field: FieldIR, values: string[]) {
	field.input = 'select';
	field.format = 'badge';
	const tones = new Map((field.options ?? []).map((option) => [option.value, option.tone]));
	field.options = values.map((value) => ({ value, label: humanize(value), tone: tones.get(value) ?? toneFor(value) }));
}

/** Per-field hints from `ui.resources.<table>.fields`: they override everything `_meta` said. */
function applyFieldHints(ir: ResourceIR, field: FieldIR, hints: FieldUiSpec) {
	if (hints.label) field.label = hints.label;
	if (hints.description) field.description = hints.description;
	if (hints.input) field.input = hints.input;
	if (hints.options?.length) setOptions(field, hints.options);
	if (hints.hidden !== undefined) field.hidden = hints.hidden;
	const userKey = ir.userKeys.includes(field.name);
	if (hints.required !== undefined) {
		field.required = hints.required && !field.hidden;
		if (!hints.required && userKey) ir.userKeys = ir.userKeys.filter((name) => name !== field.name);
	}
	if (hints.default === CURRENT_USER_ID) {
		field.hidden = true;
		field.required = false;
		if (!ir.userKeys.includes(field.name)) ir.userKeys.push(field.name);
		delete ir.createDefaults[field.name];
	} else if (hints.default !== undefined) {
		field.required = false;
		ir.createDefaults[field.name] = hints.default;
		ir.userKeys = ir.userKeys.filter((name) => name !== field.name);
	}
}

function refineField(field: FieldIR, spec: SpecField) {
	if (spec.label) field.label = spec.label;
	if (field.input === 'relation' || field.hidden) return;
	if (spec.enum?.length && (field.input === 'text' || field.input === 'select')) {
		setOptions(field, spec.enum);
		return;
	}
	if (spec.type === 'long_text' && field.input === 'text') field.input = 'textarea';
	else if (spec.type === 'email' && field.input === 'text') field.input = 'email';
	else if (spec.type === 'url' && field.input === 'text') field.input = 'url';
	else if (spec.type === 'money' && (field.input === 'number' || field.input === 'integer')) {
		field.input = 'currency';
		field.format = 'currency';
	}
}

function resolveIcon(icon: string | undefined, options: ApplySpecOptions, warnings: string[], resource: string) {
	if (!icon) return DEFAULT_ICON;
	const name = kebabCase(icon);
	if (options.iconExists && !options.iconExists(name)) {
		warnings.push(`Icon "${icon}" for ${resource} is not a lucide icon; using "${DEFAULT_ICON}".`);
		return DEFAULT_ICON;
	}
	return name;
}

function buildDashboard(
	spec: AppSpec | undefined,
	nav: ResourceIR[],
	findResource: (key: string) => ResourceIR | undefined,
	findField: (ir: ResourceIR, key: string) => FieldIR | undefined,
	warnings: string[],
): DashboardTile[] {
	const tiles = spec?.ui?.dashboard?.tiles;
	if (!tiles) {
		const defaults: DashboardTile[] = nav.map((ir) => ({ kind: 'count', resource: ir.name, label: ir.label }));
		if (nav[0]) {
			defaults.push({
				kind: 'recent',
				resource: nav[0].name,
				label: `Recent ${nav[0].label.toLowerCase()}`,
				limit: DEFAULT_RECENT_LIMIT,
			});
		}
		return defaults;
	}
	const result: DashboardTile[] = [];
	for (const tile of tiles) {
		const ir = findResource(tile.resource);
		if (!ir) {
			warnings.push(`Dashboard tile names unknown resource "${tile.resource}".`);
			continue;
		}
		if (tile.kind === 'recent') {
			result.push({
				kind: 'recent',
				resource: ir.name,
				label: tile.label ?? `Recent ${ir.label.toLowerCase()}`,
				limit: tile.limit ?? DEFAULT_RECENT_LIMIT,
			});
			continue;
		}
		let filters: Record<string, FilterValue> | undefined;
		for (const [key, value] of Object.entries(tile.filters ?? {})) {
			const field = findField(ir, key);
			if (!field || !field.selectable) {
				warnings.push(`Dashboard tile filter "${key}" is not a field of ${ir.name}.`);
				continue;
			}
			filters = { ...filters, [field.name]: value };
		}
		result.push({ kind: 'count', resource: ir.name, label: tile.label ?? ir.label, ...(filters ? { filters } : {}) });
	}
	return result;
}
