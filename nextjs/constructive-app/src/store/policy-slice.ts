import { StateCreator } from 'zustand';

export interface PolicyState {
	showEmptyTables: boolean;
	showSystemTables: boolean;
}

export interface PolicyActions {
	setShowEmptyTables: (show: boolean) => void;
	setShowSystemTables: (show: boolean) => void;
}

export type PolicySlice = PolicyState & PolicyActions;

const initialPolicyState: PolicyState = {
	showEmptyTables: true,
	showSystemTables: false,
};

export const createPolicySlice: StateCreator<PolicySlice, [], [], PolicySlice> = (set) => ({
	...initialPolicyState,
	setShowEmptyTables: (show) => set({ showEmptyTables: show }),
	setShowSystemTables: (show) => set({ showSystemTables: show }),
});

export const serializePolicySlice = (state: PolicySlice) => ({
	policy: {
		showEmptyTables: state.showEmptyTables,
		showSystemTables: state.showSystemTables,
	},
});

export const deserializePolicySlice = (persisted: any): Partial<PolicySlice> => {
	const policy = persisted?.policy;
	if (!policy) return initialPolicyState;
	return {
		showEmptyTables: policy.showEmptyTables ?? true,
		showSystemTables: policy.showSystemTables ?? false,
	};
};
