// Next.js App Router emitter: resource configs, the registry, list/detail
// routes, the dashboard and the app config. Everything else in the shell is
// hand-written; these files are the part that follows the database.

import type { AppModel, DashboardTile } from '../app-spec.ts';
import { GENERATED_HEADER, type EmittedFile, type Emitter, type FileSubject } from '../emitter.ts';
import type { FieldIR, ResourceIR } from '../meta-ir.ts';
import { identifier, normalizeKey, pascalCase } from '../names.ts';
import { code, quote, tsLiteral } from '../ts-literal.ts';

// Route segments the shell already owns. A table that would land on one gets a suffix.
const RESERVED_SEGMENTS = new Set([
	'account',
	'sign-in',
	'sign-up',
	'check-email',
	'verify-email',
	'forgot-password',
	'reset-password',
	'api',
]);

// Bindings the generated modules import; a resource binding must not shadow them.
const RESERVED_BINDINGS = new Set(['db', 'ormSource', 'defineResource', 'currentUserId', 'resources', 'resourcePaths', 'resourceIcons', 'nav']);

export function routeSegment(ir: ResourceIR): string {
	return RESERVED_SEGMENTS.has(ir.name) ? `${ir.name}-records` : ir.name;
}

/** A component name from the route name (never from AppSpec text, which can be anything). */
function componentName(ir: ResourceIR, suffix: string): string {
	const base = pascalCase(ir.name).replace(/[^A-Za-z0-9_$]/g, '') || 'Resource';
	return `${/^[0-9]/.test(base) ? `_${base}` : base}${suffix}`;
}

function binding(ir: ResourceIR): string {
	const name = identifier(ir.name);
	return RESERVED_BINDINGS.has(name) ? `${name}Resource` : name;
}

function file(path: string, subject: FileSubject, body: string): EmittedFile {
	return { path, subject, content: `${GENERATED_HEADER}\n${body.trimEnd()}\n` };
}

function fieldConfig(field: FieldIR): Record<string, unknown> {
	return {
		name: field.name,
		label: field.label,
		input: field.input,
		format: field.format,
		required: field.required || undefined,
		readOnly: field.readOnly || undefined,
		hidden: field.hidden || undefined,
		description: field.description,
		options: field.options?.map((option) => ({
			value: option.value,
			label: option.label,
			tone: option.tone === 'neutral' ? undefined : option.tone,
		})),
		relation: field.relation,
	};
}

function resourceModule(ir: ResourceIR): EmittedFile {
	const fields = ir.fields.filter((field) => field.selectable || field.relation?.many);
	const select = Object.fromEntries(
		[ir.primaryKey, ...fields.filter((f) => f.selectable && f.name !== ir.primaryKey).map((f) => f.name)].map(
			(name) => [name, true],
		),
	);
	const manyToMany = ir.manyToMany.length
		? Object.fromEntries(
				ir.manyToMany.map((link) => [
					link.field,
					{
						junction: code(`db.${link.junction.model}`),
						primaryKey: link.junction.primaryKey === 'id' ? undefined : link.junction.primaryKey,
						sourceKey: link.junction.sourceKey,
						targetKey: link.junction.targetKey,
					},
				]),
			)
		: undefined;
	const definition = {
		name: ir.name,
		label: ir.label,
		singular: ir.singular,
		icon: ir.icon,
		primaryKey: ir.primaryKey,
		titleField: ir.titleField,
		columns: ir.columns,
		formFields: ir.formFields,
		detailFields: ir.detailFields,
		searchFields: ir.searchFields,
		defaultSort: ir.defaultSort,
		fields: Object.fromEntries(fields.map((field) => [field.name, fieldConfig(field)])),
		source: code(
			`ormSource(db.${ir.model}, ${tsLiteral(
				{
					select,
					primaryKey: ir.primaryKey === 'id' ? undefined : ir.primaryKey,
					searchFields: ir.searchFields.length ? ir.searchFields : undefined,
					bigNumbers: ir.bigNumbers.length ? ir.bigNumbers : undefined,
					userKeys: ir.userKeys.length ? ir.userKeys : undefined,
					currentUserId: ir.userKeys.length ? code('currentUserId') : undefined,
					createDefaults: Object.keys(ir.createDefaults).length ? ir.createDefaults : undefined,
					createOnly: ir.createOnly.length ? ir.createOnly : undefined,
					serverDefaults: ir.serverDefaults.length ? ir.serverDefaults : undefined,
					keepWhenEmpty: ir.keepWhenEmpty.length ? ir.keepWhenEmpty : undefined,
					manyToMany,
				},
				1,
			)})`,
		),
	};
	return file(
		`src/resources/${ir.name}.ts`,
		{ kind: 'resource', resource: ir.name },
		`import { defineResource } from '@/components/ui/resource-kit';
${ir.userKeys.length ? "import { currentUserId } from '@/lib/auth/token-manager';\n" : ''}import { db } from '@/lib/graphql/db';
import { ormSource } from '@/lib/resources/orm-source';

export const ${binding(ir)} = defineResource(${tsLiteral(definition)});
`,
	);
}

function iconBinding(name: string | undefined): string {
	return `${pascalCase(name ?? '')}Icon`;
}

function registryModule(model: AppModel): EmittedFile {
	const iconNames = [...new Set(model.resources.map((ir) => ir.icon ?? ''))].filter(Boolean).sort();
	const imports = [...model.resources]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((ir) => `import { ${binding(ir)} } from './${ir.name}';`);
	const header = [
		iconNames.length
			? `import { ${iconNames.map(iconBinding).join(', ')}, type LucideIcon } from 'lucide-react';\n`
			: `import type { LucideIcon } from 'lucide-react';\n`,
		`import type { ResourceDefinition } from '@/components/ui/resource-kit';`,
		imports.length ? `\n${imports.join('\n')}` : '',
	]
		.filter(Boolean)
		.join('\n');
	return file(
		'src/resources/index.ts',
		{ kind: 'registry' },
		`${header}

/** Every resource the app manages, sidebar resources first. */
export const resources: ResourceDefinition[] = ${tsLiteral(model.resources.map((ir) => code(binding(ir))))};

/** Route of each resource's list page. */
export const resourcePaths: Record<string, string> = ${tsLiteral(
			Object.fromEntries(model.resources.map((ir) => [ir.name, `/${routeSegment(ir)}`])),
		)};

/** Icon components for the names resources use. */
export const resourceIcons: Record<string, LucideIcon> = ${tsLiteral(
			Object.fromEntries(iconNames.map((name) => [name, code(iconBinding(name))])),
		)};

/** Resources in the sidebar, in order. */
export const nav: string[] = ${tsLiteral(model.nav)};
`,
	);
}

function listPage(ir: ResourceIR): EmittedFile {
	return file(
		`src/app/(app)/${routeSegment(ir)}/page.tsx`,
		{ kind: 'page', resource: ir.name },
		`import { ResourcePage } from '@/components/ui/resource-kit';

export default function ${componentName(ir, 'Page')}() {
	return <ResourcePage resource={${quote(ir.name)}} />;
}
`,
	);
}

function detailPage(ir: ResourceIR): EmittedFile {
	return file(
		`src/app/(app)/${routeSegment(ir)}/[id]/page.tsx`,
		{ kind: 'page', resource: ir.name },
		`import { RecordDetail } from '@/components/ui/resource-kit';

export default async function ${componentName(ir, 'DetailPage')}({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return <RecordDetail resource={${quote(ir.name)}} id={id} />;
}
`,
	);
}

function tileElement(tile: DashboardTile, model: AppModel): string {
	if (tile.kind === 'recent') {
		// "Recent" means newest first, whatever the list's own default sort is.
		const createdAt = model.resources
			.find((ir) => ir.name === tile.resource)
			?.fields.find((field) => normalizeKey(field.name) === 'createdat' && field.selectable);
		const sort = createdAt ? ` sort={{ field: ${quote(createdAt.name)}, direction: 'desc' }}` : '';
		return `<RecentRecords resource={${quote(tile.resource)}} title={${quote(tile.label)}} limit={${tile.limit}}${sort} />`;
	}
	const filters = tile.filters ? ` filters={${tsLiteral(tile.filters, 3)}}` : '';
	// Text from the AppSpec goes into JSX as an expression: string attributes have no escapes.
	return `<ResourceCountTile resource={${quote(tile.resource)}} label={${quote(tile.label)}}${filters} />`;
}

function dashboardPage(model: AppModel): EmittedFile {
	const hasCounts = model.dashboard.some((tile) => tile.kind === 'count');
	const hasRecents = model.dashboard.some((tile) => tile.kind === 'recent');
	const empty = model.dashboard.length === 0;
	// Icons are components, which only a client component can hand to the workspace kit.
	const imports = [
		`'use client';`,
		'',
		`import { ${empty ? 'DatabaseIcon, ' : ''}LayoutDashboardIcon } from 'lucide-react';`,
		'',
		empty
			? null
			: `import { ${['DashboardGrid', hasRecents && 'RecentRecords', hasCounts && 'ResourceCountTile'].filter(Boolean).join(', ')} } from '@/components/ui/dashboard-tiles';`,
		`import { ${empty ? 'EmptyState, ' : ''}ViewFrame } from '@/components/ui/workspace-kit';`,
		`import { appConfig } from '@/config/app';`,
	].filter((line) => line !== null);
	const body = empty
		? `<EmptyState
				icon={DatabaseIcon}
				title='No tables yet'
				description='Add tables to the database, then run codegen and gen:resources to fill this app.'
			/>`
		: `<DashboardGrid>
				${model.dashboard.map((tile) => tileElement(tile, model)).join('\n\t\t\t\t')}
			</DashboardGrid>`;
	return file(
		'src/app/(app)/page.tsx',
		{ kind: 'dashboard' },
		`${imports.join('\n')}

export default function DashboardPage() {
	return (
		<ViewFrame icon={LayoutDashboardIcon} title={appConfig.name}>
			${body}
		</ViewFrame>
	);
}
`,
	);
}

function appConfigModule(model: AppModel): EmittedFile {
	return file(
		'src/config/app.ts',
		{ kind: 'app' },
		`export const appConfig = ${tsLiteral({ name: model.app.name, tagline: model.app.tagline ?? '' })};
`,
	);
}

export const emitter: Emitter = {
	name: 'nextjs',
	pruneRoots: ['src/resources', 'src/app/(app)'],
	// Route types and the page validator Next writes for dev and build; stale after a route is removed.
	derivedPaths: ['.next/types', '.next/dev/types'],
	sdkInputTypes: 'src/graphql/sdk/app/orm/input-types.ts',
	route: (ir) => `/${routeSegment(ir)}`,
	emit(model) {
		return [
			appConfigModule(model),
			registryModule(model),
			dashboardPage(model),
			...model.resources.flatMap((ir) => [resourceModule(ir), listPage(ir), detailPage(ir)]),
		];
	},
};
