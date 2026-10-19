// gen:resources: `_meta` (plus an optional AppSpec) → resource configs and pages.
//
//   node --experimental-strip-types scripts/gen/cli.ts --meta <meta.json> [--spec <app-spec.json>]
//        [--emitter nextjs] [--root <app dir>] [--dry-run]
//
// Prints a JSON summary on stdout (see GenSummary in run.ts). Generated files
// carry GENERATED_HEADER on their first line; files without it belong to the
// app and are never touched.

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { assertAppSpec, type AppSpec } from './app-spec.ts';
import type { Emitter } from './emitter.ts';
import { parseMetaDocument } from './meta-ir.ts';
import { runGen } from './run.ts';

function readJson(path: string, what: string): unknown {
	try {
		return JSON.parse(readFileSync(path, 'utf8'));
	} catch (error) {
		throw new Error(`Could not read the ${what} at ${path}: ${error instanceof Error ? error.message : String(error)}`);
	}
}

/** Checks icon names against the installed lucide-react; no check when it isn't installed. */
function lucideIconCheck(root: string): ((name: string) => boolean) | undefined {
	try {
		const manifest = createRequire(join(root, 'package.json')).resolve('lucide-react/package.json');
		const icons = join(dirname(manifest), 'dist', 'esm', 'icons');
		if (!existsSync(icons)) return undefined;
		return (name) => existsSync(join(icons, `${name}.mjs`)) || existsSync(join(icons, `${name}.js`));
	} catch {
		return undefined;
	}
}

async function loadEmitter(name: string): Promise<Emitter> {
	if (!/^[a-z0-9-]+$/.test(name)) throw new Error(`Invalid emitter name "${name}".`);
	const path = join(import.meta.dirname, 'emitters', `${name}.ts`);
	if (!existsSync(path)) throw new Error(`No emitter "${name}" (looked for ${path}).`);
	const module = (await import(path)) as { emitter?: Emitter };
	if (!module.emitter) throw new Error(`${path} does not export an emitter.`);
	return module.emitter;
}

async function main() {
	const { values } = parseArgs({
		options: {
			meta: { type: 'string' },
			spec: { type: 'string' },
			emitter: { type: 'string', default: 'nextjs' },
			root: { type: 'string', default: process.cwd() },
			'dry-run': { type: 'boolean', default: false },
		},
	});
	if (!values.meta) throw new Error('Usage: gen:resources --meta <meta.json> [--spec <app-spec.json>]');
	const root = resolve(values.root);

	const tables = parseMetaDocument(readJson(resolve(values.meta), '_meta document'));
	let spec: AppSpec | undefined;
	if (values.spec) {
		const raw = readJson(resolve(values.spec), 'AppSpec');
		assertAppSpec(raw);
		spec = raw;
	}

	const summary = runGen({
		root,
		tables,
		spec,
		emitter: await loadEmitter(values.emitter),
		dryRun: values['dry-run'],
		iconExists: lucideIconCheck(root),
	});
	process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error: unknown) => {
	process.stderr.write(`${JSON.stringify({ error: error instanceof Error ? error.message : String(error) })}\n`);
	process.exit(1);
});
