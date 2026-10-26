// `_meta` → ResourceIR. Pure: no file system, no network, no framework.
//
// The rules (system fields, belongs-to relations, enums, junction tables,
// naming) are the generator's contract with the database. Every table and
// field name comes from the `_meta` document; nothing here knows a schema.

import type { FieldInput } from './app-spec.types.ts';
import { camelCase, humanize, kebabCase, lcFirst, normalizeKey, optionLabels } from './names.ts';

// ---------------------------------------------------------------------------
// `_meta` shapes: the subset of the live `_meta { tables }` contract we read.
// Newer fields are optional: when an endpoint serves them they win over the
// heuristics below, and when it doesn't, the heuristics decide.
// ---------------------------------------------------------------------------

export type MetaRef = { name: string };

export type MetaField = {
	name: string;
	/** snake_case column. */
	columnName?: string | null;
	isNotNull?: boolean | null;
	hasDefault?: boolean | null;
	isPrimaryKey?: boolean | null;
	isForeignKey?: boolean | null;
	description?: string | null;
	enumValues?: { name: string; values: string[] } | null;
	/** Values a check constraint allows (e.g. a status field). */
	allowedValues?: string[] | null;
	/** Whether a create must send it: false when a default or trigger fills it. */
	isRequiredOnCreate?: boolean | null;
	isWritableOnCreate?: boolean | null;
	isWritableOnUpdate?: boolean | null;
	type?: {
		gqlType: string;
		isArray: boolean;
		pgType: string;
		subtype?: string | null;
		isNotNull?: boolean;
		hasDefault?: boolean;
	} | null;
};

export type MetaBelongsTo = { fieldName: string; isUnique?: boolean; type?: string; keys: MetaRef[]; references: MetaRef };
export type MetaManyToMany = { fieldName: string; type?: string; junctionTable: MetaRef; rightTable: MetaRef };

export type MetaTable = {
	name: string;
	/** snake_case table. */
	tableName?: string | null;
	schemaName?: string;
	isJunction?: boolean | null;
	query?: {
		all: string;
		one?: string | null;
		create?: string | null;
		update?: string | null;
		delete?: string | null;
	} | null;
	inflection?: Record<string, string> | null;
	fields?: MetaField[] | null;
	relations?: {
		belongsTo?: MetaBelongsTo[] | null;
		manyToMany?: MetaManyToMany[] | null;
	} | null;
	constraints?: {
		primaryKey?: { name: string; fields: MetaRef[] } | null;
		foreignKey?: Array<{ name: string; fields: MetaRef[]; refTable: MetaRef; refFields?: MetaRef[] }> | null;
	} | null;
	storage?: { isFilesTable: boolean; isBucketsTable: boolean } | null;
	scope?: { keyColumn?: string | null } | null;
};

/** Accepts the `_meta` payload in any of the shapes tools save it in. */
export function parseMetaDocument(document: unknown): MetaTable[] {
	const doc = document as Record<string, unknown> | unknown[] | null;
	const candidates: unknown[] = [
		doc,
		(doc as { tables?: unknown })?.tables,
		(doc as { _meta?: { tables?: unknown } })?._meta?.tables,
		(doc as { data?: { _meta?: { tables?: unknown } } })?.data?._meta?.tables,
	];
	const tables = candidates.find((candidate) => Array.isArray(candidate)) as unknown[] | undefined;
	if (!tables) {
		throw new Error('The _meta document has no tables array (expected `{ _meta: { tables } }` or `tables[]`).');
	}
	return tables.filter((table): table is MetaTable => Boolean((table as MetaTable | null)?.name));
}

// ---------------------------------------------------------------------------
// IR
// ---------------------------------------------------------------------------

export type { FieldInput };

export type FieldFormat =
	| 'text'
	| 'number'
	| 'currency'
	| 'percent'
	| 'date'
	| 'datetime'
	| 'relative'
	| 'boolean'
	| 'badge';

export type OptionTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type FieldIR = {
	name: string;
	columnName?: string;
	label: string;
	input: FieldInput;
	format?: FieldFormat;
	required: boolean;
	readOnly: boolean;
	hidden: boolean;
	/** Help text under the input. Only the AppSpec sets it: `_meta` descriptions are schema comments, not UX copy. */
	description?: string;
	options?: { value: string; label: string; tone?: OptionTone }[];
	/**
	 * The values `_meta` allows (`allowedValues`, else `enumValues`). `null`: the endpoint serves
	 * `allowedValues` and the column has none, so any value goes. `undefined`: the endpoint doesn't
	 * serve `allowedValues`, so an AppSpec enum is all there is. The emitter doesn't read it.
	 */
	metaValues?: string[] | null;
	relation?: { resource: string; many?: boolean };
	/** GraphQL scalar the column is served as; `undefined` for many-to-many fields. */
	gqlType?: string;
	/**
	 * Whether the API's filter input has this field with text operators
	 * (includesInsensitive). Domain types such as `email` are left out of it.
	 */
	textFilter?: boolean;
	/** Selected from the ORM (false for many-to-many fields and unsupported scalars). */
	selectable: boolean;
};

export type ManyToManyIR = {
	field: string;
	target: string;
	junction: { table: string; model: string; primaryKey: string; sourceKey: string; targetKey: string };
};

export type ResourceIR = {
	/** `_meta` table name. */
	table: string;
	/** snake_case table, when `_meta` serves it. */
	tableName?: string;
	/** GraphQL type, from `inflection.tableType`. */
	typeName: string;
	/** Filter input type, from `inflection.filterType`. */
	filterType: string;
	/** ORM accessor on the generated client (`db.<model>`). */
	model: string;
	/** `query.all`. */
	queryAll: string;
	/** Route segment and registry id: kebab-case of `query.all`. */
	name: string;
	label: string;
	singular: string;
	icon?: string;
	primaryKey: string;
	titleField: string;
	fields: FieldIR[];
	columns: string[];
	formFields: string[];
	detailFields?: string[];
	searchFields: string[];
	defaultSort?: { field: string; direction: 'asc' | 'desc' };
	inNav: boolean;
	manyToMany: ManyToManyIR[];
	/** BigInt/BigFloat columns: strings on the wire, numbers in the UI. */
	bigNumbers: string[];
	/**
	 * Keys a create fills with the signed-in user's id (also their personal org).
	 * Decided, highest first, by the AppSpec hint `default: "$currentUserId"`
	 * (or `required: false` to opt out), then by `_meta` `isRequiredOnCreate`.
	 * Without either, the fallback is the contract's hidden system keys
	 * (`ownerId`, `entityId`, the scope's `keyColumn`) that are NOT NULL with
	 * no default.
	 */
	userKeys: string[];
	/** Writable on create only: left out of updates. */
	createOnly: string[];
	/**
	 * Columns with a database default. An empty form value is left out of a
	 * create, so the default applies instead of null.
	 */
	serverDefaults: string[];
	/** Of those, the NOT NULL ones: an empty value is left out of updates too. */
	keepWhenEmpty: string[];
	/** Values a create sends when the form has none. */
	createDefaults: Record<string, string | number | boolean | null>;
	operations: { create: boolean; update: boolean; delete: boolean };
};

export type SkippedTable = { table: string; reason: string };

export type MetaModel = {
	resources: ResourceIR[];
	junctions: Array<{ table: string; between: [string, string] }>;
	skipped: SkippedTable[];
};

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

// The contract's system fields, matched across camelCase and snake_case.
const HIDDEN_SYSTEM_KEYS = new Set(['id', 'ownerid', 'entityid']);
const READ_ONLY_SYSTEM_KEYS = new Set(['createdat', 'updatedat']);

// Generic vocabulary for choosing inputs and a title column. These are UX
// hints that apply to any schema, never a reference to a particular table.
const TITLE_NAMES = ['name', 'title', 'label', 'displayname', 'fullname', 'subject'];
const TITLE_FALLBACK_NAMES = ['username', 'email', 'code'];
// Fields that name a category rather than a row (a role, a status, a source); every row
// in a category would share the title. A field with fixed options is one too.
const LOW_INFORMATION_NAME = /(role|type|kind|status|state|source|mode|category|level|priority|stage|channel|format)$/i;
const LONG_TEXT_NAME = /(description|notes?|body|content|bio|summary|comments?|details|message|instructions)$/i;
const EMAIL_NAME = /email$/i;
const URL_NAME = /(url|website|homepage)$/i;

const TONE_WORDS: Array<[OptionTone, RegExp]> = [
	['success', /^(done|complete|completed|won|active|approved|paid|resolved|published|confirmed|delivered|fulfilled|available)$/],
	['danger', /^(lost|cancelled|canceled|failed|rejected|overdue|blocked|churned|inactive|declined|urgent|critical)$/],
	['warning', /^(pending|on_hold|hold|review|in_review|waiting|draft|late|paused|high|at_risk)$/],
	['info', /^(open|new|in_progress|scheduled|lead|planned|started|todo|proposal|negotiation|qualified|medium)$/],
];

export function toneFor(value: string): OptionTone {
	const key = value.toLowerCase().replace(/[\s-]+/g, '_');
	return TONE_WORDS.find(([, pattern]) => pattern.test(key))?.[0] ?? 'neutral';
}

type TableInfo = {
	meta: MetaTable;
	typeName: string;
	model: string;
	queryAll: string;
	name: string;
	primaryKey: string | null;
	kind: 'entity' | 'junction' | 'storage';
	systemHidden: Set<string>;
	systemReadOnly: Set<string>;
	foreignKeys: Array<{ key: string; target: TableInfo | undefined }>;
};

function primaryKeyOf(table: MetaTable): string | null {
	const constraintFields = table.constraints?.primaryKey?.fields ?? [];
	if (constraintFields.length === 1) return constraintFields[0].name;
	if (constraintFields.length > 1) return null;
	const flagged = (table.fields ?? []).filter((field) => field.isPrimaryKey);
	return flagged.length === 1 ? flagged[0].name : null;
}

function sqlNameOf(table: MetaTable): string | undefined {
	if (table.tableName) return table.tableName;
	const constraint = table.constraints?.primaryKey?.name;
	return constraint?.endsWith('_pkey') ? constraint.slice(0, -'_pkey'.length) : undefined;
}

function isRequired(field: MetaField): boolean {
	if (typeof field.isRequiredOnCreate === 'boolean') return field.isRequiredOnCreate;
	const notNull = field.isNotNull ?? field.type?.isNotNull ?? false;
	const hasDefault = field.hasDefault ?? field.type?.hasDefault ?? false;
	return Boolean(notNull && !hasDefault);
}

function fieldLabel(name: string, isForeignKey: boolean): string {
	if (isForeignKey && /.Id$/.test(name)) return humanize(name.slice(0, -2));
	if (isForeignKey && /._id$/.test(name)) return humanize(name.slice(0, -3));
	return humanize(name);
}

/** Input for a plain column (not a relation, not an enum); `null` when the UI can't edit or show it. */
function scalarInput(field: MetaField): { input: FieldInput; big?: boolean } | null {
	const gqlType = field.type?.gqlType ?? 'String';
	const pgType = (field.type?.pgType ?? '').toLowerCase();
	switch (gqlType) {
		case 'Boolean':
			return { input: 'boolean' };
		case 'Int':
			return { input: 'integer' };
		case 'BigInt':
			return { input: 'integer', big: true };
		case 'Float':
			return { input: pgType === 'money' ? 'currency' : 'number' };
		case 'BigFloat':
			return { input: pgType === 'money' ? 'currency' : 'number', big: true };
		case 'Date':
			return { input: 'date' };
		case 'Datetime':
			return { input: 'datetime' };
		case 'Time':
			return { input: 'time' };
		case 'UUID':
			return { input: 'uuid' };
		case 'JSON':
			return { input: 'json' };
		case 'String': {
			if (pgType === 'email' || EMAIL_NAME.test(field.name)) return { input: 'email' };
			if (pgType === 'url' || pgType === 'origin' || URL_NAME.test(field.name)) return { input: 'url' };
			if (LONG_TEXT_NAME.test(field.name)) return { input: 'textarea' };
			return { input: 'text' };
		}
		default:
			return null;
	}
}

const FORMAT_BY_INPUT: Partial<Record<FieldInput, FieldFormat>> = {
	select: 'badge',
	currency: 'currency',
	number: 'number',
	integer: 'number',
	boolean: 'boolean',
	date: 'date',
	datetime: 'datetime',
};

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

export function buildMetaModel(tables: MetaTable[]): MetaModel {
	const skipped: SkippedTable[] = [];
	const infos: TableInfo[] = [];

	for (const meta of tables) {
		const queryAll = meta.query?.all;
		if (!queryAll) {
			skipped.push({ table: meta.name, reason: 'not exposed (no query.all)' });
			continue;
		}
		const primaryKey = primaryKeyOf(meta);
		if (!primaryKey) {
			skipped.push({ table: meta.name, reason: 'no single-column primary key' });
			continue;
		}
		const typeName = meta.inflection?.tableType ?? meta.name;
		const scopeKey = meta.scope?.keyColumn ?? undefined;
		const systemHidden = new Set<string>([primaryKey]);
		const systemReadOnly = new Set<string>();
		for (const field of meta.fields ?? []) {
			const key = normalizeKey(field.name);
			if (HIDDEN_SYSTEM_KEYS.has(key) || field.name === scopeKey) systemHidden.add(field.name);
			else if (READ_ONLY_SYSTEM_KEYS.has(key)) systemReadOnly.add(field.name);
		}
		infos.push({
			meta,
			typeName,
			model: lcFirst(typeName),
			queryAll,
			name: kebabCase(queryAll),
			primaryKey,
			kind: meta.storage?.isFilesTable || meta.storage?.isBucketsTable ? 'storage' : 'entity',
			systemHidden,
			systemReadOnly,
			foreignKeys: [],
		});
	}

	// References name tables by their SQL name; the table itself is keyed by
	// its `_meta` name. Match across every spelling `_meta` gives us.
	const byKey = new Map<string, TableInfo>();
	for (const info of infos) {
		for (const key of [info.meta.name, info.typeName, info.queryAll, sqlNameOf(info.meta)]) {
			if (key && !byKey.has(normalizeKey(key))) byKey.set(normalizeKey(key), info);
		}
	}
	const resolve = (name: string | undefined) => (name ? byKey.get(normalizeKey(name)) : undefined);

	for (const info of infos) {
		const seen = new Set<string>();
		for (const relation of info.meta.relations?.belongsTo ?? []) {
			if (relation.keys.length !== 1 || seen.has(relation.keys[0].name)) continue;
			seen.add(relation.keys[0].name);
			info.foreignKeys.push({ key: relation.keys[0].name, target: resolve(relation.references.name) });
		}
		for (const constraint of info.meta.constraints?.foreignKey ?? []) {
			if (constraint.fields.length !== 1 || seen.has(constraint.fields[0].name)) continue;
			seen.add(constraint.fields[0].name);
			info.foreignKeys.push({ key: constraint.fields[0].name, target: resolve(constraint.refTable.name) });
		}
		for (const field of info.meta.fields ?? []) {
			if (field.isForeignKey && !seen.has(field.name)) {
				seen.add(field.name);
				info.foreignKeys.push({ key: field.name, target: undefined });
			}
		}
	}

	// Junction tables: two foreign keys to two different entities and nothing
	// else but system fields. A table with a value of its own (an optional or
	// defaulted grade on an enrollment) stays an entity, even when `_meta` flags
	// it or a many-to-many relation names it: linking can't show or edit that
	// value. `_meta` can still rule a junction out (`isJunction: false`).
	const junctionLinks = new Map<TableInfo, [{ key: string; target: TableInfo }, { key: string; target: TableInfo }]>();
	for (const info of infos) {
		if (info.kind !== 'entity' || info.meta.isJunction === false) continue;
		const ownFields = (info.meta.fields ?? []).filter(
			(field) => !info.systemHidden.has(field.name) && !info.systemReadOnly.has(field.name),
		);
		const keys = info.foreignKeys.filter(
			(fk) => fk.target && fk.target.kind === 'entity' && ownFields.some((field) => field.name === fk.key),
		) as Array<{ key: string; target: TableInfo }>;
		if (keys.length !== 2 || keys[0].target === keys[1].target || ownFields.length !== 2) continue;
		info.kind = 'junction';
		junctionLinks.set(info, [keys[0], keys[1]]);
	}

	const resources: ResourceIR[] = [];
	const irByInfo = new Map<TableInfo, ResourceIR>();
	for (const info of infos) {
		if (info.kind === 'storage') {
			skipped.push({ table: info.meta.name, reason: 'storage table' });
			continue;
		}
		if (info.kind === 'junction') continue;
		const ir = buildResource(info);
		resources.push(ir);
		irByInfo.set(info, ir);
	}

	const junctions: MetaModel['junctions'] = [];
	for (const [junction, [left, right]] of junctionLinks) {
		const leftIr = irByInfo.get(left.target);
		const rightIr = irByInfo.get(right.target);
		if (!leftIr || !rightIr) continue;
		junctions.push({ table: junction.meta.name, between: [leftIr.name, rightIr.name] });
		addManyToMany(leftIr, rightIr, junction, left.key, right.key);
		addManyToMany(rightIr, leftIr, junction, right.key, left.key);
	}

	for (const ir of resources) finishLayout(ir);
	return { resources, junctions, skipped };
}

function buildResource(info: TableInfo): ResourceIR {
	const fields: FieldIR[] = [];
	const bigNumbers: string[] = [];
	const createOnly: string[] = [];
	const serverDefaults: string[] = [];
	const keepWhenEmpty: string[] = [];
	const userKeys = (info.meta.fields ?? [])
		.filter((field) => info.systemHidden.has(field.name) && field.name !== info.primaryKey && isRequired(field))
		.map((field) => field.name);
	const foreignKeyByName = new Map(info.foreignKeys.map((fk) => [fk.key, fk.target]));

	for (const field of info.meta.fields ?? []) {
		const hiddenSystem = info.systemHidden.has(field.name);
		const readOnlySystem = info.systemReadOnly.has(field.name);
		const isForeignKey = foreignKeyByName.has(field.name);
		const target = foreignKeyByName.get(field.name);
		const isArray = Boolean(field.type?.isArray);
		const neverWritable = field.isWritableOnCreate === false && field.isWritableOnUpdate === false;
		const notNull = field.isNotNull ?? field.type?.isNotNull ?? false;
		const hasDefault = field.hasDefault ?? field.type?.hasDefault ?? false;
		const values = field.allowedValues?.length ? field.allowedValues : field.enumValues?.values;
		const metaValues = values?.length ? values : 'allowedValues' in field ? null : undefined;
		if (hasDefault && !hiddenSystem && !readOnlySystem) {
			serverDefaults.push(field.name);
			if (notNull) keepWhenEmpty.push(field.name);
		}
		if (field.isWritableOnCreate !== false && field.isWritableOnUpdate === false && !hiddenSystem) {
			createOnly.push(field.name);
		}
		const base = {
			name: field.name,
			...(field.columnName ? { columnName: field.columnName } : {}),
			required: !hiddenSystem && !readOnlySystem && !neverWritable && isRequired(field),
			readOnly: readOnlySystem || neverWritable,
			hidden: hiddenSystem,
			gqlType: field.type?.gqlType,
			textFilter: field.type?.gqlType === 'String' && !isArray && TEXT_PG_TYPES.has((field.type?.pgType ?? 'text').toLowerCase()),
			selectable: true,
			...(metaValues !== undefined ? { metaValues } : {}),
		};

		if (isForeignKey && !hiddenSystem) {
			if (target && target.kind === 'entity' && !isArray) {
				fields.push({ ...base, label: fieldLabel(field.name, true), input: 'relation', relation: { resource: target.name } });
			} else {
				// A key into something the app doesn't manage (users, files): keep the value, don't show it.
				fields.push({ ...base, label: fieldLabel(field.name, true), input: 'uuid', hidden: true });
			}
			continue;
		}

		if (metaValues && !isArray) {
			const labels = optionLabels(metaValues);
			fields.push({
				...base,
				label: fieldLabel(field.name, false),
				input: 'select',
				format: 'badge',
				options: metaValues.map((value, i) => ({ value, label: labels[i], tone: toneFor(value) })),
			});
			continue;
		}

		const scalar = scalarInput(field);
		if (!scalar) {
			fields.push({ ...base, label: fieldLabel(field.name, false), input: 'json', hidden: true, selectable: false });
			continue;
		}
		if (scalar.big && !isArray) bigNumbers.push(field.name);
		const format = readOnlySystem && scalar.input === 'datetime' ? 'relative' : FORMAT_BY_INPUT[scalar.input];
		fields.push({
			...base,
			label: fieldLabel(field.name, false),
			// Arrays have no editor in the kit: show them, never write them.
			input: isArray ? 'json' : scalar.input,
			...(isArray ? { readOnly: true, required: false } : {}),
			...(format && !isArray ? { format } : {}),
		});
	}

	const operations = {
		create: Boolean(info.meta.query?.create),
		update: Boolean(info.meta.query?.update),
		delete: Boolean(info.meta.query?.delete),
	};

	return {
		table: info.meta.name,
		...(info.meta.tableName ? { tableName: info.meta.tableName } : {}),
		typeName: info.typeName,
		filterType: info.meta.inflection?.filterType ?? `${info.typeName}Filter`,
		model: info.model,
		queryAll: info.queryAll,
		name: info.name,
		label: humanize(info.queryAll),
		singular: humanize(info.typeName),
		primaryKey: info.primaryKey as string,
		titleField: '',
		fields,
		columns: [],
		formFields: [],
		searchFields: [],
		inNav: true,
		manyToMany: [],
		bigNumbers,
		userKeys,
		createOnly,
		serverDefaults,
		keepWhenEmpty,
		createDefaults: {},
		operations,
	};
}

function addManyToMany(owner: ResourceIR, target: ResourceIR, junction: TableInfo, sourceKey: string, targetKey: string) {
	const taken = (name: string) => owner.fields.some((field) => field.name === name);
	let field = camelCase(target.queryAll);
	if (taken(field)) field = camelCase(junction.queryAll);
	for (let index = 2; taken(field); index++) field = `${camelCase(junction.queryAll)}${index}`;
	owner.fields.push({
		name: field,
		label: humanize(target.queryAll),
		input: 'relation',
		relation: { resource: target.name, many: true },
		required: false,
		readOnly: false,
		hidden: false,
		selectable: false,
	});
	owner.manyToMany.push({
		field,
		target: target.name,
		junction: {
			table: junction.meta.name,
			model: junction.model,
			primaryKey: junction.primaryKey as string,
			sourceKey,
			targetKey,
		},
	});
}

const NON_COLUMN_INPUTS = new Set<FieldInput>(['textarea', 'json']);
const SEARCHABLE_INPUTS = new Set<FieldInput>(['text', 'textarea', 'email', 'url']);
// Text columns the filter plugin gives string operators. A domain over text
// (`email`, `url`, ...) is its own type, which the filter input leaves out, so
// one in a search would fail the whole request. gen narrows this further from
// the generated SDK's filter types when they exist (see sdk-filters.ts).
const TEXT_PG_TYPES = new Set(['text', 'varchar', 'character varying', 'citext', 'bpchar', 'char', 'character', 'name']);
const MAX_COLUMNS = 5;

/** Picks title, columns, form order, search and sort from the fields. Re-run after spec overrides. */
export function finishLayout(ir: ResourceIR, keep: { titleField?: boolean; columns?: boolean; formFields?: boolean } = {}) {
	const visible = ir.fields.filter((field) => !field.hidden);
	const textual = visible.filter((field) => field.input === 'text' || field.input === 'email');

	if (!keep.titleField || !ir.fields.some((field) => field.name === ir.titleField)) {
		// A title must name every row, so fields that always hold a value come first; an optional
		// field that is empty on some rows would leave those rows titled by their id.
		const named = (fields: FieldIR[], names: string[]) =>
			names.map((candidate) => fields.find((field) => normalizeKey(field.name) === candidate)).find(Boolean);
		const longText = visible.filter((field) => field.input === 'textarea' && field.selectable);
		const belongsTo = visible.filter((field) => field.relation && !field.relation.many);
		const required = (fields: FieldIR[]) => fields.filter((field) => field.required);
		const lowInformation = (field: FieldIR) => Boolean(field.options?.length) || LOW_INFORMATION_NAME.test(field.name);
		const informative = textual.filter((field) => !lowInformation(field));
		const title =
			named(required(informative), TITLE_NAMES) ??
			required(informative).find((field) => field.input === 'text') ??
			required(informative)[0] ??
			required(longText)[0] ??
			// No text to name a row: resource-kit titles it by the related record instead.
			required(belongsTo)[0] ??
			named(informative, TITLE_NAMES) ??
			named(informative, TITLE_FALLBACK_NAMES) ??
			informative[0] ??
			belongsTo[0] ??
			longText[0] ??
			required(textual)[0] ??
			textual[0] ??
			visible.find((field) => !field.readOnly && field.selectable);
		ir.titleField = title?.name ?? ir.primaryKey;
	}

	ir.searchFields = visible
		.filter((field) => SEARCHABLE_INPUTS.has(field.input) && field.selectable && field.textFilter)
		.map((field) => field.name);

	if (!keep.columns) {
		const rest = visible.filter(
			(field) =>
				field.name !== ir.titleField &&
				field.selectable &&
				!field.readOnly &&
				!NON_COLUMN_INPUTS.has(field.input),
		);
		const columns = [ir.titleField, ...rest.map((field) => field.name)].slice(0, MAX_COLUMNS);
		ir.columns = visible.some((field) => field.name === ir.titleField) ? columns : columns.slice(1);
	}

	if (!keep.formFields) {
		ir.formFields = visible.filter((field) => !field.readOnly).map((field) => field.name);
	}

	const createdAt = ir.fields.find((field) => normalizeKey(field.name) === 'createdat');
	ir.defaultSort = createdAt
		? { field: createdAt.name, direction: 'desc' }
		: ir.titleField !== ir.primaryKey
			? { field: ir.titleField, direction: 'asc' }
			: undefined;
}
