import { createContext, useContext } from 'react';

import type { DropPosition } from './tree-utils';
import type { ConditionBuilderProps, ConditionNodeId } from './types';

export interface ConditionBuilderContextValue<TData = unknown> extends ConditionBuilderProps<TData> {
	activeId: ConditionNodeId | null;
	onDeleteNode: (id: ConditionNodeId) => void;
	onToggleGroupOperator: (groupId: ConditionNodeId) => void;
	onAddConditionToGroup: (groupId: ConditionNodeId) => void;
	onMoveNode: (sourceId: ConditionNodeId, targetId: ConditionNodeId, position: DropPosition) => void;
	isDraggingId: (id: ConditionNodeId) => boolean;
}

const ConditionBuilderContext = createContext<ConditionBuilderContextValue<unknown> | null>(null);

export function useConditionBuilderContext<TData = unknown>(): ConditionBuilderContextValue<TData> {
	const ctx = useContext(ConditionBuilderContext);
	if (!ctx) {
		throw new Error('ConditionBuilderContext used outside of provider');
	}
	return ctx as ConditionBuilderContextValue<TData>;
}

interface ProviderProps<TData> {
	value: ConditionBuilderContextValue<TData>;
	children: React.ReactNode;
}

export function ConditionBuilderProvider<TData>({ value, children }: ProviderProps<TData>) {
	return (
		<ConditionBuilderContext.Provider value={value as unknown as ConditionBuilderContextValue<unknown>}>
			{children}
		</ConditionBuilderContext.Provider>
	);
}
