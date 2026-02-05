'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { detectSchemaContextFromPath, setSchemaContext, type SchemaContext } from '@/app-config';

// Client helper: set schema context from current pathname and clean up on unmount
export function SchemaContextClient() {
	const pathname = usePathname();
	useEffect(() => {
		const ctx = detectSchemaContextFromPath(pathname || '/');
		setSchemaContext(ctx);
		return () => setSchemaContext(null);
	}, [pathname]);
	return null;
}

// Server helper: pick context deterministically for a given path
export function pickSchemaContext(pathname: string): SchemaContext {
	return detectSchemaContextFromPath(pathname);
}
