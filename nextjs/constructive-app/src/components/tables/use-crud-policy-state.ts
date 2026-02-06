'use client';

import { useCallback, useState } from 'react';

import {
	CRUD_OPERATIONS,
	type CrudOperation,
	type CrudPolicyConfigs,
	type DefaultPolicyConfig,
	type OperationPolicyConfig,
} from './policy-types';

/**
 * Tracks which operations are enabled for policy creation
 */
export type OperationEnabledState = Record<CrudOperation, boolean>;

/**
 * Create initial operation configs from defaults
 */
function createInitialOperationConfigs(defaults: DefaultPolicyConfig): CrudPolicyConfigs {
	const createConfig = (): OperationPolicyConfig => ({
		roleName: defaults.roleName,
		isPermissive: defaults.isPermissive,
		policyData: { ...defaults.policyData },
		isCustomized: false,
	});

	return {
		create: createConfig(),
		read: createConfig(),
		update: createConfig(),
		delete: createConfig(),
	};
}

/**
 * Create initial enabled state (all enabled by default)
 */
function createInitialEnabledState(): OperationEnabledState {
	return {
		create: true,
		read: true,
		update: true,
		delete: true,
	};
}

/**
 * Hook to manage state for 4 CRUD operation policy configs.
 *
 * Features:
 * - Default config that all operations inherit from (including policyData)
 * - Per-operation customization with tracking
 * - Default propagation to non-customized operations
 * - Reset operation to defaults
 */
export function useCrudPolicyState(initialDefaults?: Partial<DefaultPolicyConfig>) {
	// Default config that operations inherit from
	const [defaults, setDefaults] = useState<DefaultPolicyConfig>({
		roleName: 'authenticated',
		isPermissive: true,
		policyData: {},
		...initialDefaults,
	});

	// Per-operation configs
	const [operations, setOperations] = useState<CrudPolicyConfigs>(() =>
		createInitialOperationConfigs({
			roleName: 'authenticated',
			isPermissive: true,
			policyData: {},
			...initialDefaults,
		}),
	);

	// Track which operations are enabled for policy creation
	const [enabledOperations, setEnabledOperations] = useState<OperationEnabledState>(createInitialEnabledState);

	/**
	 * Update a single operation's config
	 */
	const updateOperation = useCallback(
		(op: CrudOperation, updates: Partial<Omit<OperationPolicyConfig, 'isCustomized'>>) => {
			setOperations((prev) => ({
				...prev,
				[op]: { ...prev[op], ...updates, isCustomized: true },
			}));
		},
		[],
	);

	/**
	 * Reset an operation to use default values
	 */
	const resetOperationToDefaults = useCallback(
		(op: CrudOperation) => {
			setOperations((prev) => ({
				...prev,
				[op]: {
					roleName: defaults.roleName,
					isPermissive: defaults.isPermissive,
					policyData: { ...defaults.policyData },
					isCustomized: false,
				},
			}));
		},
		[defaults],
	);

	/**
	 * Update default config.
	 * Propagates changes to all non-customized operations.
	 */
	const updateDefaults = useCallback((updates: Partial<DefaultPolicyConfig>) => {
		setDefaults((prev) => {
			const newDefaults = { ...prev, ...updates };

			// Propagate to non-customized operations
			setOperations((prevOps) => {
				const updated = { ...prevOps };
				for (const op of CRUD_OPERATIONS) {
					if (!prevOps[op].isCustomized) {
						updated[op] = {
							...prevOps[op],
							roleName: newDefaults.roleName,
							isPermissive: newDefaults.isPermissive,
							policyData: { ...newDefaults.policyData },
						};
					}
				}
				return updated;
			});

			return newDefaults;
		});
	}, []);

	/**
	 * Check if any operation has been customized
	 */
	const hasAnyCustomized = CRUD_OPERATIONS.some((op) => operations[op].isCustomized);

	/**
	 * Reset all operations to defaults
	 */
	const resetAllToDefaults = useCallback(() => {
		setOperations(createInitialOperationConfigs(defaults));
	}, [defaults]);

	/**
	 * Toggle whether an operation is enabled for policy creation
	 */
	const toggleOperationEnabled = useCallback((op: CrudOperation) => {
		setEnabledOperations((prev) => ({
			...prev,
			[op]: !prev[op],
		}));
	}, []);

	/**
	 * Get list of enabled operations
	 */
	const getEnabledOperations = useCallback(() => {
		return CRUD_OPERATIONS.filter((op) => enabledOperations[op]);
	}, [enabledOperations]);

	return {
		defaults,
		operations,
		enabledOperations,
		updateDefaults,
		updateOperation,
		resetOperationToDefaults,
		resetAllToDefaults,
		toggleOperationEnabled,
		getEnabledOperations,
		hasAnyCustomized,
	};
}
