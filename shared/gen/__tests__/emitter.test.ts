import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import ts from 'typescript';

import { applySpec as applyAppSpec, type AppSpec } from '../app-spec.ts';
import { clearDerived, GENERATED_HEADER, stampGenerated } from '../emitter.ts';
import { emitter } from '../emitters/nextjs.ts';
import { buildMetaModel, parseMetaDocument, type MetaField, type MetaTable } from '../meta-ir.ts';
import { runGen } from '../run.ts';

const FIXTURE = join(import.meta.dirname, '__fixtures__', 'crm-meta.json');
const NEXTJS_SHELL = join(import.meta.dirname, '..', '..', '..', 'nextjs', 'app');

function tables(): MetaTable[] {
	return parseMetaDocument(JSON.parse(readFileSync(FIXTURE, 'utf8')));
}

/** The file without its first line: what deleting the header leaves. */
const withoutHeader = (content: string) => content.slice(content.indexOf('\n') + 1);

function generate(root: string, metaTables = tables(), name = 'CRM') {
	return runGen({ root, tables: metaTables, spec: { version: 1, name, backend: { kind: 'blueprint', slug: 'crm' } }, emitter }).files;
}

describe('generated file ownership', () => {
	let root: string;
	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), 'gen-ownership-'));
	});
	afterEach(() => rmSync(root, { recursive: true, force: true }));

	it('is idempotent: a second run writes nothing', () => {
		const first = generate(root);
		assert.ok(first.written.includes('src/resources/contacts.ts'));
		const second = generate(root);
		assert.deepEqual(second.written, []);
		assert.deepEqual(second.unchanged, first.written);
	});

	it('never rewrites a file whose header line was deleted', () => {
		generate(root);
		const path = join(root, 'src/config/app.ts');
		const owned = withoutHeader(readFileSync(path, 'utf8')).replace("'CRM'", "'Mine'");
		writeFileSync(path, owned);

		const report = generate(root, tables(), 'Renamed');
		assert.ok(report.skipped.includes('src/config/app.ts'));
		assert.equal(readFileSync(path, 'utf8'), owned);
	});

	it('removes generated files of a dropped table but keeps owned files beside them', () => {
		generate(root);
		const ownedPath = join(root, 'src/app/(app)/deals/view/page.tsx');
		writeFileSync(ownedPath, withoutHeader(readFileSync(ownedPath, 'utf8')));

		const report = generate(
			root,
			tables().filter((t) => t.name !== 'Deal'),
		);
		assert.deepEqual(report.removed, ['src/app/(app)/deals/page.tsx', 'src/resources/deals.ts']);
		assert.ok(existsSync(ownedPath));
		assert.ok(!readFileSync(join(root, 'src/resources/index.ts'), 'utf8').includes('deals'));
	});

	it('replaces the record pages an older generator wrote at [id] with static view routes', () => {
		// What a run of the generator before the static export wrote: record pages at [id].
		const dynamicRoutes = {
			...emitter,
			emit: (model: Parameters<typeof emitter.emit>[0]) =>
				emitter.emit(model).map((file) => ({ ...file, path: file.path.replace('/view/page.tsx', '/[id]/page.tsx') })),
		};
		runGen({ root, tables: tables(), spec: { version: 1, name: 'CRM', backend: { kind: 'blueprint', slug: 'crm' } }, emitter: dynamicRoutes });
		assert.ok(existsSync(join(root, 'src/app/(app)/deals/[id]/page.tsx')));

		const report = generate(root);
		assert.ok(report.removed.includes('src/app/(app)/deals/[id]/page.tsx'));
		assert.ok(report.written.includes('src/app/(app)/deals/view/page.tsx'));
		assert.ok(!existsSync(join(root, 'src/app/(app)/deals/[id]')), 'the emptied [id] folder goes too');
	});

	it('keeps a file edited with its header still in place, and reports it as modified', () => {
		generate(root);
		const path = join(root, 'src/resources/deals.ts');
		const edited = readFileSync(path, 'utf8').replace("label: 'Deals'", "label: 'Pipeline'");
		writeFileSync(path, edited);

		const renamed = generate(root, tables(), 'Renamed');
		assert.ok(renamed.modified.includes('src/resources/deals.ts'));
		assert.equal(readFileSync(path, 'utf8'), edited);

		const dropped = generate(
			root,
			tables().filter((t) => t.name !== 'Deal'),
		);
		assert.ok(dropped.modified.includes('src/resources/deals.ts'), 'not pruned either');
		assert.ok(existsSync(path));
	});

	it('treats a header without its hash as an edit, unless the body is still what the last run wrote', () => {
		generate(root);
		const dropHash = (path: string, edit = (body: string) => body) => {
			const abs = join(root, path);
			writeFileSync(abs, `${GENERATED_HEADER}\n${edit(withoutHeader(readFileSync(abs, 'utf8')))}`);
		};
		dropHash('src/resources/deals.ts', (body) => body.replace("label: 'Deals'", "label: 'Pipeline'"));
		dropHash('src/config/app.ts');
		const edited = readFileSync(join(root, 'src/resources/deals.ts'), 'utf8');

		const report = generate(root, tables(), 'Renamed');
		assert.ok(report.modified.includes('src/resources/deals.ts'));
		assert.equal(readFileSync(join(root, 'src/resources/deals.ts'), 'utf8'), edited);
		assert.ok(report.written.includes('src/config/app.ts'));
		assert.match(readFileSync(join(root, 'src/config/app.ts'), 'utf8'), /^\/\/ @generated .*\(body sha256:[0-9a-f]{12}\)\n[\s\S]*'Renamed'/);
	});

	it('clears the route types Next derived, which still import the removed pages', () => {
		mkdirSync(join(root, '.next/dev/types'), { recursive: true });
		writeFileSync(join(root, '.next/dev/types/validator.ts'), "import '../../../src/app/(app)/deals/page.js';\n");
		assert.deepEqual(clearDerived(root, emitter.derivedPaths), ['.next/dev/types']);
		assert.ok(!existsSync(join(root, '.next/dev/types')));
	});
});

describe('the Next.js shell', () => {
	it('ships exactly what the emitter writes for a database with no tables', () => {
		const files = emitter.emit(applyAppSpec(buildMetaModel([])));
		for (const file of files) {
			assert.equal(readFileSync(join(NEXTJS_SHELL, file.path), 'utf8'), stampGenerated(file.content), file.path);
		}
	});
});

describe('the static export', () => {
	it('emits no dynamic route segment, and a record page that reads its id from the query', () => {
		const files = emitter.emit(applyAppSpec(buildMetaModel(tables())));
		const routes = files.filter((file) => file.path.startsWith('src/app/'));
		assert.ok(routes.length > 0);
		for (const file of routes) assert.doesNotMatch(file.path, /\[[^\]]+\]/, file.path);

		const record = files.find((file) => file.path === 'src/app/(app)/deals/view/page.tsx');
		assert.ok(record);
		assert.match(record.content, /^'use client';$/m);
		assert.match(record.content, /useSearchParams\(\)\.get\('id'\)/);
		assert.match(record.content, /<Suspense>/);
		assert.match(record.content, /redirect\('\/deals'\)/);
	});

	it('is the static export the shell builds', () => {
		const config = readFileSync(join(NEXTJS_SHELL, 'next.config.ts'), 'utf8');
		assert.match(config, /output: 'export'/);
		assert.match(config, /trailingSlash: true/);
		const router = readFileSync(join(NEXTJS_SHELL, 'src/components/resource-router.tsx'), 'utf8');
		assert.match(router, /\$\{listHref\(resource\)\}\/view\/\?id=\$\{encodeURIComponent\(id\)\}/);
	});
});

describe('search', () => {
	it('writes an empty searchFields for a table with nothing to search, so the kit can hide the box', () => {
		const metaTables = tables();
		const tag = metaTables.find((t) => t.name === 'Tag') as MetaTable;
		for (const field of tag.fields ?? []) if (field.type?.gqlType === 'String') field.type = { ...field.type, gqlType: 'Int', pgType: 'int4' };
		const files = emitter.emit(applyAppSpec(buildMetaModel(metaTables)));
		const tags = files.find((file) => file.path === 'src/resources/tags.ts')?.content ?? '';
		assert.match(tags, /\n\tsearchFields: \[\],\n/);
	});
});

describe('resources with restricted operations', () => {
	it('emits insert-only list and detail pages with a source compatible with the ORM model', () => {
		const audit: MetaTable = {
			name: 'AuditEvent',
			query: { all: 'auditEvents', one: 'auditEvent', create: 'createAuditEvent' },
			fields: [{ name: 'id', isPrimaryKey: true, type: { gqlType: 'UUID', pgType: 'uuid', isArray: false } }],
		};
		const files = emitter.emit(applyAppSpec(buildMetaModel([audit])));
		const resource = files.find((file) => file.path === 'src/resources/audit-events.ts');
		assert.ok(resource);
		assert.match(resource.content, /operations: \{ create: true, update: false, delete: false \}/);
		assert.ok(files.some((file) => file.path === 'src/app/(app)/audit-events/page.tsx'));
		assert.ok(files.some((file) => file.path === 'src/app/(app)/audit-events/view/page.tsx'));

		const root = mkdtempSync(join(tmpdir(), 'gen-insert-only-'));
		try {
			const resourcePath = join(root, 'audit-events.ts');
			writeFileSync(resourcePath, resource.content);
			writeFileSync(join(root, 'db.d.ts'), `
declare function findMany(args: { select: { id?: true } }): { execute(): Promise<{ ok: true; data: unknown }> };
declare function create(args: { data: {}; select: { id?: true } }): ReturnType<typeof findMany>;
export declare const db: { auditEvent: { findMany: typeof findMany; create: typeof create } };
`);
			writeFileSync(join(root, 'kit.d.ts'), `
type Row = Record<string, unknown>;
export type ListQuery = { search?: string; sort?: { field: string; direction: 'asc' | 'desc' }; offset: number; limit: number; filters?: Row };
export interface ResourceSource<T extends Row> {
	list(query: ListQuery): Promise<{ rows: T[]; totalCount: number }>;
	get(id: string): Promise<T | null>;
	create(values: Partial<T>): Promise<T>;
	update(id: string, patch: Partial<T>): Promise<T>;
	remove(id: string): Promise<void>;
	link?(id: string, field: string, targetIds: string[]): Promise<void>;
	linked?(id: string, field: string): Promise<string[]>;
}
export declare function defineResource<T extends { source: ResourceSource<Row> }>(resource: T): T;
`);
			writeFileSync(join(root, 'runtime.d.ts'), `
export type QueryResult<T> =
	| { ok: true; data: T }
	| { ok: false; errors: Array<{ message: string; extensions?: Record<string, unknown> }> };
`);
			const program = ts.createProgram([resourcePath], {
				target: ts.ScriptTarget.ES2023,
				module: ts.ModuleKind.NodeNext,
				allowImportingTsExtensions: true,
				noEmit: true,
				strict: true,
				types: [],
				paths: {
					'@/components/ui/resource-kit': [join(root, 'kit.d.ts')],
					'@/lib/graphql/db': [join(root, 'db.d.ts')],
					'@/lib/resources/orm-source': [resolve(import.meta.dirname, '../../app/lib/resources/orm-source.ts')],
					'@constructive-io/graphql-query/runtime': [join(root, 'runtime.d.ts')],
				},
			});
			assert.deepEqual(ts.getPreEmitDiagnostics(program).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')), []);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});

describe('create form date defaults', () => {
	it('prefills required writable dates and times, honoring database and AppSpec defaults', () => {
		const temporal = (name: string, gqlType: 'Date' | 'Datetime', extra?: Partial<MetaField>): MetaField => ({
			name,
			isNotNull: true,
			type: { gqlType, pgType: gqlType === 'Date' ? 'date' : 'timestamptz', isArray: false },
			...extra,
		});
		const table: MetaTable = {
			name: 'Interaction',
			query: { all: 'interactions', create: 'createInteraction' },
			fields: [
				{ name: 'id', isPrimaryKey: true, type: { gqlType: 'UUID', pgType: 'uuid', isArray: false } },
				temporal('occurredAt', 'Datetime'),
				temporal('eventDate', 'Date'),
				temporal('serverTime', 'Datetime', { hasDefault: true }),
				temporal('optionalTime', 'Datetime', { isNotNull: false }),
				temporal('frozenTime', 'Datetime', { isWritableOnCreate: false }),
				temporal('fixedDate', 'Date'),
			],
		};
		const spec: AppSpec = {
			version: 1,
			name: 'Interactions',
			backend: { kind: 'blueprint', slug: 'crm' },
			ui: { resources: { interactions: { fields: { fixedDate: { default: '2026-11-06' } } } } },
		};
		const emit = () => emitter.emit(applyAppSpec(buildMetaModel([table]), spec)).find((file) => file.path === 'src/resources/interactions.ts')!.content;
		const contents = emit();
		assert.match(contents, /occurredAt: \{[^}]*createDefault: 'now'/);
		assert.match(contents, /eventDate: \{[^}]*createDefault: 'now'/);
		assert.equal(contents.match(/createDefault: 'now'/g)?.length, 2);
		assert.match(contents, /createDefaults: \{ fixedDate: '2026-11-06' \}/);
		// The hint's default also starts the form on it, not only the create the source sends.
		assert.match(contents, /fixedDate: \{[^}]*createDefault: \{ value: '2026-11-06' \}/);
		table.query = { all: 'interactions' };
		assert.doesNotMatch(emit(), /createDefault: 'now'/);
	});
});

describe('create form value defaults', () => {
	it("starts a create form on the AppSpec field's literal default, and a date keyword at the current time", () => {
		const column = (name: string, gqlType: string, pgType: string, extra?: Partial<MetaField>): MetaField => ({
			name,
			type: { gqlType, pgType, isArray: false },
			...extra,
		});
		const table: MetaTable = {
			name: 'WishlistItem',
			query: { all: 'wishlistItems', create: 'createWishlistItem' },
			fields: [
				column('id', 'UUID', 'uuid', { isPrimaryKey: true }),
				column('title', 'String', 'text', { isNotNull: true }),
				column('priority', 'String', 'text', { isNotNull: true, hasDefault: true }),
				column('quantity', 'Int', 'int4', { hasDefault: true }),
				column('wantedOn', 'Date', 'date', { isNotNull: true, hasDefault: true }),
			],
		};
		const spec: AppSpec = {
			version: 1,
			name: 'Wishlist',
			backend: {
				kind: 'custom',
				entities: [
					{
						name: 'wishlist_items',
						fields: [
							{ name: 'title', type: 'text', required: true },
							{ name: 'priority', type: 'text', required: true, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
							{ name: 'quantity', type: 'integer', default: 1 },
							{ name: 'wanted_on', type: 'date', required: true, default: 'today' },
						],
					},
				],
			},
		} as AppSpec;
		const contents = emitter
			.emit(applyAppSpec(buildMetaModel([table]), spec))
			.find((file) => file.path === 'src/resources/wishlist-items.ts')!.content;
		// One field's config, from its key to the next field's.
		const config = (name: string) => contents.slice(contents.indexOf(`\t\t${name}: {`)).split(/\n\t\t\w+: \{/)[0];
		assert.match(config('priority'), /createDefault: \{ value: 'Medium' \}/);
		assert.match(config('quantity'), /createDefault: \{ value: 1 \}/);
		// The database fills a time default on insert; the form doesn't invent one for an optional column.
		assert.doesNotMatch(config('wantedOn'), /createDefault/);
		assert.doesNotMatch(config('title'), /createDefault/);
	});
});

describe('person labels', () => {
	it('uses a full name in related fields when the AppSpec titles a person by one name part', () => {
		const app = applyAppSpec(buildMetaModel(tables()), {
			version: 1,
			name: 'VC CRM',
			backend: { kind: 'blueprint', slug: 'agentic_crm' },
			ui: { resources: { contacts: { titleField: 'first_name' } } },
		});
		const files = emitter.emit(app);
		const contacts = files.find((file) => file.path === 'src/resources/contacts.ts')!.content;
		const deals = files.find((file) => file.path === 'src/resources/deals.ts')!.content;
		assert.match(contacts, /titleField: 'firstName'/);
		assert.match(contacts, /compositeTitle: \{ name: 'fullName', fields: \['firstName', 'lastName'\] \}/);
		assert.match(deals, /relation: \{ resource: 'contacts', labelField: 'fullName' \}/);
	});

	it('emits the computed label as a display field while selecting only real columns', () => {
		const files = emitter.emit(applyAppSpec(buildMetaModel(tables())));
		const contacts = files.find((file) => file.path === 'src/resources/contacts.ts')?.content ?? '';
		assert.match(contacts, /titleField: 'fullName'/);
		assert.match(contacts, /fullName: \{ name: 'fullName', label: 'Full name', input: 'text', readOnly: true \}/);
		assert.match(contacts, /compositeTitle: \{ name: 'fullName', fields: \['firstName', 'lastName'\] \}/);
		assert.doesNotMatch(contacts, /fullName: true/);
	});
});

describe('AppSpec text in generated code', () => {
	const HOSTILE = `Bob's "quoted" \\ </script>\nline\r\u2028\u2029 \${x} 😀`;
	const spec: AppSpec = {
		version: 1,
		name: HOSTILE,
		tagline: HOSTILE,
		backend: { kind: 'blueprint', slug: 'crm' },
		ui: {
			resources: {
				deals: {
					label: HOSTILE,
					singular: `2nd shift's "x"`,
					// Options on a free-text column: on an enum column only the values _meta allows would stay.
					fields: { title: { label: HOSTILE, description: HOSTILE, options: [`it's`, 'a\\b'] } },
				},
			},
			dashboard: {
				tiles: [
					{ kind: 'count', resource: 'deals', label: HOSTILE },
					{ kind: 'recent', resource: 'deals', label: HOSTILE },
				],
			},
		},
	};

	it('parses, and every string survives exactly', () => {
		const files = emitter.emit(applyAppSpec(buildMetaModel(tables()), spec));
		for (const file of files) {
			const out = ts.transpileModule(file.content, {
				fileName: file.path,
				reportDiagnostics: true,
				compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2022 },
			});
			assert.deepEqual(
				(out.diagnostics ?? []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
				[],
				file.path,
			);
		}
		const literals = (path: string) => {
			const file = files.find((f) => f.path === path) as { content: string };
			const source = ts.createSourceFile(path, file.content, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
			const found: string[] = [];
			const visit = (node: ts.Node) => {
				if (ts.isStringLiteral(node)) found.push(node.text);
				ts.forEachChild(node, visit);
			};
			visit(source);
			return found;
		};
		assert.ok(literals('src/app/(app)/page.tsx').includes(HOSTILE), 'tile labels');
		const dashboard = files.find((f) => f.path === 'src/app/(app)/page.tsx')?.content ?? '';
		assert.match(dashboard, /<RecentRecords .*sort=\{\{ field: 'createdAt', direction: 'desc' \}\}/, 'recent means newest first');
		assert.ok(literals('src/config/app.ts').includes(HOSTILE), 'app name');
		assert.ok(literals('src/resources/deals.ts').includes(HOSTILE), 'labels and help text');
		assert.ok(literals('src/resources/deals.ts').includes(`it's`), 'options');
	});
});
