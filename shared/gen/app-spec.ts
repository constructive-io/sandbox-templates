// The overlay that applies an AppSpec to the `_meta` model. The AppSpec types
// live in `app-spec.types.ts`; `app-spec.schema.json` is the source of truth
// for the shape, and the desktop validates specs against it before they reach
// the generator.

import {
	CURRENT_USER_ID,
	type AppSpec,
	type FieldUiSpec,
	type FilterValue,
	type SpecBelongsTo,
	type SpecField,
	type SpecLink,
} from './app-spec.types.ts';
import { finishLayout, toneFor, type FieldIR, type MetaModel, type ResourceIR } from './meta-ir.ts';
import { kebabCase, normalizeKey, optionLabels } from './names.ts';

export * from './app-spec.types.ts';

export type DashboardTile =
	| { kind: 'count'; resource: string; label: string; filters?: Record<string, FilterValue> }
	| { kind: 'recent'; resource: string; label: string; limit: number };

/** A name the AppSpec uses that `_meta` doesn't have: the spec and the live database disagree. */
export type SpecGap = {
	/** Where the name sits in the AppSpec, e.g. `backend.entities.shifts.fields` or `ui.resources.shifts.columns`. */
	path: string;
	name: string;
	message: string;
};

export type AppModel = {
	app: { name: string; tagline?: string };
	/** Registry order: nav resources first, in nav order. */
	resources: ResourceIR[];
	nav: string[];
	dashboard: DashboardTile[];
	junctions: MetaModel['junctions'];
	skipped: MetaModel['skipped'];
	/** Every gap is in `warnings` too. */
	gaps: SpecGap[];
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
	const gaps: SpecGap[] = [];
	const gap = (path: string, name: string, message: string) => {
		gaps.push({ path, name, message });
		warnings.push(message);
	};
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

	const refineTable = (
		ir: ResourceIR,
		fields: SpecField[],
		belongsTo: SpecBelongsTo[],
		paths: { fields: string; belongsTo: string },
	) => {
		for (const fieldSpec of fields) {
			const field = findField(ir, fieldSpec.name);
			if (field) refineField(field, fieldSpec, (message) => warnings.push(`${paths.fields}.${fieldSpec.name}: ${message}`));
			else gap(paths.fields, fieldSpec.name, `${paths.fields} names column "${fieldSpec.name}", which ${ir.table} doesn't have in _meta.`);
		}
		for (const link of belongsTo) {
			const field = findField(ir, link.field);
			if (!field) gap(paths.belongsTo, link.field, `${paths.belongsTo} names key "${link.field}", which ${ir.table} doesn't have in _meta.`);
			else if (link.label) field.label = link.label;
		}
	};
	const backend = spec?.backend;
	const extend = backend?.kind === 'blueprint' ? backend.extend : undefined;
	const entities = backend?.kind === 'custom' ? backend.entities : (extend?.entities ?? []);
	const entitiesPath = backend?.kind === 'custom' ? 'backend.entities' : 'backend.extend.entities';
	for (const entity of entities) {
		const ir = findResource(entity.name);
		if (!ir) {
			gap(entitiesPath, entity.name, `AppSpec entity "${entity.name}" is not in _meta.`);
			continue;
		}
		if (entity.label) ir.label = entity.label;
		const path = `${entitiesPath}.${entity.name}`;
		refineTable(ir, entity.fields, entity.belongsTo ?? [], { fields: `${path}.fields`, belongsTo: `${path}.belongsTo` });
	}
	// The blueprint's own tables keep its field shapes; `extend` refines only the columns it added.
	for (const table of new Set([...Object.keys(extend?.fields ?? {}), ...Object.keys(extend?.belongsTo ?? {})])) {
		const ir = findResource(table);
		if (ir) {
			refineTable(ir, extend?.fields?.[table] ?? [], extend?.belongsTo?.[table] ?? [], {
				fields: `backend.extend.fields.${table}`,
				belongsTo: `backend.extend.belongsTo.${table}`,
			});
		} else gap('backend.extend', table, `backend.extend names table "${table}", which is not in _meta.`);
	}
	const links = backend?.kind === 'custom' ? (backend.links ?? []) : (extend?.links ?? []);
	const linksPath = backend?.kind === 'custom' ? 'backend.links' : 'backend.extend.links';
	for (const link of links) {
		const missing = linkGap(link, model, findResource);
		if (missing) gap(linksPath, link.name ?? link.between.join(','), missing);
	}

	const keep = new Map<ResourceIR, { titleField?: boolean; columns?: boolean; formFields?: boolean }>();
	for (const [key, ui] of Object.entries(spec?.ui?.resources ?? {})) {
		const ir = findResource(key);
		if (!ir) {
			gap('ui.resources', key, `ui.resources."${key}" matches no table.`);
			continue;
		}
		const flags: { titleField?: boolean; columns?: boolean; formFields?: boolean } = {};
		for (const [name, hints] of Object.entries(ui.fields ?? {})) {
			const field = findField(ir, name);
			if (field) applyFieldHints(ir, field, hints, (message) => warnings.push(`ui.resources."${key}".fields.${name}: ${message}`));
			else gap(`ui.resources.${key}.fields`, name, `ui.resources."${key}".fields names unknown field "${name}".`);
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
			} else gap(`ui.resources.${key}.titleField`, ui.titleField, `ui.resources."${key}".titleField "${ui.titleField}" is not a field.`);
		}
		const pick = (names: string[] | undefined, what: string) => {
			if (!names) return undefined;
			const picked: string[] = [];
			for (const name of names) {
				const field = findField(ir, name);
				if (field && !field.hidden && !picked.includes(field.name)) picked.push(field.name);
				else if (!field) gap(`ui.resources.${key}.${what}`, name, `ui.resources."${key}".${what} names unknown field "${name}".`);
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
		if (!ir) gap('ui.nav', key, `ui.nav names unknown resource "${key}".`);
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
		dashboard: buildDashboard(spec, ordered, findResource, findField, { gap, warnings }),
		junctions: model.junctions,
		skipped: model.skipped,
		gaps,
		warnings,
	};
}

/** Why a link isn't in `_meta`: a side is missing, or no junction (or table named like the link) joins the two. */
function linkGap(
	link: SpecLink,
	model: MetaModel,
	findResource: (key: string) => ResourceIR | undefined,
): string | undefined {
	const label = link.name ? `AppSpec link "${link.name}"` : `AppSpec link between "${link.between[0]}" and "${link.between[1]}"`;
	const sides = link.between.map(findResource);
	const absent = link.between.filter((_, index) => !sides[index]);
	if (absent.length) {
		return `${label} names ${absent.map((name) => `"${name}"`).join(' and ')}, which ${absent.length === 1 ? 'is' : 'are'} not in _meta.`;
	}
	const names = sides.map((ir) => (ir as ResourceIR).name).sort();
	const joined = model.junctions.some((junction) => [...junction.between].sort().join() === names.join());
	if (joined || (link.name && findResource(link.name))) return undefined;
	return `${label} has no junction table in _meta.`;
}

function setOptions(field: FieldIR, values: string[]) {
	field.input = 'select';
	field.format = 'badge';
	const tones = new Map((field.options ?? []).map((option) => [option.value, option.tone]));
	const labels = optionLabels(values);
	field.options = values.map((value, i) => ({ value, label: labels[i], tone: tones.get(value) ?? toneFor(value) }));
}

const quoted = (values: string[]) => values.map((value) => `"${value}"`).join(', ');

/**
 * Per-field hints from `ui.resources.<table>.fields`: they override everything `_meta` said, except
 * the values a column allows. Options keep only those, in the hint's order.
 */
function applyFieldHints(ir: ResourceIR, field: FieldIR, hints: FieldUiSpec, warn: (message: string) => void) {
	if (hints.label) field.label = hints.label;
	if (hints.description) field.description = hints.description;
	if (hints.input) field.input = hints.input;
	if (hints.options?.length) {
		const allowed = field.metaValues;
		const kept = allowed?.length ? hints.options.filter((value) => allowed.includes(value)) : hints.options;
		if (allowed?.length && !kept.length) {
			setOptions(field, allowed);
			warn(`the database allows none of the options; using its values ${quoted(allowed)}.`);
		} else {
			setOptions(field, kept);
			const dropped = hints.options.filter((value) => !kept.includes(value));
			if (dropped.length) warn(`dropped the options ${quoted(dropped)}, which the database doesn't allow.`);
		}
	}
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

/**
 * A spec field's label and type refine the column. Its enum doesn't beat the live database: values
 * `_meta` serves win (in the spec's order when they are the same set), and when `_meta` says the
 * column allows any value, the enum is dropped. Only an endpoint that doesn't say keeps the enum.
 */
function refineField(field: FieldIR, spec: SpecField, warn: (message: string) => void) {
	if (spec.label) field.label = spec.label;
	if (field.input === 'relation' || field.hidden) return;
	if (spec.enum?.length && (field.input === 'text' || field.input === 'select')) {
		const live = field.metaValues;
		if (live === undefined) {
			setOptions(field, spec.enum);
			return;
		}
		if (live === null) {
			warn(`the enum ${quoted(spec.enum)} is ignored: the database allows any value.`);
		} else {
			const added = live.filter((value) => !spec.enum?.includes(value));
			const removed = spec.enum.filter((value) => !live.includes(value));
			if (added.length || removed.length) {
				const changes = [added.length && `added ${quoted(added)}`, removed.length && `removed ${quoted(removed)}`];
				warn(`the enum differs from the database (${changes.filter(Boolean).join('; ')}); using the database's values.`);
			} else setOptions(field, spec.enum);
			return;
		}
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
	report: { gap: (path: string, name: string, message: string) => void; warnings: string[] },
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
	for (const [index, tile] of tiles.entries()) {
		const ir = findResource(tile.resource);
		if (!ir) {
			report.gap('ui.dashboard.tiles', tile.resource, `Dashboard tile names unknown resource "${tile.resource}".`);
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
			if (!field) {
				report.gap(`ui.dashboard.tiles.${index}.filters`, key, `Dashboard tile filter "${key}" is not a field of ${ir.name}.`);
				continue;
			}
			if (!field.selectable) {
				report.warnings.push(`Dashboard tile filter "${key}" is not a column of ${ir.name}, so it can't filter.`);
				continue;
			}
			filters = { ...filters, [field.name]: value };
		}
		result.push({ kind: 'count', resource: ir.name, label: tile.label ?? ir.label, ...(filters ? { filters } : {}) });
	}
	return result;
}
