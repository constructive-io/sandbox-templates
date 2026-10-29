import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyTemplatePins, registryContentHash } from '../compose-lib.ts';

describe('applyTemplatePins', () => {
	it('restores the template versions the CLI rewrote and keeps what the blocks added', () => {
		const template = {
			dependencies: { 'lucide-react': '1.58.0', next: '16.4.2' },
			devDependencies: { typescript: '5.9.3' },
		};
		const afterShadcn = {
			name: 'app',
			dependencies: { 'lucide-react': '^1.59.0', motion: '^13.5.1', next: '16.4.2', typescript: '^5.9.3' },
			devDependencies: { typescript: '5.9.3' },
		};
		assert.deepEqual(applyTemplatePins(afterShadcn, template), {
			name: 'app',
			dependencies: { 'lucide-react': '1.58.0', motion: '^13.5.1', next: '16.4.2' },
			devDependencies: { typescript: '5.9.3' },
		});
	});
});

describe('registryContentHash', () => {
	const registry = (theme: string) =>
		new Map([
			['resource-kit', JSON.stringify({ registryDependencies: ['@constructive/workspace-kit', '@constructive/cn'] })],
			['workspace-kit', JSON.stringify({ registryDependencies: ['@constructive/constructive-theme', '@constructive/cn'] })],
			['cn', JSON.stringify({ files: [{ content: 'export const cn = 1;' }] })],
			['constructive-theme', JSON.stringify({ cssVars: { theme } })],
		]);
	const fetcher = (items: Map<string, string>, seen: string[] = []) => async (name: string) => {
		seen.push(name);
		const raw = items.get(name);
		if (!raw) throw new Error(`missing ${name}`);
		return raw;
	};

	it('covers transitive dependencies once each, whatever the order of the blocks', async () => {
		const seen: string[] = [];
		const a = await registryContentHash(['resource-kit', 'workspace-kit'], fetcher(registry('blue'), seen));
		const b = await registryContentHash(['workspace-kit', 'resource-kit'], fetcher(registry('blue')));
		assert.deepEqual(a.items, ['cn', 'constructive-theme', 'resource-kit', 'workspace-kit']);
		assert.equal(seen.length, 4);
		assert.equal(a.hash, b.hash);
	});

	it('changes when code deep in the dependency tree changes', async () => {
		const before = await registryContentHash(['resource-kit'], fetcher(registry('blue')));
		const after = await registryContentHash(['resource-kit'], fetcher(registry('green')));
		assert.notEqual(before.hash, after.hash);
	});
});
