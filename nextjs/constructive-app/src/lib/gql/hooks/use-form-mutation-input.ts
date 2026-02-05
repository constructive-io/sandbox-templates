/**
 * Form integration hook for mutation input filtering.
 *
 * Integrates with TanStack React Form to automatically extract dirty fields
 * and prepare mutation inputs based on form state.
 *
 * @see apps/admin/docs/MUTATION_INPUT_FILTERING_SPEC.md
 */

import { useCallback } from 'react';

import { prepareMutationInput, type PrepareInputOptions } from '../mutation-input';

// ============================================================================
// Types
// ============================================================================

/**
 * Minimal form state interface compatible with TanStack Form.
 * Using a minimal interface to avoid tight coupling to specific versions.
 */
interface FormState {
	fieldMeta: Record<string, { isDirty?: boolean; isTouched?: boolean }>;
}

/**
 * Minimal form API interface compatible with TanStack Form.
 */
interface FormApiLike<TFormData extends Record<string, unknown>> {
	state: FormState;
	options: {
		defaultValues?: TFormData;
	};
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Extracts dirty field paths from form field metadata.
 * TanStack Form typically uses dot notation for nested fields.
 */
function extractDirtyFields(fieldMeta: Record<string, { isDirty?: boolean }>): Set<string> {
	const dirty = new Set<string>();
	for (const [fieldName, meta] of Object.entries(fieldMeta)) {
		if (meta.isDirty) {
			dirty.add(fieldName);
		}
	}
	return dirty;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook that provides mutation input preparation integrated with TanStack Form.
 *
 * Automatically extracts dirty fields from form state and applies them when
 * preparing mutation inputs.
 *
 * @example
 * const form = useForm({
 *   defaultValues: { name: '', description: '' }
 * });
 *
 * const { prepareInput, getDirtyFields } = useFormMutationInput(form);
 *
 * const handleSubmit = async (value) => {
 *   const payload = prepareInput(value, { operation: 'update' });
 *   await updateMutation(payload);
 * };
 */
export function useFormMutationInput<TFormData extends Record<string, unknown>>(form: FormApiLike<TFormData>) {
	/**
	 * Returns the set of dirty field paths from the form.
	 */
	const getDirtyFields = useCallback((): Set<string> => {
		return extractDirtyFields(form.state.fieldMeta);
	}, [form.state.fieldMeta]);

	/**
	 * Prepares mutation input with automatic dirty field tracking from form state.
	 *
	 * @param input - The raw input object to filter
	 * @param options - Filtering options (operation is required)
	 * @returns Filtered input with only relevant fields
	 */
	const prepareInput = useCallback(
		<T extends Record<string, unknown>>(
			input: T,
			options: Omit<PrepareInputOptions, 'dirtyFields' | 'defaultValues'>,
		): Partial<T> => {
			return prepareMutationInput(input, {
				...options,
				dirtyFields: getDirtyFields(),
				defaultValues: form.options.defaultValues as Record<string, unknown>,
			});
		},
		[form.options.defaultValues, getDirtyFields],
	);

	/**
	 * Prepares CREATE mutation input with automatic dirty field tracking.
	 */
	const prepareCreate = useCallback(
		<T extends Record<string, unknown>>(
			input: T,
			options?: Omit<PrepareInputOptions, 'operation' | 'dirtyFields' | 'defaultValues'>,
		): Partial<T> => {
			return prepareInput(input, { ...options, operation: 'create' });
		},
		[prepareInput],
	);

	/**
	 * Prepares UPDATE mutation input with automatic dirty field tracking.
	 */
	const prepareUpdate = useCallback(
		<T extends Record<string, unknown>>(
			input: T,
			options?: Omit<PrepareInputOptions, 'operation' | 'dirtyFields' | 'defaultValues'>,
		): Partial<T> => {
			return prepareInput(input, { ...options, operation: 'update' });
		},
		[prepareInput],
	);

	/**
	 * Prepares PATCH mutation input with automatic dirty field tracking.
	 */
	const preparePatch = useCallback(
		<T extends Record<string, unknown>>(
			input: T,
			options?: Omit<PrepareInputOptions, 'operation' | 'dirtyFields' | 'defaultValues'>,
		): Partial<T> => {
			return prepareInput(input, { ...options, operation: 'patch' });
		},
		[prepareInput],
	);

	return {
		/** Get set of dirty field paths */
		getDirtyFields,
		/** Prepare input with custom operation type */
		prepareInput,
		/** Prepare input for CREATE operation */
		prepareCreate,
		/** Prepare input for UPDATE operation */
		prepareUpdate,
		/** Prepare input for PATCH operation */
		preparePatch,
	};
}
