// Composes a template into a standalone app directory.
//
//   node --experimental-strip-types scripts/compose.ts --template nextjs/app --out <dir>
//        [--registry-url <url with {name}>] [--blocks a,b] [--no-install] [--force]
//
// --blocks replaces the template's block list, e.g. to try a registry that
// doesn't serve every item yet.
//
// 1. copies the template's layers (shared glue, then the framework shell) and the generator
// 2. writes components.json with the blocks registry
// 3. installs the blocks with the pinned shadcn CLI
// 4. installs dependencies, writing pnpm-lock.yaml
// 5. writes .constructive/compose.json, the marker db-tools and the desktop read
//
// Step timings go to stderr; a JSON summary goes to stdout.

import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
	chmodSync,
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, relative, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';

import {
	applyTemplatePins,
	componentsJson,
	type ComposeMarker,
	type LayerConfig,
	registryContentHash,
	registryIndexUrl,
	type TemplateManifest,
} from './compose-lib.ts';

export const SHADCN_VERSION = '4.13.1';

const REPO_ROOT = resolve(import.meta.dirname, '..');
const GEN_SOURCE = 'shared/gen';
const GEN_TARGET = 'scripts/gen';
const SKIPPED_NAMES = new Set(['__tests__', 'node_modules', '.next', 'layer.json', 'template.json', '.DS_Store']);

type Step = { step: string; ms: number };

function log(message: string) {
	process.stderr.write(`${message}\n`);
}

async function timed<T>(steps: Step[], step: string, work: () => Promise<T> | T): Promise<T> {
	const started = performance.now();
	const result = await work();
	const ms = Math.round(performance.now() - started);
	steps.push({ step, ms });
	log(`✓ ${step.padEnd(28)} ${(ms / 1000).toFixed(1)}s`);
	return result;
}

function run(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = {}, omit: readonly string[] = []): Promise<void> {
	const childEnv = { ...process.env, ...env };
	for (const key of omit) delete childEnv[key];
	return new Promise((resolvePromise, reject) => {
		const child = spawn(command, args, { cwd, env: childEnv, stdio: ['ignore', 'pipe', 'pipe'] });
		let output = '';
		child.stdout.on('data', (chunk: Buffer) => (output += chunk.toString()));
		child.stderr.on('data', (chunk: Buffer) => (output += chunk.toString()));
		child.on('error', reject);
		child.on('exit', (code) =>
			code === 0 ? resolvePromise() : reject(new Error(`${command} ${args.join(' ')} exited with ${code}\n${output}`)),
		);
	});
}

function walk(dir: string, base = dir): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (SKIPPED_NAMES.has(entry.name)) continue;
		const abs = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walk(abs, base));
		else out.push(relative(base, abs).split(sep).join('/'));
	}
	return out.sort();
}

/**
 * A layer's files as git sees them: tracked or untracked, never ignored, so a
 * local .env.local, tsbuildinfo or build output can't leak into the app.
 * Outside a git checkout, every file under the layer except the skipped names.
 */
function listFiles(dir: string): string[] {
	let listed: string;
	try {
		listed = execFileSync('git', ['ls-files', '-co', '--exclude-standard', '-z', '--', relative(REPO_ROOT, dir)], {
			cwd: REPO_ROOT,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore'],
		});
	} catch {
		return walk(dir);
	}
	return listed
		.split('\0')
		.filter((path) => path && existsSync(join(REPO_ROOT, path)))
		.map((path) => relative(dir, join(REPO_ROOT, path)).split(sep).join('/'))
		.filter((path) => !path.split('/').some((segment) => SKIPPED_NAMES.has(segment)))
		.sort();
}

function readJson<T>(path: string): T {
	return JSON.parse(readFileSync(path, 'utf8')) as T;
}

/** Every source file that goes into the app: layers, generator, manifest. */
function sourcesOf(template: string, manifest: TemplateManifest): Array<{ from: string; to: string }> {
	const sources: Array<{ from: string; to: string }> = [];
	for (const layer of manifest.layers) {
		const layerDir = join(REPO_ROOT, layer);
		const config: LayerConfig = existsSync(join(layerDir, 'layer.json')) ? readJson(join(layerDir, 'layer.json')) : {};
		for (const file of listFiles(layerDir)) {
			sources.push({ from: join(layer, file), to: join(config.target ?? '.', file).split(sep).join('/') });
		}
	}
	if (manifest.gen) {
		const genDir = join(REPO_ROOT, GEN_SOURCE);
		for (const file of listFiles(genDir)) {
			// Only the template's own emitter ships with the app.
			if (file.startsWith('emitters/') && file !== `emitters/${manifest.gen.emitter}.ts`) continue;
			sources.push({ from: join(GEN_SOURCE, file), to: `${GEN_TARGET}/${file}` });
		}
	}
	sources.push({ from: join(template, 'template.json'), to: '.constructive/template.json' });
	return sources;
}

function templateSha(sources: Array<{ from: string; to: string }>): string {
	const hash = createHash('sha256');
	for (const source of [...sources].sort((a, b) => a.to.localeCompare(b.to))) {
		hash.update(`${source.to}\0`);
		hash.update(readFileSync(join(REPO_ROOT, source.from)));
		hash.update('\0');
	}
	return hash.digest('hex');
}

async function fetchItem(registryUrl: string, name: string, attempt = 1): Promise<string> {
	const url = registryUrl.replace('{name}', name);
	const response = await fetch(url).catch(async (error: unknown) => {
		// A dropped connection is retried; an HTTP error is an answer.
		if (attempt >= 3) throw new Error(`Could not reach ${url}: ${error instanceof Error ? error.message : String(error)}`);
		await new Promise((done) => setTimeout(done, 300 * attempt));
		return null;
	});
	if (!response) return fetchItem(registryUrl, name, attempt + 1);
	if (!response.ok) throw new Error(`Registry item ${name} is unavailable (${response.status}) at ${registryUrl}.`);
	return response.text();
}

/** The registry index (names and paths only); kept for readers of the older marker field. */
async function registryIndexHash(registryUrl: string, contentHash: string): Promise<string> {
	const index = await fetch(registryIndexUrl(registryUrl)).catch(() => null);
	if (!index?.ok) return contentHash;
	return createHash('sha256').update(Buffer.from(await index.arrayBuffer())).digest('hex');
}

function which(command: string): string {
	for (const dir of (process.env.PATH ?? '').split(delimiter)) {
		const candidate = join(dir, command);
		if (dir && existsSync(candidate)) return candidate;
	}
	throw new Error(`${command} is not on PATH.`);
}

/**
 * The shadcn CLI always installs what it adds and has no flag to skip that.
 * Without an install, a `pnpm` shim first on PATH turns its `pnpm add` into
 * `pnpm add --lockfile-only`, so dependencies land in package.json and the lockfile only.
 */
function lockfileOnlyPath(): { env: NodeJS.ProcessEnv; cleanup: () => void } {
	const dir = mkdtempSync(join(tmpdir(), 'compose-pnpm-'));
	const shim = join(dir, 'pnpm');
	writeFileSync(
		shim,
		`#!/bin/sh\nif [ "$1" = add ]; then shift; exec "${which('pnpm')}" add --lockfile-only "$@"; fi\nexec "${which('pnpm')}" "$@"\n`,
	);
	chmodSync(shim, 0o755);
	return {
		env: { PATH: `${dir}${delimiter}${process.env.PATH ?? ''}` },
		cleanup: () => rmSync(dir, { recursive: true, force: true }),
	};
}

async function main() {
	const started = performance.now();
	const { values } = parseArgs({
		options: {
			template: { type: 'string' },
			out: { type: 'string' },
			'registry-url': { type: 'string' },
			blocks: { type: 'string' },
			'no-install': { type: 'boolean', default: false },
			force: { type: 'boolean', default: false },
		},
	});
	if (!values.template || !values.out) {
		throw new Error('Usage: compose --template <dir> --out <dir> [--registry-url <url>] [--no-install] [--force]');
	}
	const install = !values['no-install'];
	const template = values.template.replace(/\/$/, '');
	const out = resolve(values.out);
	const manifest = readJson<TemplateManifest>(join(REPO_ROOT, template, 'template.json'));
	if (values.blocks) manifest.blocks = values.blocks.split(',').map((block) => block.trim()).filter(Boolean);
	const registryUrl = values['registry-url'] ?? manifest.registry['@constructive'];
	if (!registryUrl?.includes('{name}')) throw new Error(`The registry URL must contain {name}: ${registryUrl}`);

	if (existsSync(out) && readdirSync(out).length > 0 && !values.force) {
		throw new Error(`${out} is not empty; pass --force to replace it.`);
	}
	// Compose beside the target and move it into place only once every step passed,
	// so a failed compose never leaves a half-built app where a good one was.
	const finalOut = out;
	const work = `${finalOut}.composing-${process.pid}`;
	rmSync(work, { recursive: true, force: true });
	mkdirSync(work, { recursive: true });
	try {
		await compose(work, finalOut, { template, manifest, registryUrl, install, started });
	} catch (error) {
		rmSync(work, { recursive: true, force: true });
		throw error;
	}
}

type ComposeOptions = {
	template: string;
	manifest: TemplateManifest;
	registryUrl: string;
	install: boolean;
	started: number;
};

async function compose(out: string, finalOut: string, { template, manifest, registryUrl, install, started }: ComposeOptions) {
	const steps: Step[] = [];
	const sources = sourcesOf(template, manifest);

	await timed(steps, 'copy layers', () => {
		for (const source of sources) {
			const target = join(out, source.to);
			mkdirSync(dirname(target), { recursive: true });
			cpSync(join(REPO_ROOT, source.from), target);
		}
	});

	const hashes = await timed(steps, 'hash template and registry', async () => {
		const content = await registryContentHash(manifest.blocks, (name) => fetchItem(registryUrl, name));
		return {
			templateSha: templateSha(sources),
			registryContentHash: content.hash,
			registryIndexHash: await registryIndexHash(registryUrl, content.hash),
			registryItems: content.items.length,
		};
	});

	await timed(steps, 'write components.json', () => {
		writeFileSync(join(out, 'components.json'), `${JSON.stringify(componentsJson(registryUrl), null, 2)}\n`);
	});

	const pinned = readJson<Record<string, unknown>>(join(out, 'package.json'));
	const shim = install ? null : lockfileOnlyPath();
	try {
		await timed(steps, `shadcn add (${manifest.blocks.length} blocks)`, () =>
			run(
				'pnpm',
				[
					'dlx',
					`shadcn@${SHADCN_VERSION}`,
					'add',
					...manifest.blocks.map((block) => `@constructive/${block}`),
					'--yes',
					'--overwrite',
					'--silent',
				],
				out,
				shim?.env,
				// shadcn reads REGISTRY_URL as the base URL of its own registry; the blocks come from components.json.
				['REGISTRY_URL'],
			),
		);
	} finally {
		shim?.cleanup();
	}

	// The template's own pins win over the ranges the blocks ask for.
	await timed(steps, 'restore template pins', () => {
		const path = join(out, 'package.json');
		writeFileSync(path, `${JSON.stringify(applyTemplatePins(readJson(path), pinned), null, '\t')}\n`);
	});

	await timed(steps, install ? 'pnpm install' : 'pnpm lockfile', () =>
		run('pnpm', ['install', ...(install ? ['--prefer-offline'] : ['--lockfile-only'])], out),
	);

	const marker: ComposeMarker = {
		templateSha: hashes.templateSha,
		registryUrl,
		registryIndexHash: hashes.registryIndexHash,
		registryContentHash: hashes.registryContentHash,
		blocks: manifest.blocks,
		composedAt: new Date().toISOString(),
		template: manifest.name,
		framework: manifest.framework,
		shadcn: SHADCN_VERSION,
	};
	mkdirSync(join(out, '.constructive'), { recursive: true });
	writeFileSync(join(out, '.constructive', 'compose.json'), `${JSON.stringify(marker, null, 2)}\n`);

	rmSync(finalOut, { recursive: true, force: true });
	renameSync(out, finalOut);

	const totalMs = Math.round(performance.now() - started);
	log(`composed ${manifest.name} into ${finalOut} in ${(totalMs / 1000).toFixed(1)}s (${hashes.registryItems} registry items hashed)`);
	process.stdout.write(`${JSON.stringify({ out: finalOut, ...marker, installed: install, steps, totalMs }, null, 2)}\n`);
}

main().catch((error: unknown) => {
	log(`compose failed: ${error instanceof Error ? error.message : String(error)}`);
	process.exit(1);
});
