import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { applySpec, type AppSpec } from '../app-spec.ts';
import { buildMetaModel, parseMetaDocument, type MetaField, type MetaTable, type ResourceIR } from '../meta-ir.ts';

// A hand-written CRM `_meta` with what the live fixture doesn't exercise:
// enum values, a junction named by manyToMany, storage tables, BigFloat.
const FIXTURE = join(import.meta.dirname, '__fixtures__', 'crm-meta.json');
// `_meta` and the AppSpec of a real custom database on the local stack.
const FOOD_BANK = join(import.meta.dirname, '__fixtures__', 'food-bank');
// `_meta` and AppSpec of the curated agent blueprint on the local stack.
const AGENT = join(import.meta.dirname, '__fixtures__', 'agent');
const readJson = (path: string) => JSON.parse(readFileSync(path, 'utf8'));

function loadTables(): MetaTable[] {
	return parseMetaDocument(JSON.parse(readFileSync(FIXTURE, 'utf8')));
}

function resource(resources: ResourceIR[], name: string): ResourceIR {
	const found = resources.find((ir) => ir.name === name);
	assert.ok(found, `resource ${name}`);
	return found;
}

function field(ir: ResourceIR, name: string) {
	const found = ir.fields.find((f) => f.name === name);
	assert.ok(found, `field ${ir.name}.${name}`);
	return found;
}

/** A `_meta` field: NOT NULL with no default unless `more` says otherwise. */
function column(name: string, gqlType: string, pgType: string, more: Partial<MetaField> = {}): MetaField {
	return { name, isNotNull: true, hasDefault: false, type: { gqlType, isArray: false, pgType }, ...more };
}

describe('a real custom database (food bank)', () => {
	const tables = () => parseMetaDocument(JSON.parse(readFileSync(join(FOOD_BANK, 'meta.json'), 'utf8')));
	const spec = JSON.parse(readFileSync(join(FOOD_BANK, 'app-spec.json'), 'utf8')) as AppSpec;

	it('finds the signup junction by its keys alone and links shifts and volunteers through it', () => {
		const { resources, junctions } = buildMetaModel(tables());
		assert.deepEqual(junctions, [{ table: 'ShiftSignup', between: ['shifts', 'volunteers'] }]);
		assert.deepEqual(resource(resources, 'shifts').manyToMany[0], {
			field: 'volunteers',
			target: 'volunteers',
			junction: { table: 'ShiftSignup', model: 'shiftSignup', primaryKey: 'id', sourceKey: 'shiftId', targetKey: 'volunteerId' },
		});
		// References here name the GraphQL type ("Location"), not the SQL table.
		assert.deepEqual(field(resource(resources, 'shifts'), 'locationId').relation, { resource: 'locations' });
	});

	it('applies the AppSpec: labels, nav order, icons, columns and the dashboard', () => {
		const app = applySpec(buildMetaModel(tables()), spec);
		const shifts = resource(app.resources, 'shifts');
		assert.deepEqual(app.nav, ['shifts', 'volunteers', 'locations']);
		assert.equal(shifts.icon, 'calendar-clock');
		assert.deepEqual(shifts.columns, ['title', 'startsAt', 'endsAt', 'locationId', 'status']);
		assert.equal(field(shifts, 'startsAt').label, 'Starts');
		assert.equal(field(resource(app.resources, 'locations'), 'address').input, 'textarea');
		assert.equal(field(resource(app.resources, 'volunteers'), 'email').input, 'email');
		assert.deepEqual(app.dashboard[1], {
			kind: 'count',
			resource: 'volunteers',
			label: 'Active volunteers',
			filters: { active: true },
		});
		assert.deepEqual(app.warnings, []);
	});

	it('shows help text from the AppSpec only, never the schema comments in _meta', () => {
		const metaTables = tables();
		assert.ok(metaTables.some((t) => t.fields?.some((f) => f.description && !/owner|created|updated/i.test(f.name))));
		const bare = buildMetaModel(metaTables);
		assert.ok(bare.resources.every((ir) => ir.fields.every((f) => f.description === undefined)));

		const shifts = resource(applySpec(buildMetaModel(tables()), spec).resources, 'shifts');
		assert.equal(field(shifts, 'slots').description, 'How many volunteers this shift needs.');
		assert.equal(field(shifts, 'status').description, undefined);
	});
});

describe('a curated blueprint (agent) with per-field AppSpec hints', () => {
	const tables = () => parseMetaDocument(readJson(join(AGENT, 'meta.json')));

	it('fills only the entity key the spec marks $currentUserId, not the ones a trigger fills', () => {
		const bare = buildMetaModel(tables());
		assert.deepEqual(
			bare.resources.map((ir) => [ir.name, ir.userKeys]),
			[
				['agent-tasks', ['entityId']],
				['agent-threads', ['entityId']],
				['agent-messages', ['entityId']],
			],
			'without hints, every required hidden entity key is filled',
		);

		const app = applySpec(buildMetaModel(tables()), readJson(join(AGENT, 'app-spec.json')) as AppSpec);
		assert.deepEqual(resource(app.resources, 'agent-threads').userKeys, ['entityId']);

		const served = tables();
		const message = served.find((t) => t.name === 'AgentMessage') as MetaTable;
		const entityId = message.fields?.find((f) => f.name === 'entityId');
		if (entityId) entityId.isRequiredOnCreate = false;
		assert.deepEqual(
			resource(buildMetaModel(served).resources, 'agent-messages').userKeys,
			[],
			'_meta isRequiredOnCreate: false (trigger-filled) beats the name fallback',
		);
		assert.deepEqual(resource(app.resources, 'agent-messages').userKeys, []);
		assert.deepEqual(resource(app.resources, 'agent-tasks').userKeys, []);
		assert.equal(field(resource(app.resources, 'agent-threads'), 'entityId').hidden, true);
		assert.ok(!resource(app.resources, 'agent-threads').formFields.includes('entityId'));
		assert.deepEqual(app.nav, ['agent-threads', 'agent-tasks', 'agent-messages']);

		// A role or a source names a category, not a row: tasks are named by what they are,
		// messages by their thread, never "user" or "agent" on every row.
		const titles = Object.fromEntries(app.resources.map((ir) => [ir.name, ir.titleField]));
		assert.deepEqual(titles, { 'agent-threads': 'title', 'agent-tasks': 'description', 'agent-messages': 'threadId' });
		assert.equal(resource(app.resources, 'agent-tasks').columns[0], 'description');
	});

	it('lets field hints override what _meta says, except the values a column allows, and literal defaults go to creates', () => {
		const metaTables = tables();
		const thread = metaTables.find((t) => t.name === 'AgentThread') as MetaTable;
		const status = thread.fields?.find((f) => f.name === 'status');
		if (status) status.allowedValues = ['active', 'archived'];
		const spec: AppSpec = {
			version: 1,
			name: 'Agent',
			backend: { kind: 'blueprint', slug: 'agent' },
			ui: {
				resources: {
					agent_thread: {
						fields: {
							status: { options: ['active', 'paused', 'archived'], label: 'State' },
							mode: { default: 'ask', hidden: true },
							title: { required: true },
						},
					},
				},
			},
		};
		const app = applySpec(buildMetaModel(metaTables), spec);
		const ir = resource(app.resources, 'agent-threads');
		// The database rejects "paused", so a select offering it would only fail on save.
		assert.deepEqual(
			field(ir, 'status').options?.map((o) => o.value),
			['active', 'archived'],
		);
		assert.deepEqual(app.warnings, ['ui.resources."agent_thread".fields.status: dropped the options "paused", which the database doesn\'t allow.']);
		assert.equal(field(ir, 'status').label, 'State');
		assert.deepEqual(ir.createDefaults, { mode: 'ask' });
		assert.ok(!ir.formFields.includes('mode'));
		assert.equal(field(ir, 'title').required, true);
	});
});

describe('an AppSpec the database no longer matches', () => {
	const foodBank = () => parseMetaDocument(readJson(join(FOOD_BANK, 'meta.json')));
	const foodBankSpec = () => readJson(join(FOOD_BANK, 'app-spec.json')) as AppSpec;

	it('reports every name the spec uses that _meta lacks, and nothing for the ones it has', () => {
		const spec = foodBankSpec();
		if (spec.backend.kind !== 'custom') throw new Error('the food-bank fixture is a custom backend');
		const shifts = spec.backend.entities.find((entity) => entity.name === 'shifts');
		shifts?.fields.push({ name: 'notes', type: 'long_text' });
		shifts?.belongsTo?.push({ field: 'driver_id', to: 'volunteers' });
		spec.backend.entities.push({ name: 'donations', fields: [{ name: 'pounds', type: 'integer' }] });
		spec.backend.links?.push({ between: ['shifts', 'locations'] });
		if (spec.ui?.resources?.shifts) {
			spec.ui.resources.shifts.columns?.push('notes');
			spec.ui.resources.shifts.fields = { ...spec.ui.resources.shifts.fields, notes: { label: 'Notes' } };
		}

		const app = applySpec(buildMetaModel(foodBank()), spec);
		assert.deepEqual(
			app.gaps.map((gap) => [gap.path, gap.name]),
			[
				['backend.entities.shifts.fields', 'notes'],
				['backend.entities.shifts.belongsTo', 'driver_id'],
				['backend.entities', 'donations'],
				['backend.links', 'shifts,locations'],
				['ui.resources.shifts.fields', 'notes'],
				['ui.resources.shifts.columns', 'notes'],
			],
			'the shift_signups link has its junction, so it is no gap',
		);
		for (const gap of app.gaps) assert.ok(app.warnings.includes(gap.message), gap.message);

		const agent = readJson(join(AGENT, 'app-spec.json')) as AppSpec;
		agent.backend = {
			kind: 'blueprint',
			slug: 'agent',
			extend: {
				fields: { agent_task: [{ name: 'priority', type: 'text' }] },
				belongsTo: { agent_task: [{ field: 'project_id', to: 'agent_thread' }], agent_project: [{ field: 'owner_id', to: 'agent_thread' }] },
				links: [{ name: 'task_threads', between: ['agent_task', 'agent_thread'] }],
			},
		};
		assert.deepEqual(
			applySpec(buildMetaModel(parseMetaDocument(readJson(join(AGENT, 'meta.json')))), agent).gaps.map((gap) => [gap.path, gap.name]),
			[
				['backend.extend.fields.agent_task', 'priority'],
				['backend.extend.belongsTo.agent_task', 'project_id'],
				['backend.extend', 'agent_project'],
				['backend.extend.links', 'task_threads'],
			],
		);
	});

	/** shifts.status with `_meta` serving `allowed` (absent: the endpoint doesn't serve allowedValues), and a spec enum. */
	function shiftStatus(allowed: string[] | null | 'absent', specEnum: string[]) {
		const tables = foodBank();
		const status = tables.find((t) => t.name === 'Shift')?.fields?.find((f) => f.name === 'status') as MetaField;
		if (allowed !== 'absent') status.allowedValues = allowed;
		const spec = foodBankSpec();
		if (spec.backend.kind !== 'custom') throw new Error('the food-bank fixture is a custom backend');
		spec.backend.entities.find((entity) => entity.name === 'shifts')?.fields.push({ name: 'status', type: 'text', enum: specEnum });
		delete spec.ui?.resources?.shifts?.fields?.status;
		const app = applySpec(buildMetaModel(tables), spec);
		return { status: field(resource(app.resources, 'shifts'), 'status'), warnings: app.warnings, gaps: app.gaps };
	}

	it('takes enum values from _meta over a spec enum that differs, keeping the spec order for the same set', () => {
		const same = shiftStatus(['open', 'full', 'cancelled'], ['cancelled', 'open', 'full']);
		assert.deepEqual(same.status.options?.map((o) => o.value), ['cancelled', 'open', 'full']);
		assert.deepEqual(same.warnings, []);

		const changed = shiftStatus(['open', 'full', 'closed'], ['open', 'full', 'cancelled']);
		assert.deepEqual(changed.status.options?.map((o) => o.value), ['open', 'full', 'closed']);
		assert.deepEqual(changed.warnings, [
			'backend.entities.shifts.fields.status: the enum differs from the database (added "closed"; removed "cancelled"); using the database\'s values.',
		]);
		assert.deepEqual(changed.gaps, [], 'a different enum is a conflict, not a missing name');
	});

	it('ignores a spec enum when _meta says the column allows any value, and keeps it when the endpoint does not say', () => {
		const free = shiftStatus(null, ['open', 'full']);
		assert.equal(free.status.input, 'text');
		assert.equal(free.status.options, undefined);
		assert.match(free.warnings.join('\n'), /status: the enum "open", "full" is ignored: the database allows any value/);

		const unknown = shiftStatus('absent', ['open', 'full']);
		assert.equal(unknown.status.input, 'select');
		assert.deepEqual(unknown.status.options?.map((o) => o.value), ['open', 'full']);
		assert.deepEqual(unknown.warnings, []);
	});
});

describe('newer _meta fields, when the endpoint serves them', () => {
	it('prefers allowedValues, isRequiredOnCreate, isWritableOn* and isJunction over the heuristics', () => {
		const tables = loadTables();
		const deal = tables.find((t) => t.name === 'Deal') as MetaTable;
		const title = deal.fields?.find((f) => f.name === 'title');
		if (title) title.allowedValues = ['small', 'large'];
		const contactId = deal.fields?.find((f) => f.name === 'contactId');
		if (contactId) Object.assign(contactId, { isRequiredOnCreate: false, isWritableOnUpdate: false });
		const contactTag = tables.find((t) => t.name === 'ContactTag') as MetaTable;
		contactTag.isJunction = false;

		const { resources, junctions } = buildMetaModel(tables);
		const deals = resource(resources, 'deals');
		assert.deepEqual(
			field(deals, 'title').options?.map((o) => o.value),
			['small', 'large'],
		);
		assert.equal(field(deals, 'contactId').required, false);
		assert.deepEqual(deals.createOnly, ['contactId']);
		assert.deepEqual(junctions, [], 'isJunction: false wins over the two-key shape');
		assert.ok(resources.some((ir) => ir.table === 'ContactTag'));
	});
});

describe('junction tables', () => {
	it('turns a junction into many-to-many fields on both sides and keeps it out of the resources', () => {
		const { resources, junctions } = buildMetaModel(loadTables());
		assert.deepEqual(
			resources.map((ir) => ir.name),
			['companies', 'contacts', 'deals', 'tags'],
		);
		assert.deepEqual(junctions, [{ table: 'ContactTag', between: ['contacts', 'tags'] }]);

		const contacts = resource(resources, 'contacts');
		assert.deepEqual(field(contacts, 'tags').relation, { resource: 'tags', many: true });
		assert.deepEqual(contacts.manyToMany, [
			{
				field: 'tags',
				target: 'tags',
				junction: { table: 'ContactTag', model: 'contactTag', primaryKey: 'id', sourceKey: 'contactId', targetKey: 'tagId' },
			},
		]);
		assert.equal(resource(resources, 'tags').manyToMany[0].junction.sourceKey, 'tagId');
		assert.deepEqual(field(resource(resources, 'tags'), 'contacts').relation, { resource: 'contacts', many: true });
	});

	it('detects a two-key table as a junction even when no many-to-many relation names it', () => {
		const tables = loadTables();
		for (const table of tables) if (table.relations) table.relations.manyToMany = [];
		const { resources, junctions } = buildMetaModel(tables);
		assert.equal(junctions.length, 1);
		assert.ok(!resources.some((ir) => ir.table === 'ContactTag'));
	});

	/** students and courses linked by enrollments(studentId, courseId, ...extra), which `_meta` flags and names as a junction. */
	function enrollments(extra: MetaField[]): MetaTable[] {
		const id = column('id', 'UUID', 'uuid', { hasDefault: true, isPrimaryKey: true });
		const entity = (name: string, all: string, other: string): MetaTable => ({
			name,
			query: { all, create: `create${name}` },
			inflection: { tableType: name },
			fields: [id, column('name', 'String', 'text')],
			relations: { manyToMany: [{ fieldName: other, junctionTable: { name: 'enrollments' }, rightTable: { name: other } }] },
		});
		return [
			entity('Student', 'students', 'courses'),
			entity('Course', 'courses', 'students'),
			{
				name: 'Enrollment',
				tableName: 'enrollments',
				isJunction: true,
				query: { all: 'enrollments', create: 'createEnrollment' },
				inflection: { tableType: 'Enrollment' },
				fields: [id, column('studentId', 'UUID', 'uuid', { isForeignKey: true }), column('courseId', 'UUID', 'uuid', { isForeignKey: true }), ...extra],
				relations: {
					belongsTo: [
						{ fieldName: 'student', keys: [{ name: 'studentId' }], references: { name: 'Student' } },
						{ fieldName: 'course', keys: [{ name: 'courseId' }], references: { name: 'Course' } },
					],
				},
			},
		];
	}

	it('gives a two-key table with a value of its own a page, even when _meta calls it a junction', () => {
		for (const grade of [
			column('grade', 'String', 'text', { isNotNull: false }),
			column('grade', 'String', 'text', { hasDefault: true }),
		]) {
			const { resources, junctions } = buildMetaModel(enrollments([grade]));
			assert.deepEqual(junctions, []);
			const ir = resource(resources, 'enrollments');
			assert.ok(ir.formFields.includes('grade'), 'grade can be seen and edited');
			assert.equal(field(ir, 'studentId').input, 'relation');
		}

		const link = buildMetaModel(enrollments([]));
		assert.deepEqual(link.junctions, [{ table: 'Enrollment', between: ['students', 'courses'] }], 'a pure link table is still chips');
		assert.deepEqual(field(resource(link.resources, 'students'), 'courses').relation, { resource: 'courses', many: true });
	});

	it('keeps a named junction that needs its own value as an entity', () => {
		const tables = loadTables();
		const contactTag = tables.find((t) => t.name === 'ContactTag') as MetaTable;
		contactTag.fields?.unshift({
			name: 'weight',
			isNotNull: true,
			hasDefault: false,
			type: { gqlType: 'Int', isArray: false, pgType: 'int4' },
		});
		const { resources, junctions } = buildMetaModel(tables);
		assert.equal(junctions.length, 0);
		const ir = resource(resources, 'contact-tags');
		assert.equal(field(ir, 'contactId').input, 'relation');
		assert.equal(ir.inNav, true);
		assert.equal(ir.titleField, 'contactId', 'no text column: titled by its first relation');

		// An optional note is empty on most rows; the required relation names every row.
		contactTag.fields?.push({ name: 'notes', isNotNull: false, hasDefault: false, type: { gqlType: 'String', isArray: false, pgType: 'text' } });
		assert.equal(resource(buildMetaModel(tables).resources, 'contact-tags').titleField, 'contactId');
	});
});

describe('fields', () => {
	it('maps enums to select options with labels and tones', () => {
		const deals = resource(buildMetaModel(loadTables()).resources, 'deals');
		const stage = field(deals, 'stage');
		assert.equal(stage.input, 'select');
		assert.deepEqual(stage.options, [
			{ value: 'open', label: 'Open', tone: 'info' },
			{ value: 'won', label: 'Won', tone: 'success' },
			{ value: 'lost', label: 'Lost', tone: 'danger' },
		]);
	});

	it('requires only not-null columns without a default', () => {
		const { resources } = buildMetaModel(loadTables());
		const contacts = resource(resources, 'contacts');
		assert.equal(field(contacts, 'firstName').required, true);
		assert.equal(field(contacts, 'lastName').required, false);
		assert.equal(field(contacts, 'status').required, false, 'not null with a default');
		assert.deepEqual(contacts.keepWhenEmpty, ['status'], 'an empty choice must not null it');
		assert.deepEqual(contacts.serverDefaults, ['status']);
		assert.equal(field(resource(resources, 'deals'), 'contactId').required, true);
	});

	it('hides keys and owners, shows timestamps read-only, and keeps all of them out of forms', () => {
		const tables = loadTables();
		const deal = tables.find((t) => t.name === 'Deal') as MetaTable;
		deal.scope = { keyColumn: 'contactId' };
		const { resources } = buildMetaModel(tables);
		const contacts = resource(resources, 'contacts');
		assert.equal(field(contacts, 'id').hidden, true);
		assert.equal(field(contacts, 'ownerId').hidden, true);
		assert.equal(field(contacts, 'createdAt').readOnly, true);
		assert.equal(field(contacts, 'createdAt').hidden, false);
		for (const system of ['id', 'ownerId', 'createdAt', 'updatedAt']) {
			assert.ok(!contacts.formFields.includes(system), `${system} not in the form`);
			assert.ok(!contacts.columns.includes(system), `${system} not a column`);
		}
		assert.equal(field(resource(resources, 'deals'), 'contactId').hidden, true, 'scope key is system');
	});

	it('marks required owner and entity keys for the signed-in user, and leaves defaulted ones alone', () => {
		const tables = loadTables();
		const company = tables.find((t) => t.name === 'Company') as MetaTable;
		company.fields?.push({
			name: 'entityId',
			isNotNull: true,
			hasDefault: false,
			type: { gqlType: 'UUID', isArray: false, pgType: 'uuid' },
		});
		const { resources } = buildMetaModel(tables);
		assert.deepEqual(resource(resources, 'companies').userKeys, ['entityId']);
		assert.deepEqual(resource(resources, 'contacts').userKeys, [], 'ownerId has a default');
	});

	it('resolves belongs-to keys whose references use the SQL table name', () => {
		const contacts = resource(buildMetaModel(loadTables()).resources, 'contacts');
		const company = field(contacts, 'companyId');
		assert.equal(company.input, 'relation');
		assert.deepEqual(company.relation, { resource: 'companies' });
		assert.equal(company.label, 'Company');
	});

	it('searches text columns only, not a domain over text the filter input leaves out', () => {
		const tables = loadTables();
		const contact = tables.find((t) => t.name === 'Contact') as MetaTable;
		const email = contact.fields?.find((f) => f.name === 'email');
		if (email?.type) email.type.pgType = 'email';
		const contacts = resource(buildMetaModel(tables).resources, 'contacts');
		assert.equal(field(contacts, 'email').input, 'email', 'still an email input');
		assert.ok(!contacts.searchFields.includes('email'));
		assert.ok(contacts.searchFields.includes('firstName'));
	});

	it('sends big numbers as strings and skips storage tables', () => {
		const model = buildMetaModel(loadTables());
		assert.deepEqual(resource(model.resources, 'deals').bigNumbers, ['amount']);
		assert.deepEqual(
			model.skipped.map((s) => s.table),
			['Bucket', 'File'],
		);
	});
});

describe('naming', () => {
	it('names resources from query.all and inflection, never by pluralizing', () => {
		const tables = loadTables();
		const deal = tables.find((t) => t.name === 'Deal') as MetaTable;
		deal.name = 'VolunteerShift';
		deal.query = { ...deal.query, all: 'volunteerShifts' };
		deal.inflection = { ...deal.inflection, tableType: 'VolunteerShift' };
		const tag = tables.find((t) => t.name === 'Tag') as MetaTable;
		tag.query = { ...tag.query, all: 'tagz' };

		const { resources } = buildMetaModel(tables);
		const shifts = resource(resources, 'volunteer-shifts');
		assert.equal(shifts.label, 'Volunteer shifts');
		assert.equal(shifts.singular, 'Volunteer shift');
		assert.equal(shifts.model, 'volunteerShift');
		assert.equal(shifts.queryAll, 'volunteerShifts');
		assert.equal(resource(resources, 'tagz').label, 'Tagz');
	});

	it('picks a title field and a newest-first default sort', () => {
		const { resources } = buildMetaModel(loadTables());
		assert.equal(resource(resources, 'companies').titleField, 'name');
		assert.equal(resource(resources, 'contacts').titleField, 'firstName');
		assert.deepEqual(resource(resources, 'contacts').defaultSort, { field: 'createdAt', direction: 'desc' });
	});
});

describe('AppSpec overlay', () => {
	const spec: AppSpec = {
		version: 1,
		name: 'Pipeline',
		backend: {
			kind: 'custom',
			entities: [
				{
					name: 'contacts',
					fields: [
						{ name: 'phone', type: 'text', enum: ['mobile', 'work'] },
						{ name: 'notes', type: 'long_text' },
					],
				},
				{ name: 'deals', fields: [{ name: 'amount', type: 'money' }] },
			],
		},
		ui: {
			nav: ['deals'],
			resources: { companies: { hidden: true }, deals: { columns: ['title', 'close_date'], icon: 'not-an-icon' } },
			dashboard: { tiles: [{ kind: 'count', resource: 'deals', label: 'Open deals', filters: { stage: 'open' } }] },
		},
	};

	it('applies spec field types, nav order, hidden resources, columns and tile filters', () => {
		const app = applySpec(buildMetaModel(loadTables()), spec, { iconExists: (name) => name === 'table-2' });
		const contacts = resource(app.resources, 'contacts');
		assert.equal(field(contacts, 'phone').input, 'select');
		assert.deepEqual(
			field(contacts, 'phone').options?.map((o) => o.value),
			['mobile', 'work'],
		);
		assert.equal(field(resource(app.resources, 'deals'), 'amount').input, 'currency');
		assert.deepEqual(app.nav, ['deals', 'contacts', 'tags']);
		assert.deepEqual(resource(app.resources, 'deals').columns, ['title', 'closeDate']);
		assert.equal(resource(app.resources, 'deals').icon, 'table-2');
		assert.deepEqual(app.dashboard, [{ kind: 'count', resource: 'deals', label: 'Open deals', filters: { stage: 'open' } }]);
		assert.ok(app.warnings.some((w) => w.includes('not-an-icon')));
	});
});
