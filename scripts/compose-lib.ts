// Pure parts of compose: manifest shapes, components.json, dependency pins.

export type TemplateManifest = {
	name: string;
	framework: string;
	/** Directories copied in order; a later layer overwrites an earlier one. */
	layers: string[];
	gen?: { emitter: string };
	registry: Record<string, string>;
	blocks: string[];
};

/** Optional `layer.json` in a layer directory. */
export type LayerConfig = {
	/** Where the layer lands in the app, relative to its root. Default: the root. */
	target?: string;
};

/** `.constructive/compose.json`: the first five fields are the contract with db-tools and the desktop. */
export type ComposeMarker = {
	templateSha: string;
	registryUrl: string;
	/** Hash of the registry index: names and paths only, blind to code changes. Kept for older readers. */
	registryIndexHash: string;
	/** Hash of the installed items' content, transitively: the one to key snapshots by. */
	registryContentHash: string;
	blocks: string[];
	composedAt: string;
	template: string;
	framework: string;
	shadcn: string;
};

export function componentsJson(registryUrl: string) {
	return {
		$schema: 'https://ui.shadcn.com/schema.json',
		style: 'base-nova',
		rsc: true,
		tsx: true,
		tailwind: {
			config: '',
			css: 'src/app/globals.css',
			baseColor: 'neutral',
			cssVariables: true,
			prefix: '',
		},
		iconLibrary: 'lucide',
		aliases: {
			components: '@/components',
			utils: '@/lib/utils',
			ui: '@/components/ui',
			lib: '@/lib',
			hooks: '@/hooks',
		},
		registries: { '@constructive': registryUrl },
	};
}

/** `https://host/r/{name}.json` → `https://host/r/registry.json` */
export function registryIndexUrl(registryUrl: string): string {
	return registryUrl.replace('{name}', 'registry');
}

type PackageJson = Record<string, unknown> & {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
};

/**
 * The shadcn CLI rewrites a dependency to the range a block asks for (or to
 * the latest version). Put back every version the template pins, keep the
 * dependencies the blocks added.
 */
export function applyTemplatePins(current: PackageJson, template: PackageJson): PackageJson {
	const fields = ['dependencies', 'devDependencies'] as const;
	const next: PackageJson = { ...current };
	for (const field of fields) next[field] = { ...current[field] };
	for (const field of fields) {
		for (const [name, version] of Object.entries(template[field] ?? {})) {
			for (const other of fields) if (other !== field && !template[other]?.[name]) delete next[other]?.[name];
			(next[field] as Record<string, string>)[name] = version;
		}
	}
	for (const field of fields) {
		next[field] = Object.fromEntries(Object.entries(next[field] ?? {}).sort(([a], [b]) => a.localeCompare(b)));
	}
	return next;
}

const NAMESPACE = '@constructive/';
const FETCH_CONCURRENCY = 4;

/**
 * A hash of what the blocks install: the item JSON (file contents included) of
 * every block and, transitively, every `@constructive` item it depends on,
 * sorted by name. A code change in any of them changes the hash; the registry
 * index alone lists only names and paths, so it can't see one. Dependencies
 * from other registries can't be fetched here and enter the hash by name.
 */
export async function registryContentHash(
	blocks: readonly string[],
	fetchItem: (name: string) => Promise<string>,
): Promise<{ hash: string; items: string[] }> {
	const contents = new Map<string, string>();
	const external = new Set<string>();
	const scheduled = new Set(blocks);
	let pending = [...scheduled];
	while (pending.length) {
		// A few at a time: small static servers drop connections under a burst.
		const fetched: Array<readonly [string, string]> = [];
		for (let start = 0; start < pending.length; start += FETCH_CONCURRENCY) {
			const batch = pending.slice(start, start + FETCH_CONCURRENCY);
			fetched.push(...(await Promise.all(batch.map(async (name) => [name, await fetchItem(name)] as const))));
		}
		pending = [];
		for (const [name, raw] of fetched) {
			contents.set(name, raw);
			const dependencies = (JSON.parse(raw) as { registryDependencies?: string[] }).registryDependencies ?? [];
			for (const dependency of dependencies) {
				const item = dependency.slice(NAMESPACE.length);
				if (!dependency.startsWith(NAMESPACE)) external.add(dependency);
				else if (!scheduled.has(item)) {
					scheduled.add(item);
					pending.push(item);
				}
			}
		}
	}
	const { createHash } = await import('node:crypto');
	const hash = createHash('sha256');
	const items = [...contents.keys()].sort();
	for (const name of items) hash.update(`${name}\0${contents.get(name)}\0`);
	for (const name of [...external].sort()) hash.update(`external:${name}\0`);
	return { hash: hash.digest('hex'), items };
}
