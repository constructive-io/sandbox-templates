'use client';

import type { SchemaContext } from '@/app-config';

// Client helper: no-op since there's only one context (admin)
export function SchemaContextClient() {
	return null;
}

// Server helper: always returns 'admin'
export function pickSchemaContext(_pathname: string): SchemaContext {
	return 'admin';
}
