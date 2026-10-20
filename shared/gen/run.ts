// One gen:resources run: `_meta` (plus an optional AppSpec) → the app model →
// files written under the ownership rule in emitter.ts.
//
// The run records what it generated in STATE_PATH: the body hash of every
// emitted file and the fields of every resource. The next run compares against
// it, so for a file the app owns or edited it can say what the generator would
// have changed, e.g. a new table the home page doesn't show. A file gets that
// hint once, on the run where its generated version changes.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { applySpec, type AppModel, type AppSpec, type SpecGap } from './app-spec.ts';
import {
	clearDerived,
	generatedHash,
	generatedState,
	writeGenerated,
	type EmittedFile,
	type Emitter,
	type FileSubject,
	type WriteReport,
} from './emitter.ts';
import { buildMetaModel, type MetaTable } from './meta-ir.ts';
import { applyFilterFields, parseFilterFields } from './sdk-filters.ts';

export const STATE_PATH = '.constructive/gen-state.json';

export type GenState = {
	version: 1;
	/** Body hash of every file as last emitted, whether or not it was written. */
	files: Record<string, string>;
	/** Field names of every resource, by resource name. */
	resources: Record<string, string[]>;
	/** Files the generator no longer emits that the app kept, and has been told about. */
	kept: string[];
};

export type Hint = {
	path: string;
	/** owned: its header line was deleted. modified: edited with the header still on. */
	state: 'owned' | 'modified';
	message: string;
};

export type RunOptions = {
	/** The app root. */
	root: string;
	tables: MetaTable[];
	spec?: AppSpec;
	emitter: Emitter;
	dryRun?: boolean;
	/** True when a lucide icon with this kebab-case name exists. */
	iconExists?: (kebabName: string) => boolean;
};

export type GenSummary = {
	emitter: string;
	resources: Array<{ name: string; route: string; table: string; tableName?: string; model: string; nav: boolean }>;
	files: WriteReport;
	/** Files the app owns or edited that miss something the generator now emits. */
	hints: Hint[];
	cleared: string[];
	filtersFromSdk: boolean;
	junctions: AppModel['junctions'];
	skippedTables: AppModel['skipped'];
	/** Names the AppSpec uses that `_meta` doesn't have; each is in `warnings` too. */
	specGaps: SpecGap[];
	warnings: string[];
	durationMs: number;
};

export function runGen(options: RunOptions): GenSummary {
	const started = performance.now();
	const { root, emitter, dryRun = false } = options;
	const model = applySpec(buildMetaModel(options.tables), options.spec, { iconExists: options.iconExists });
	// After codegen the SDK says exactly which fields each filter accepts; before it, the IR's rules stand.
	const inputTypes = emitter.sdkInputTypes ? join(root, emitter.sdkInputTypes) : undefined;
	const filtersFromSdk = Boolean(inputTypes && existsSync(inputTypes));
	if (filtersFromSdk) applyFilterFields(model, parseFilterFields(readFileSync(inputTypes as string, 'utf8')));

	const files = emitter.emit(model);
	const saved = readState(root);
	// An app that never ran the generator still has the shell's files, which are the output for no tables.
	const previous = saved ?? stateOf(emitter.emit(applySpec(buildMetaModel([]))), applySpec(buildMetaModel([])));
	const report = writeGenerated(root, files, emitter.pruneRoots, { dryRun });
	const changed = report.written.length > 0 || report.removed.length > 0;
	const cleared = changed ? clearDerived(root, emitter.derivedPaths, { dryRun }) : [];
	const next = stateOf(files, model);
	const { hints, kept } = buildHints(root, files, report, previous, next, saved !== undefined);
	if (!dryRun) writeState(root, { ...next, kept });

	return {
		emitter: emitter.name,
		resources: model.resources.map((ir) => ({
			name: ir.name,
			route: emitter.route(ir),
			table: ir.table,
			...(ir.tableName ? { tableName: ir.tableName } : {}),
			model: ir.model,
			nav: model.nav.includes(ir.name),
		})),
		files: report,
		hints,
		cleared,
		filtersFromSdk,
		junctions: model.junctions,
		skippedTables: model.skipped,
		specGaps: model.gaps,
		warnings: model.warnings,
		durationMs: Math.round(performance.now() - started),
	};
}

function stateOf(files: EmittedFile[], model: AppModel): GenState {
	const sorted = <T>(entries: Array<[string, T]>) =>
		Object.fromEntries(entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
	return {
		version: 1,
		files: sorted(files.map((file) => [file.path, generatedHash(file.content)])),
		resources: sorted(model.resources.map((ir) => [ir.name, ir.fields.map((field) => field.name)])),
		kept: [],
	};
}

function readState(root: string): GenState | undefined {
	try {
		const state = JSON.parse(readFileSync(join(root, STATE_PATH), 'utf8')) as Partial<GenState>;
		if (state.version !== 1 || typeof state.files !== 'object' || typeof state.resources !== 'object') return undefined;
		return { ...(state as GenState), kept: Array.isArray(state.kept) ? state.kept : [] };
	} catch {
		return undefined;
	}
}

function writeState(root: string, state: GenState) {
	const path = join(root, STATE_PATH);
	const content = `${JSON.stringify(state, null, '\t')}\n`;
	if (existsSync(path) && readFileSync(path, 'utf8') === content) return;
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, content);
}

const names = (list: string[]) => list.join(', ');
const plural = (list: string[], one: string, many: string) => (list.length === 1 ? one : many);

/** What the app's copy of a generated file now misses, or undefined when it misses nothing. */
function whatChanged(
	subject: FileSubject | undefined,
	previous: GenState,
	next: GenState,
	regenerated: boolean,
): string | undefined {
	const added = Object.keys(next.resources).filter((name) => !previous.resources[name]);
	const removed = Object.keys(previous.resources).filter((name) => !next.resources[name]);
	const tables = [
		added.length ? `the new ${plural(added, 'resource', 'resources')} ${names(added)}` : '',
		removed.length ? `${names(removed)}, whose ${plural(removed, 'table is', 'tables are')} gone` : '',
	];
	if (!regenerated && subject?.kind !== 'dashboard') return undefined;
	switch (subject?.kind) {
		case 'dashboard':
			// A home page the app took over is its own screen; a new table may belong on it even when
			// the generated tiles (fixed by the AppSpec) didn't change.
			if (added.length || removed.length) {
				return [added.length && `add ${tables[0]} to it by hand if needed`, removed.length && `drop ${tables[1]}`]
					.filter(Boolean)
					.join('; ');
			}
			return regenerated ? 'the generated home page changed (its tiles); update it by hand if needed' : undefined;
		case 'registry':
			if (added.length || removed.length) {
				return [
					added.length && `register ${tables[0]} by hand, or their pages can't load`,
					removed.length && `remove ${tables[1]}`,
				]
					.filter(Boolean)
					.join('; ');
			}
			return 'the generated registry changed (labels, icons or sidebar order); update it by hand if needed';
		case 'resource': {
			const before = previous.resources[subject.resource] ?? [];
			const after = next.resources[subject.resource] ?? [];
			const newFields = after.filter((name) => !before.includes(name));
			const goneFields = before.filter((name) => !after.includes(name));
			if (newFields.length || goneFields.length) {
				return [
					newFields.length && `add the new ${plural(newFields, 'field', 'fields')} ${names(newFields)} by hand if needed`,
					goneFields.length && `remove ${names(goneFields)}, which the table no longer has`,
				]
					.filter(Boolean)
					.join('; ');
			}
			return 'the generated config changed (labels, columns or AppSpec hints); update it by hand if needed';
		}
		case 'page':
			return 'the generated page changed; update it by hand if needed';
		case 'app':
			return 'the app name or tagline changed; update it by hand if needed';
		default:
			return 'its generated version changed; update it by hand if needed';
	}
}

const SETTLE_EDIT =
	' To settle it, delete the @generated line to keep your edit, or delete the file and re-run gen:resources to take the generated version.';

function buildHints(
	root: string,
	files: EmittedFile[],
	report: WriteReport,
	previous: GenState,
	next: GenState,
	hasState: boolean,
): { hints: Hint[]; kept: string[] } {
	const hints: Hint[] = [];
	const emitted = new Map(files.map((file) => [file.path, file]));

	for (const path of [...report.skipped, ...report.modified]) {
		const file = emitted.get(path);
		if (!file) continue;
		const state = report.skipped.includes(path) ? 'owned' : 'modified';
		const missing = whatChanged(file.subject, previous, next, previous.files[path] !== next.files[path]);
		if (!missing) continue;
		const owner = state === 'owned' ? `${path} is yours` : `${path} was edited with its @generated line still on, so gen left it alone`;
		hints.push({ path, state, message: `${owner}; ${missing}.${state === 'modified' ? SETTLE_EDIT : ''}` });
	}

	// Files the generator no longer emits but the app kept: an edited one stays in report.modified, an owned one
	// is only known from the last state. Their imports may now dangle, so each is named once.
	const kept: string[] = [];
	const leftovers = new Set([...report.modified, ...Object.keys(previous.files), ...previous.kept]);
	for (const path of [...leftovers].sort()) {
		if (emitted.has(path) || report.removed.includes(path) || !existsSync(join(root, path))) continue;
		const state = generatedState(readFileSync(join(root, path), 'utf8'));
		const generatedBefore = path in previous.files || !hasState;
		if (state === 'pristine' || (state === 'owned' && !generatedBefore && !previous.kept.includes(path))) continue;
		kept.push(path);
		if (previous.kept.includes(path)) continue;
		const message =
			state === 'owned'
				? `${path} is yours, but gen no longer generates it (its table left _meta, or its route moved); delete it, or fix it by hand.`
				: generatedBefore
					? `${path} was generated for a table that left _meta (or a route that moved) and edited since, so gen kept it; delete it, or delete its @generated line to keep it.`
					: `${path} has a @generated line, but gen never generated it; delete that line so gen treats the file as yours.`;
		hints.push({ path, state, message });
	}

	return { hints: hints.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0)), kept };
}
