// Follow-up changes: gen:resources runs again on a database that gained (or lost) a table
// and a field. The evolved fixtures are real `_meta` from databases built from the first
// fixtures' blueprints plus one new table and one new column.

import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';

import type { AppSpec } from '../app-spec.ts';
import { emitter } from '../emitters/nextjs.ts';
import { parseMetaDocument } from '../meta-ir.ts';
import { runGen, STATE_PATH } from '../run.ts';

const FIXTURES = join(import.meta.dirname, '__fixtures__');
const SHELL_NAV = join(import.meta.dirname, '..', '..', 'app', 'config', 'nav.ts');
const readJson = <T>(path: string): T => JSON.parse(readFileSync(join(FIXTURES, path), 'utf8')) as T;
const tables = (path: string) => parseMetaDocument(readJson(path));

/** The file without its first line: what taking ownership leaves. */
function takeOwnership(root: string, path: string, edit = (body: string) => body) {
	const abs = join(root, path);
	const content = readFileSync(abs, 'utf8');
	writeFileSync(abs, edit(content.slice(content.indexOf('\n') + 1)));
}

const foodBankSpec = readJson<AppSpec>('food-bank/app-spec.json');
/** The follow-up the desktop applies: a donations table and a notes column on shifts. */
function evolvedFoodBankSpec(): AppSpec {
	const spec = structuredClone(foodBankSpec);
	if (spec.backend.kind !== 'custom') throw new Error('the food-bank fixture is a custom backend');
	spec.backend.entities.find((entity) => entity.name === 'shifts')?.fields.push({ name: 'notes', type: 'long_text' });
	spec.backend.entities.push({
		name: 'donations',
		fields: [
			{ name: 'donor_name', type: 'text', required: true, label: 'Donor' },
			{ name: 'pounds', type: 'integer' },
			{ name: 'received_on', type: 'date' },
		],
		belongsTo: [{ field: 'location_id', to: 'locations', label: 'Location' }],
	});
	return spec;
}

describe('gen:resources on an evolved database', () => {
	let root: string;
	beforeEach(() => {
		root = mkdtempSync(join(tmpdir(), 'gen-rerun-'));
	});
	afterEach(() => rmSync(root, { recursive: true, force: true }));

	it('adds the new table and field, leaves the app its own files, and hints once', () => {
		runGen({ root, tables: tables('food-bank/meta.json'), spec: foodBankSpec, emitter });
		// The app made its own home screen and added a page with a sidebar link.
		takeOwnership(root, 'src/app/(app)/page.tsx', (body) => body.replace('DashboardPage', 'ScheduleHome'));
		const home = readFileSync(join(root, 'src/app/(app)/page.tsx'), 'utf8');
		mkdirSync(join(root, 'src/app/(app)/upcoming'), { recursive: true });
		writeFileSync(join(root, 'src/app/(app)/upcoming/page.tsx'), 'export default function Upcoming() {\n\treturn null;\n}\n');
		mkdirSync(join(root, 'src/config'), { recursive: true });
		const nav = readFileSync(SHELL_NAV, 'utf8').replace(
			'customNav: CustomNavEntry[] = []',
			"customNav: CustomNavEntry[] = [{ label: 'Upcoming', href: '/upcoming', icon: LayoutDashboardIcon }]",
		);
		writeFileSync(join(root, 'src/config/nav.ts'), nav);

		const evolved = { root, tables: tables('food-bank/meta-evolved.json'), spec: evolvedFoodBankSpec(), emitter };
		const preview = runGen({ ...evolved, dryRun: true });
		assert.equal(preview.hints.length, 1, 'a dry run hints too, and does not use the hint up');
		const second = runGen(evolved);

		for (const path of ['src/resources/donations.ts', 'src/app/(app)/donations/page.tsx', 'src/app/(app)/donations/[id]/page.tsx']) {
			assert.ok(second.files.written.includes(path), path);
		}
		assert.deepEqual(
			second.resources.find((resource) => resource.name === 'donations'),
			{ name: 'donations', route: '/donations', table: 'Donation', tableName: 'donations', model: 'donation', nav: true },
		);
		const registry = readFileSync(join(root, 'src/resources/index.ts'), 'utf8');
		assert.match(registry, /export const nav: string\[\] = \[[^\]]*'donations'/);
		const shifts = readFileSync(join(root, 'src/resources/shifts.ts'), 'utf8');
		assert.match(shifts, /\n\t\tnotes: \{ name: 'notes', label: 'Notes', input: 'textarea' \},/);
		const donations = readFileSync(join(root, 'src/resources/donations.ts'), 'utf8');
		assert.match(donations, /donorName: \{ name: 'donorName', label: 'Donor', input: 'text', required: true \}/);

		assert.equal(readFileSync(join(root, 'src/app/(app)/page.tsx'), 'utf8'), home);
		assert.equal(readFileSync(join(root, 'src/config/nav.ts'), 'utf8'), nav);
		assert.ok(existsSync(join(root, 'src/app/(app)/upcoming/page.tsx')));
		assert.deepEqual(second.hints, [
			{
				path: 'src/app/(app)/page.tsx',
				state: 'owned',
				message: 'src/app/(app)/page.tsx is yours; add the new resource donations to it by hand if needed.',
			},
		]);

		const third = runGen(evolved);
		assert.deepEqual(third.files.written, []);
		assert.deepEqual(third.hints, [], 'nothing new since the last hint');
	});

	it('names the fields an owned config misses, and prunes only untouched files of a dropped table', () => {
		runGen({ root, tables: tables('food-bank/meta.json'), spec: foodBankSpec, emitter });
		takeOwnership(root, 'src/resources/shifts.ts');
		const evolved = runGen({ root, tables: tables('food-bank/meta-evolved.json'), spec: evolvedFoodBankSpec(), emitter });
		assert.deepEqual(evolved.hints, [
			{
				path: 'src/resources/shifts.ts',
				state: 'owned',
				message: 'src/resources/shifts.ts is yours; add the new field notes by hand if needed.',
			},
		]);

		// The app customised the donations detail page and edited its config, then the table went away.
		takeOwnership(root, 'src/app/(app)/donations/[id]/page.tsx');
		const config = join(root, 'src/resources/donations.ts');
		writeFileSync(config, readFileSync(config, 'utf8').replace("label: 'Donations'", "label: 'Gifts'"));
		const dropped = runGen({ root, tables: tables('food-bank/meta.json'), spec: foodBankSpec, emitter });

		assert.deepEqual(dropped.files.removed, ['src/app/(app)/donations/page.tsx']);
		assert.ok(existsSync(join(root, 'src/app/(app)/donations/[id]/page.tsx')));
		assert.match(readFileSync(config, 'utf8'), /label: 'Gifts'/);
		assert.deepEqual(
			dropped.hints.map((hint) => [hint.path, hint.state]),
			[
				['src/app/(app)/donations/[id]/page.tsx', 'owned'],
				['src/resources/donations.ts', 'modified'],
				['src/resources/shifts.ts', 'owned'],
			],
		);
		assert.match(dropped.hints[0]?.message ?? '', /gen no longer generates it/);
		assert.match(dropped.hints[2]?.message ?? '', /remove notes, which the table no longer has/);
		assert.ok(!readFileSync(join(root, 'src/resources/index.ts'), 'utf8').includes('donations'));
		assert.deepEqual(runGen({ root, tables: tables('food-bank/meta.json'), spec: foodBankSpec, emitter }).hints, []);
	});

	it('applies backend.extend to a curated blueprint: a new table and a new select column', () => {
		const spec = readJson<AppSpec>('agent/app-spec.json');
		runGen({ root, tables: tables('agent/meta.json'), spec, emitter });

		const extended: AppSpec = {
			...spec,
			backend: {
				kind: 'blueprint',
				slug: 'agent',
				extend: {
					entities: [
						{
							name: 'agent_note',
							fields: [
								{ name: 'body', type: 'long_text', required: true },
								{ name: 'pinned', type: 'boolean', default: false },
							],
							belongsTo: [{ field: 'thread_id', to: 'agent_thread', label: 'Thread' }],
						},
					],
					fields: { agent_task: [{ name: 'priority', type: 'text', enum: ['low', 'normal', 'high'] }] },
				},
			},
			ui: {
				...spec.ui,
				resources: {
					...spec.ui?.resources,
					agent_note: { label: 'Notes', fields: { entity_id: { hidden: true, required: false } } },
				},
			},
		};
		const second = runGen({ root, tables: tables('agent/meta-evolved.json'), spec: extended, emitter });

		assert.deepEqual(second.warnings, []);
		const notes = readFileSync(join(root, 'src/resources/agent-notes.ts'), 'utf8');
		assert.match(notes, /body: \{ name: 'body', label: 'Body', input: 'textarea', required: true \}/);
		assert.match(notes, /threadId: \{\n\t+name: 'threadId',\n\t+label: 'Thread',/);
		const tasks = readFileSync(join(root, 'src/resources/agent-tasks.ts'), 'utf8');
		assert.match(tasks, /priority: \{\n\t+name: 'priority',\n\t+label: 'Priority',\n\t+input: 'select',/);
		assert.match(tasks, /\{ value: 'normal', label: 'Normal' \}/);
		assert.ok(readFileSync(join(root, STATE_PATH), 'utf8').includes('"agent-notes"'));
	});
});
