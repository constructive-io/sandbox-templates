'use client';

import { createContext, useContext } from 'react';

import type { FormRendererContextValue } from './types';

const FormRendererContext = createContext<FormRendererContextValue | null>(null);

export function FormRendererProvider({
	children,
	value,
}: {
	children: React.ReactNode;
	value: FormRendererContextValue;
}) {
	return <FormRendererContext.Provider value={value}>{children}</FormRendererContext.Provider>;
}

export function useFormRenderer(): FormRendererContextValue {
	const context = useContext(FormRendererContext);
	if (!context) {
		throw new Error('useFormRenderer must be used within FormRendererProvider');
	}
	return context;
}
