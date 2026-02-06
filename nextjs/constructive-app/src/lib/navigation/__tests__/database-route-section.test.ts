import { describe, expect, it } from 'vitest';

import { getDatabaseSectionFromPathname } from '../database-route-section';

describe('database-route-section', () => {
	it('extracts section from org-scoped pathname', () => {
		expect(getDatabaseSectionFromPathname('/orgs/org-1/databases/db-1/schemas')).toBe('schemas');
		expect(getDatabaseSectionFromPathname('/orgs/org-1/databases/db-1/data')).toBe('data');
		expect(getDatabaseSectionFromPathname('/orgs/org-1/databases/db-1/services')).toBe('services');
		expect(getDatabaseSectionFromPathname('/orgs/org-1/databases/db-1/security')).toBe('security');
		expect(getDatabaseSectionFromPathname('/orgs/org-1/databases/db-1/settings')).toBe('settings');
	});

	it('returns null for database root path', () => {
		expect(getDatabaseSectionFromPathname('/orgs/org-1/databases/db-1')).toBeNull();
		expect(getDatabaseSectionFromPathname('/orgs/org-1/databases/db-1/')).toBeNull();
	});
});
