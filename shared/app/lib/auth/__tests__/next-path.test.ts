import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { nextPath } from '../next-path.ts';

const ORIGIN = 'http://localhost:3011';

describe('nextPath', () => {
	it('keeps a same-site path with its query and hash', () => {
		assert.equal(nextPath('/shifts/42?tab=volunteers#notes', ORIGIN), '/shifts/42?tab=volunteers#notes');
	});

	it('sends every off-site trick to the dashboard', () => {
		const bypasses = [
			'//evil.example',
			'/\\evil.example',
			'/%5Cevil.example',
			'/%5cevil.example',
			'/\t/evil.example',
			'/\n/evil.example',
			'/%09/evil.example',
			'/%2F%2Fevil.example',
			'https://evil.example',
			'javascript:alert(1)',
			'evil.example',
			'',
			null,
		];
		for (const value of bypasses) assert.equal(nextPath(value, ORIGIN), '/', JSON.stringify(value));
	});
});
