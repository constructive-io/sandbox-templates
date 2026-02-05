import * as React from 'react';

import { useTable } from '@/lib/gql/hooks/dashboard/use-table';

export interface DynamicMutationResult<TData = unknown> {
	submit: (values: Record<string, unknown>) => Promise<TData | null>;
	isSubmitting: boolean;
	error: Error | null;
}

export function useDynamicCreate(tableName: string): DynamicMutationResult {
	const table = useTable(tableName, { enabled: false });

	const submit = React.useCallback(
		async (values: Record<string, unknown>) => {
			const result = await table.create(values);
			return result.createdRow ?? null;
		},
		[table],
	);

	return {
		submit,
		isSubmitting: table.isCreating,
		error: table.createError,
	};
}

export function useDynamicUpdate(tableName: string, rowId: string | number): DynamicMutationResult {
	const table = useTable(tableName, { enabled: false });

	const submit = React.useCallback(
		async (values: Record<string, unknown>) => {
			const result = await table.update(rowId, values);
			return result.updatedRow ?? null;
		},
		[table, rowId],
	);

	return {
		submit,
		isSubmitting: table.isUpdating,
		error: table.updateError,
	};
}
