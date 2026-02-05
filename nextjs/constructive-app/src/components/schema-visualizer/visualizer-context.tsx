'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { SchemaData, TableDefinition, RelationshipDefinition, ForeignKeyConstraint } from '@/lib/schema';

export type PanelMode = 'none' | 'table-details' | 'relationship-details' | 'create-table' | 'create-relationship';

interface VisualizerState {
	selectedNodeId: string | null;
	selectedEdgeId: string | null;
	panelMode: PanelMode;
}

interface VisualizerContextValue extends VisualizerState {
	// Selection actions
	selectNode: (nodeId: string | null) => void;
	selectEdge: (edgeId: string | null) => void;
	clearSelection: () => void;

	// Panel actions
	setPanelMode: (mode: PanelMode) => void;
	openTableDetails: (nodeId: string) => void;
	openRelationshipDetails: (edgeId: string) => void;
	openCreateTable: () => void;
	openCreateRelationship: () => void;
	closePanel: () => void;

	// Derived data
	selectedTable: TableDefinition | null;
	selectedRelationship: RelationshipDefinition | null;

	// Schema data access
	schema: SchemaData | null;
	dbSchema: { tables: TableDefinition[]; relationships: RelationshipDefinition[] } | null;

	// Helper to convert RelationshipDefinition to ForeignKeyConstraint
	getForeignKeyConstraint: (relationship: RelationshipDefinition) => ForeignKeyConstraint | null;
}

const VisualizerContext = createContext<VisualizerContextValue | null>(null);

interface VisualizerProviderProps {
	children: ReactNode;
	schema: SchemaData | null;
	dbSchema: {
		tables: TableDefinition[];
		relationships: RelationshipDefinition[];
	} | null;
}

export function VisualizerProvider({ children, schema, dbSchema }: VisualizerProviderProps) {
	const [state, setState] = useState<VisualizerState>({
		selectedNodeId: null,
		selectedEdgeId: null,
		panelMode: 'none',
	});

	// Selection actions
	const selectNode = useCallback((nodeId: string | null) => {
		setState((prev) => ({
			...prev,
			selectedNodeId: nodeId,
			selectedEdgeId: null, // Clear edge selection when selecting node
			panelMode: nodeId ? 'table-details' : 'none',
		}));
	}, []);

	const selectEdge = useCallback((edgeId: string | null) => {
		setState((prev) => ({
			...prev,
			selectedNodeId: null, // Clear node selection when selecting edge
			selectedEdgeId: edgeId,
			panelMode: edgeId ? 'relationship-details' : 'none',
		}));
	}, []);

	const clearSelection = useCallback(() => {
		setState((prev) => ({
			...prev,
			selectedNodeId: null,
			selectedEdgeId: null,
			panelMode: 'none',
		}));
	}, []);

	// Panel actions
	const setPanelMode = useCallback((mode: PanelMode) => {
		setState((prev) => ({ ...prev, panelMode: mode }));
	}, []);

	const openTableDetails = useCallback((nodeId: string) => {
		setState((prev) => ({
			...prev,
			selectedNodeId: nodeId,
			selectedEdgeId: null,
			panelMode: 'table-details',
		}));
	}, []);

	const openRelationshipDetails = useCallback((edgeId: string) => {
		setState((prev) => ({
			...prev,
			selectedNodeId: null,
			selectedEdgeId: edgeId,
			panelMode: 'relationship-details',
		}));
	}, []);

	const openCreateTable = useCallback(() => {
		setState((prev) => ({
			...prev,
			selectedNodeId: null,
			selectedEdgeId: null,
			panelMode: 'create-table',
		}));
	}, []);

	const openCreateRelationship = useCallback(() => {
		setState((prev) => ({
			...prev,
			panelMode: 'create-relationship',
		}));
	}, []);

	const closePanel = useCallback(() => {
		setState((prev) => ({
			...prev,
			panelMode: 'none',
		}));
	}, []);

	// Derived data
	const selectedTable = useMemo(() => {
		if (!state.selectedNodeId || !dbSchema?.tables) return null;
		return dbSchema.tables.find((t) => t.id === state.selectedNodeId) ?? null;
	}, [state.selectedNodeId, dbSchema?.tables]);

	const selectedRelationship = useMemo(() => {
		if (!state.selectedEdgeId || !dbSchema?.relationships) return null;
		return dbSchema.relationships.find((r) => {
			// Edge IDs are formatted as `${sourceTable}-${targetTable}-${sourceField}`
			const edgeId = `${r.sourceTable}-${r.targetTable}-${r.sourceField}`;
			return edgeId === state.selectedEdgeId || r.id === state.selectedEdgeId;
		}) ?? null;
	}, [state.selectedEdgeId, dbSchema?.relationships]);

	// Helper to convert RelationshipDefinition to ForeignKeyConstraint
	// Looks up the FK constraint on the source table that references the target table
	const getForeignKeyConstraint = useCallback(
		(relationship: RelationshipDefinition): ForeignKeyConstraint | null => {
			if (!dbSchema?.tables) return null;

			const sourceTable = dbSchema.tables.find((t) => t.id === relationship.sourceTable);
			if (!sourceTable?.constraints) return null;

			// Find FK constraint that matches this relationship
			return (
				sourceTable.constraints.find(
					(c): c is ForeignKeyConstraint =>
						c.type === 'foreign_key' &&
						c.referencedTable === relationship.targetTable &&
						c.fields.includes(relationship.sourceField),
				) ?? null
			);
		},
		[dbSchema?.tables],
	);

	const value: VisualizerContextValue = useMemo(
		() => ({
			...state,
			selectNode,
			selectEdge,
			clearSelection,
			setPanelMode,
			openTableDetails,
			openRelationshipDetails,
			openCreateTable,
			openCreateRelationship,
			closePanel,
			selectedTable,
			selectedRelationship,
			schema,
			dbSchema,
			getForeignKeyConstraint,
		}),
		[
			state,
			selectNode,
			selectEdge,
			clearSelection,
			setPanelMode,
			openTableDetails,
			openRelationshipDetails,
			openCreateTable,
			openCreateRelationship,
			closePanel,
			selectedTable,
			selectedRelationship,
			schema,
			dbSchema,
			getForeignKeyConstraint,
		],
	);

	return <VisualizerContext.Provider value={value}>{children}</VisualizerContext.Provider>;
}

export function useVisualizerContext() {
	const context = useContext(VisualizerContext);
	if (!context) {
		throw new Error('useVisualizerContext must be used within a VisualizerProvider');
	}
	return context;
}

// Optional: Safe version that returns null instead of throwing
export function useVisualizerContextSafe() {
	return useContext(VisualizerContext);
}
