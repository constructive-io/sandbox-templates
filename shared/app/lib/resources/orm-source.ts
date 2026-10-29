// A resource-kit data source over one generated ORM model.
//
// The ORM model is the only contact with the API: list maps the kit's query
// (search, equality filters, sort, offset paging) onto findMany, and
// many-to-many fields read and replace rows of the junction model.

import type { QueryResult } from '@constructive-io/graphql-query/runtime';

import type { ListQuery, ResourceSource } from '@/components/ui/resource-kit';

// The extensions keep this importable by the node test runner.
import { failureKind, failureMessage, type FailureKind } from '../graphql/errors.ts';
import { fetchAll } from '../graphql/fetch-all.ts';

type Row = Record<string, unknown>;

type Executable = { execute(): Promise<QueryResult<unknown>> };

/** The CRUD surface every generated ORM model has. */
export type OrmModel = {
	findMany(args: any): Executable;
	create(args: any): Executable;
	update(args: any): Executable;
	delete(args: any): Executable;
};

/** The model's select type, so a typo in a generated config fails type checking. */
export type SelectOf<M> = M extends { findMany(args: infer A): unknown } ? (A extends { select: infer S } ? S : never) : never;

export type ManyToManyLink = {
	junction: OrmModel;
	/** Primary key of the junction rows. */
	primaryKey?: string;
	/** Junction column pointing at this resource. */
	sourceKey: string;
	/** Junction column pointing at the linked resource. */
	targetKey: string;
};

export type OrmSourceOptions<M extends OrmModel> = {
	select: SelectOf<M>;
	primaryKey?: string;
	/** Text fields the toolbar search matches, case-insensitively. */
	searchFields?: readonly string[];
	/** BigInt/BigFloat fields: strings on the wire, numbers in rows. */
	bigNumbers?: readonly string[];
	/** Required owner or entity keys a create fills with the signed-in user's id when the form has none. */
	userKeys?: readonly string[];
	currentUserId?: () => string | null;
	/** Values a create sends for fields the form left empty. */
	createDefaults?: Record<string, unknown>;
	/** Fields the API accepts on create only; updates leave them out. */
	createOnly?: readonly string[];
	/** Fields with a database default: an empty value is left out of creates, so the default applies. */
	serverDefaults?: readonly string[];
	/** NOT NULL fields with a default: an empty value is left out of updates too, instead of sent as null. */
	keepWhenEmpty?: readonly string[];
	manyToMany?: Record<string, ManyToManyLink>;
};

/** PostGraphile's orderBy enum value for a field: `entryDate` → `ENTRY_DATE_ASC`. */
export function orderByValue(field: string, direction: 'asc' | 'desc'): string {
	const constant = field
		.replace(/[A-Z]+/g, '_$&')
		.replace(/__+/g, '_')
		.replace(/^_+/, '')
		.toUpperCase();
	return `${constant}_${direction === 'desc' ? 'DESC' : 'ASC'}`;
}

function filterFor(value: unknown): Record<string, unknown> {
	if (value === null) return { isNull: true };
	if (Array.isArray(value)) return { in: value };
	return { equalTo: value };
}

/** The findMany arguments for one page of the kit's list query. */
export function listArgs(
	query: ListQuery,
	options: { select: unknown; primaryKey?: string; searchFields?: readonly string[]; bigNumbers?: readonly string[] },
) {
	const primaryKey = options.primaryKey ?? 'id';
	const conditions: Record<string, unknown>[] = [];
	const search = query.search?.trim();
	if (search && options.searchFields?.length) {
		conditions.push({ or: options.searchFields.map((field) => ({ [field]: { includesInsensitive: search } })) });
	}
	for (const [field, value] of Object.entries(query.filters ?? {})) {
		if (value === undefined) continue;
		conditions.push({ [field]: filterFor(toWireValue(field, value, options.bigNumbers)) });
	}
	const orderBy: string[] = [];
	if (query.sort) orderBy.push(orderByValue(query.sort.field, query.sort.direction));
	// A stable tiebreaker keeps offset pages from repeating or skipping rows.
	if (query.sort?.field !== primaryKey) orderBy.push('PRIMARY_KEY_ASC');
	return {
		select: options.select,
		...(conditions.length === 1 ? { where: conditions[0] } : conditions.length > 1 ? { where: { and: conditions } } : {}),
		orderBy,
		first: query.limit,
		offset: query.offset,
	};
}

function toWireValue(field: string, value: unknown, bigNumbers: readonly string[] = []): unknown {
	if (!bigNumbers.includes(field)) return value;
	if (value === '' || value === undefined) return null;
	return typeof value === 'number' ? String(value) : value;
}

function fromWire(row: Row, bigNumbers: readonly string[]): Row {
	if (!bigNumbers.length) return row;
	const out = { ...row };
	for (const field of bigNumbers) {
		const value = out[field];
		if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) out[field] = Number(value);
	}
	return out;
}

/**
 * What resource-kit shows for a rejected write: `userMessage` as the headline,
 * `fields` under each input, and `message` under a collapsed Details. `kind` is
 * set when the database, the app or the session is the problem, not the input.
 */
export type SourceError = Error & { fields?: Record<string, string>; userMessage?: string; kind?: FailureKind };

// Server wording that names database internals. The kit shows `message` under Details, so such text
// never goes out as is: a message without them (e.g. a validation a trigger raised) is kept.
const INTERNALS = /"[^"]*"|\b(constraint|relation|table|column|schema|function|violates|sqlstate|syntax)\b|\b[a-z]+_[a-z0-9_]+\b/i;
const REJECTED = 'The server rejected the change.';

const camel = (column: string) => column.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase());

/** Postgres errors, rewritten for people: no constraint or table names, and fields where the column is known. */
export function friendlyError(
	errors: Array<{ message: string; extensions?: Record<string, unknown> }>,
	known: readonly string[] = [],
): SourceError {
	// An unavailable database, an app the database changed under, or an ended session: no field is at fault.
	const kind = failureKind(errors);
	const sentence = failureMessage(kind);
	if (sentence) {
		const error: SourceError = new Error(sentence);
		error.userMessage = sentence;
		error.kind = kind;
		return error;
	}
	const text = errors.map((error) => `${error.message} ${String(error.extensions?.detail ?? '')}`).join('\n');
	const codes = new Set(errors.map((error) => String(error.extensions?.code ?? '')));
	const fields: Record<string, string> = {};
	const mark = (columns: string[], message: string) => {
		for (const column of columns) {
			const name = camel(column);
			if (known.includes(name)) fields[name] = message;
		}
	};
	const snake = (name: string) => name.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
	const constraint = /constraint "([^"]+)"/.exec(text)?.[1] ?? '';
	// The detail names the columns; without it, the constraint name usually contains them.
	const keyColumns = () =>
		/Key \(([^)]+)\)/.exec(text)?.[1].split(',').map((column) => column.trim().replace(/"/g, '')) ??
		known.map(snake).filter((column) => constraint.includes(column));
	const missingInput = /Field "\w+\.(\w+)" of required type .* was not provided/.exec(text);
	// Set for errors recognized here; anything else keeps the server's text, which the kit shows as details.
	let message: string | undefined;
	if (missingInput) {
		mark([missingInput[1]], 'Required.');
		message = 'Fill in the required fields.';
	} else if (/null value in column "([^"]+)"/.test(text) || codes.has('NOT_NULL_VIOLATION')) {
		mark([/null value in column "([^"]+)"/.exec(text)?.[1] ?? ''], 'Required.');
		message = 'Fill in the required fields.';
	} else if (/duplicate key value violates unique constraint/.test(text) || codes.has('UNIQUE_VIOLATION')) {
		mark(keyColumns(), 'Already used by another record.');
		message = 'A record with the same values already exists.';
	} else if (/violates check constraint/.test(text) || codes.has('CHECK_VIOLATION')) {
		mark(
			known.map(snake).filter((column) => constraint.includes(column)),
			'Not an allowed value.',
		);
		message = "One of the values isn't allowed.";
	} else if (/update or delete on table .* violates .*foreign key constraint/.test(text)) {
		message = 'Other records still point to this one. Remove or change them first.';
	} else if (/violates .*foreign key constraint/.test(text) || codes.has('FOREIGN_KEY_VIOLATION')) {
		mark(keyColumns(), 'That record no longer exists.');
		message = 'A related record is missing or was deleted.';
	} else if (/permission denied/i.test(text)) {
		message = "You don't have permission to do that.";
	} else if (/invalid input syntax for type|invalid input value for enum/.test(text)) {
		message = 'A value has the wrong format.';
	} else if (/value too long for type/.test(text)) {
		message = 'A value is too long.';
	}
	const raw = errors.map((e) => e.message).join('; ');
	const error: SourceError = new Error(message ?? (raw && !INTERNALS.test(raw) ? raw : REJECTED));
	if (message) error.userMessage = message;
	if (Object.keys(fields).length) error.fields = fields;
	return error;
}

async function run(builder: Executable, known?: readonly string[]): Promise<unknown> {
	const result = await builder.execute();
	if (!result.ok) throw friendlyError(result.errors, known);
	return result.data;
}

/** Generated results wrap the payload in one key per level: `{ contacts: {...} }`, `{ createContact: { contact } }`. */
function unwrap(data: unknown, depth: number): unknown {
	let value = data;
	for (let level = 0; level < depth; level++) {
		if (!value || typeof value !== 'object') return null;
		value = Object.values(value as Row)[0];
	}
	return value;
}

export function ormSource<M extends OrmModel>(model: M, options: OrmSourceOptions<M>): ResourceSource<Row> {
	const primaryKey = options.primaryKey ?? 'id';
	const select = options.select as Row;
	const bigNumbers = options.bigNumbers ?? [];
	const links = options.manyToMany ?? {};

	const writable = (values: Partial<Row>, mode: 'create' | 'update') => {
		const data: Row = {};
		const keepDefault = mode === 'create' ? options.serverDefaults : options.keepWhenEmpty;
		for (const [field, value] of Object.entries(values)) {
			if (value === undefined || field === primaryKey || field in links || !(field in select)) continue;
			if ((value === null || value === '') && keepDefault?.includes(field)) continue;
			data[field] = toWireValue(field, value, bigNumbers);
		}
		return data;
	};

	const linkedRows = async (id: string, link: ManyToManyLink) => {
		const key = link.primaryKey ?? 'id';
		const rows = (await fetchAll((page) =>
			link.junction.findMany({
				select: { [key]: true, [link.targetKey]: true },
				where: { [link.sourceKey]: { equalTo: id } },
				...page,
			}),
		)) as Row[];
		return rows.map((row) => ({
			key: String(row[key]),
			target: String(row[link.targetKey]),
		}));
	};

	const source: ResourceSource<Row> = {
		async list(query) {
			const data = await run(model.findMany(listArgs(query, { ...options, primaryKey })));
			const connection = unwrap(data, 1) as { nodes?: Row[]; totalCount?: number } | null;
			const rows = (connection?.nodes ?? []).map((row) => fromWire(row, bigNumbers));
			return { rows, totalCount: connection?.totalCount ?? rows.length };
		},

		async get(id) {
			const data = await run(model.findMany({ select, where: { [primaryKey]: { equalTo: id } }, first: 1 }));
			const row = (unwrap(data, 1) as { nodes?: Row[] } | null)?.nodes?.[0];
			return row ? fromWire(row, bigNumbers) : null;
		},

		async create(values) {
			const input = writable(values, 'create');
			for (const [key, value] of Object.entries(options.createDefaults ?? {})) {
				if (input[key] == null || input[key] === '') input[key] = value;
			}
			const userId = options.currentUserId?.();
			for (const key of options.userKeys ?? []) if (input[key] == null && userId) input[key] = userId;
			const data = await run(model.create({ data: input, select }), Object.keys(select));
			const row = fromWire((unwrap(data, 2) as Row | null) ?? {}, bigNumbers);
			await linkFrom(String(row[primaryKey]), values);
			return row;
		},

		async update(id, patch) {
			const input = writable(patch, 'update');
			for (const key of options.createOnly ?? []) delete input[key];
			// The API rejects an empty patch; a change to links alone only touches the junction.
			const row = Object.keys(input).length
				? fromWire(
						(unwrap(await run(model.update({ where: { [primaryKey]: id }, data: input, select }), Object.keys(select)), 2) as Row | null) ?? {},
						bigNumbers,
					)
				: ((await source.get(id)) ?? { [primaryKey]: id });
			await linkFrom(id, patch);
			return row;
		},

		async remove(id) {
			await run(model.delete({ where: { [primaryKey]: id }, select: { [primaryKey]: true } }));
		},
	};

	// Many-to-many values that arrive with a create or update are applied as links too.
	async function linkFrom(id: string, values: Partial<Row>) {
		for (const [field, value] of Object.entries(values)) {
			if (field in links && Array.isArray(value)) await source.link?.(id, field, value.map(String));
		}
	}

	if (Object.keys(links).length) {
		source.linked = async (id, field) => {
			const link = links[field];
			if (!link) throw new Error(`"${field}" is not a many-to-many field.`);
			return (await linkedRows(id, link)).map((row) => row.target);
		};
		source.link = async (id, field, targetIds) => {
			const link = links[field];
			if (!link) throw new Error(`"${field}" is not a many-to-many field.`);
			const key = link.primaryKey ?? 'id';
			const current = await linkedRows(id, link);
			const wanted = new Set(targetIds);
			const existing = new Set(current.map((row) => row.target));
			await Promise.all([
				...current
					.filter((row) => !wanted.has(row.target))
					.map((row) => run(link.junction.delete({ where: { [key]: row.key }, select: { [key]: true } }))),
				...[...wanted]
					.filter((target) => !existing.has(target))
					.map((target) =>
						run(
							link.junction.create({
								data: { [link.sourceKey]: id, [link.targetKey]: target },
								select: { [key]: true },
							}),
						),
					),
			]);
		};
	}

	return source;
}
