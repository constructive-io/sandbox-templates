'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface FormBuilderContextValue {
	/** Currently selected field for editing in the drawer */
	selectedFieldId: string | null;
	/** Whether the config drawer is open */
	isDrawerOpen: boolean;
	/** Select a field and open the drawer */
	selectField: (fieldId: string) => void;
	/** Close the drawer */
	closeDrawer: () => void;
	/** Open drawer for a specific field */
	openDrawerForField: (fieldId: string) => void;
}

const FormBuilderContext = createContext<FormBuilderContextValue | null>(null);

interface FormBuilderProviderProps {
	children: ReactNode;
}

export function FormBuilderProvider({ children }: FormBuilderProviderProps) {
	const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const selectField = useCallback((fieldId: string) => {
		setSelectedFieldId(fieldId);
		setIsDrawerOpen(true);
	}, []);

	const closeDrawer = useCallback(() => {
		setIsDrawerOpen(false);
	}, []);

	const openDrawerForField = useCallback((fieldId: string) => {
		setSelectedFieldId(fieldId);
		setIsDrawerOpen(true);
	}, []);

	return (
		<FormBuilderContext.Provider
			value={{
				selectedFieldId,
				isDrawerOpen,
				selectField,
				closeDrawer,
				openDrawerForField,
			}}
		>
			{children}
		</FormBuilderContext.Provider>
	);
}

export function useFormBuilder() {
	const context = useContext(FormBuilderContext);
	if (!context) {
		throw new Error('useFormBuilder must be used within a FormBuilderProvider');
	}
	return context;
}
