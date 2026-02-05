'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
	Background,
	BackgroundVariant,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useEdgesState,
	useNodesState,
	useReactFlow,
	type EdgeTypes,
	type NodeTypes,
	type ReactFlowInstance,
	type Node,
	type Edge,
	type Connection,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import { RiAddLine, RiEyeLine, RiEyeOffLine, RiFullscreenLine, RiSubtractLine } from '@remixicon/react';

import { useCardStack } from '@constructive-io/ui/stack';
import { useSchemaBuilderSelectors } from '@/lib/gql/hooks/schema-builder';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { RelationshipCard } from '@/components/table-editor/relationships';
import { useShowSystemTablesInVisualizer, useVisualizerFilterActions } from '@/store/app-store';
import { Button } from '@constructive-io/ui/button';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@constructive-io/ui/tooltip';
import {
	type NodeConnections,
	type SchemaData,
	type SchemaEdge as SchemaEdgeType,
	type TableNode as TableNodeType,
} from '@/lib/schema';
import { SchemaEdge } from './schema-edge';
import { TableNode } from './schema-table-node';
import { VisualizerProvider, useVisualizerContext } from './visualizer-context';
import { InspectorPanel } from './inspector-panel';
import {
	NodeContextMenu,
	EdgeContextMenu,
	PaneContextMenu,
	useContextMenuState,
} from './context-menus';
import { VisualizerToolbar } from './visualizer-toolbar';

interface SchemaVisualizerProps {
	schema: SchemaData;
}

/**
 * Toggle button for showing/hiding system tables (CORE/MODULE).
 * Uses persisted preference from app store.
 */
function SystemTablesToggle() {
	const showSystemTables = useShowSystemTablesInVisualizer();
	const { toggleShowSystemTablesInVisualizer } = useVisualizerFilterActions();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant='outline'
					size='sm'
					className={`bg-card gap-2 shadow-none ${showSystemTables ? 'text-foreground' : 'text-muted-foreground'}`}
					onClick={toggleShowSystemTablesInVisualizer}
					aria-pressed={showSystemTables}
				>
					{showSystemTables ? (
						<RiEyeLine className='size-4' aria-hidden='true' />
					) : (
						<RiEyeOffLine className='size-4' aria-hidden='true' />
					)}
					<span className='text-xs'>System Tables</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent side='bottom'>
				{showSystemTables ? 'Hide system tables (CORE/MODULE)' : 'Show system tables (CORE/MODULE)'}
			</TooltipContent>
		</Tooltip>
	);
}

/**
 * Pre-compute connection info for all nodes from edges.
 * This avoids each TableNode calling useEdges() which causes cascade re-renders.
 */
function buildConnectionsMap(edges: SchemaEdgeType[]): Map<string, NodeConnections> {
	const map = new Map<string, NodeConnections>();

	const getOrCreate = (nodeId: string): NodeConnections => {
		if (!map.has(nodeId)) {
			map.set(nodeId, { source: new Set(), target: new Set() });
		}
		return map.get(nodeId)!;
	};

	for (const edge of edges) {
		// Source node: this field is the origin of an outgoing edge
		if (edge.sourceHandle) {
			getOrCreate(edge.source).source.add(edge.sourceHandle);
		}
		// Target node: this field is the destination of an incoming edge
		if (edge.targetHandle) {
			getOrCreate(edge.target).target.add(edge.targetHandle);
		}
	}

	return map;
}

function SchemaVisualizerInner({ schema }: SchemaVisualizerProps) {
	const reactFlowWrapper = useRef<HTMLDivElement>(null);
	const { fitView, zoomIn, zoomOut } = useReactFlow();
	const reactFlowInstance = useRef<ReactFlowInstance<TableNodeType, SchemaEdgeType> | null>(null);
	const searchParams = useSearchParams();
	const initialFocusHandled = useRef(false);

	// Selection context
	const { selectNode, selectEdge, clearSelection, selectedTable, selectedRelationship } = useVisualizerContext();

	// Context menu state
	const contextMenu = useContextMenuState();

	// Get table name from URL query param (e.g., ?table=categories)
	const focusTableName = searchParams.get('table');

	// Pre-compute connections map from edges (memoized)
	const connectionsMap = useMemo(() => buildConnectionsMap(schema.edges), [schema.edges]);

	// Inject pre-computed connections into each node's data
	const nodesWithConnections = useMemo<TableNodeType[]>(
		() =>
			schema.nodes.map((node) => ({
				...node,
				data: {
					...node.data,
					connections: connectionsMap.get(node.id) ?? { source: new Set(), target: new Set() },
				},
			})),
		[schema.nodes, connectionsMap],
	);

	const [nodes, setNodes, onNodesChange] = useNodesState<TableNodeType>(nodesWithConnections);
	const [edges, setEdges, onEdgesChange] = useEdgesState<SchemaEdgeType>(schema.edges);

	// Stable identifiers for change detection
	const schemaName = schema.name;
	const nodesHash = useMemo(() => schema.nodes.map((n) => n.id).join(','), [schema.nodes]);
	const edgesHash = useMemo(() => schema.edges.map((e) => e.id).join(','), [schema.edges]);

	// Find the node ID for the focused table (by name/label)
	const focusNodeId = useMemo(() => {
		if (!focusTableName) return null;
		const node = schema.nodes.find(
			(n) => n.data.label.toLowerCase() === focusTableName.toLowerCase(),
		);
		return node?.id ?? null;
	}, [focusTableName, schema.nodes]);

	useEffect(() => {
		setNodes(nodesWithConnections);
		setEdges(schema.edges);
		// Fit view after nodes and edges are updated
		if (reactFlowInstance.current) {
			requestAnimationFrame(() => {
				reactFlowInstance.current?.fitView({ padding: 0.2 });
			});
		}
	}, [edgesHash, nodesHash, nodesWithConnections, schema.edges, schemaName, setEdges, setNodes]);

	const onInit = useCallback(
		(instance: ReactFlowInstance<TableNodeType, SchemaEdgeType>) => {
			reactFlowInstance.current = instance;

			// On initial mount, center on the focused table if specified in URL
			if (focusNodeId && !initialFocusHandled.current) {
				initialFocusHandled.current = true;
				// Small delay to ensure nodes are rendered
				requestAnimationFrame(() => {
					instance.fitView({
						nodes: [{ id: focusNodeId }],
						padding: 0.5,
						maxZoom: 1,
						duration: 300,
					});
				});
			}
		},
		[focusNodeId],
	);

	// Memoize node and edge types to prevent unnecessary re-renders
	const nodeTypes: NodeTypes = useMemo(
		() => ({
			tableNode: TableNode,
		}),
		[],
	);

	const edgeTypes: EdgeTypes = useMemo(
		() => ({
			custom: SchemaEdge,
		}),
		[],
	);

	const onFitView = useCallback(() => {
		try {
			fitView({ padding: 0.2 });
		} catch (error) {
			console.warn('Failed to fit view:', error);
		}
	}, [fitView]);

	// Selection handlers
	const onNodeClick = useCallback(
		(_event: React.MouseEvent, node: Node) => {
			selectNode(node.id);
		},
		[selectNode],
	);

	const onEdgeClick = useCallback(
		(_event: React.MouseEvent, edge: Edge) => {
			selectEdge(edge.id);
		},
		[selectEdge],
	);

	const onPaneClick = useCallback(() => {
		clearSelection();
	}, [clearSelection]);

	// Context menu handlers
	const onNodeContextMenu = useCallback(
		(event: React.MouseEvent, node: Node) => {
			event.preventDefault();
			selectNode(node.id);
			contextMenu.openNodeMenu(node.id, event.clientX, event.clientY);
		},
		[selectNode, contextMenu],
	);

	const onEdgeContextMenu = useCallback(
		(event: React.MouseEvent, edge: Edge) => {
			event.preventDefault();
			selectEdge(edge.id);
			contextMenu.openEdgeMenu(edge.id, event.clientX, event.clientY);
		},
		[selectEdge, contextMenu],
	);

	const onPaneContextMenu = useCallback(
		(event: React.MouseEvent | MouseEvent) => {
			event.preventDefault();
			contextMenu.openPaneMenu(event.clientX, event.clientY);
		},
		[contextMenu],
	);

	// Get filter state for context menu
	const showSystemTables = useShowSystemTablesInVisualizer();
	const { toggleShowSystemTablesInVisualizer } = useVisualizerFilterActions();

	// Connection state for creating relationships
	const [isConnecting, setIsConnecting] = useState(false);

	// Stack for relationship creation
	const stack = useCardStack();

	const onConnectStart = useCallback(() => {
		setIsConnecting(true);
	}, []);

	const onConnectEnd = useCallback(() => {
		setIsConnecting(false);
	}, []);

	const onConnect = useCallback(
		(connection: Connection) => {
			if (!connection.source || !connection.target) {
				return;
			}

			// Open the relationship creation card with prefilled source and target tables
			stack.push({
				id: `create-relationship-${connection.source}-${connection.target}`,
				title: 'Create Relationship',
				Component: RelationshipCard,
				props: {
					editingRelationship: null,
					prefilledSourceTableId: connection.source,
					prefilledTargetTableId: connection.target,
				},
				width: CARD_WIDTHS.medium,
			});

			setIsConnecting(false);
		},
		[stack],
	);

	return (
		<div className='flex h-full' ref={reactFlowWrapper}>
			<div className='relative min-w-0 flex-1'>
				<ReactFlow
					// Stable key: only remount on schema switch, not on node/edge count changes
					key={schema.name}
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onInit={onInit}
					onNodeClick={onNodeClick}
					onEdgeClick={onEdgeClick}
					onPaneClick={onPaneClick}
					onNodeContextMenu={onNodeContextMenu}
					onEdgeContextMenu={onEdgeContextMenu}
					onPaneContextMenu={onPaneContextMenu}
					onConnect={onConnect}
					onConnectStart={onConnectStart}
					onConnectEnd={onConnectEnd}
					nodeTypes={nodeTypes}
					edgeTypes={edgeTypes}
					fitView
					minZoom={0.1}
					maxZoom={1.5}
					defaultEdgeOptions={{
						type: 'custom',
						className: 'opacity-50',
					}}
					// Performance optimizations
					nodesDraggable
					nodesConnectable
					elementsSelectable
					selectNodesOnDrag={false}
					panOnDrag
					zoomOnScroll
					preventScrolling
					style={
						{
							'--xy-background-pattern-dots-color-default': 'var(--color-border)',
							'--xy-edge-stroke-width-default': 2,
							'--xy-edge-stroke-default': 'var(--color-primary)',
							'--xy-edge-stroke-selected-default': 'var(--color-foreground)',
							'--xy-connectionline-stroke-default': 'var(--color-primary)',
							'--xy-attribution-background-color-default': 'transparent',
						} as React.CSSProperties
					}
					attributionPosition='bottom-left'
				>
					<Background variant={BackgroundVariant.Dots} gap={20} size={2} />

					{/* Toolbar - top left */}
					<Panel position='top-left'>
						<VisualizerToolbar onFitView={onFitView} />
					</Panel>

					{/* Filter toggle - top right */}
					<Panel position='top-right' className='flex items-center gap-2'>
						<SystemTablesToggle />
					</Panel>

					{/* Zoom controls - bottom right */}
					<Panel position='bottom-right' className='inline-flex -space-x-px rounded-md shadow-xs rtl:space-x-reverse'>
						<Button
							variant='outline'
							size='icon'
							className='text-muted-foreground/80 hover:text-muted-foreground bg-card size-10 rounded-none shadow-none
								first:rounded-s-lg last:rounded-e-lg focus-visible:z-10'
							onClick={() => zoomIn()}
							aria-label='Zoom in'
						>
							<RiAddLine className='size-5' aria-hidden='true' />
						</Button>
						<Button
							variant='outline'
							size='icon'
							className='text-muted-foreground/80 hover:text-muted-foreground bg-card size-10 rounded-none shadow-none
								first:rounded-s-lg last:rounded-e-lg focus-visible:z-10'
							onClick={() => zoomOut()}
							aria-label='Zoom out'
						>
							<RiSubtractLine className='size-5' aria-hidden='true' />
						</Button>
						<Button
							variant='outline'
							size='icon'
							className='text-muted-foreground/80 hover:text-muted-foreground bg-card size-10 rounded-none shadow-none
								first:rounded-s-lg last:rounded-e-lg focus-visible:z-10'
							onClick={onFitView}
							aria-label='Fit view'
						>
							<RiFullscreenLine className='size-5' aria-hidden='true' />
						</Button>
					</Panel>
				</ReactFlow>
			</div>

			{/* Inspector panel - shows on selection */}
			<InspectorPanel />

			{/* Context menus */}
			{contextMenu.type === 'node' && (
				<NodeContextMenu
					table={selectedTable}
					position={contextMenu.position}
					onClose={contextMenu.closeMenu}
				/>
			)}
			{contextMenu.type === 'edge' && (
				<EdgeContextMenu
					relationship={selectedRelationship}
					position={contextMenu.position}
					onClose={contextMenu.closeMenu}
				/>
			)}
			{contextMenu.type === 'pane' && (
				<PaneContextMenu
					position={contextMenu.position}
					onClose={contextMenu.closeMenu}
					onFitView={onFitView}
					showSystemTables={showSystemTables}
					onToggleSystemTables={toggleShowSystemTablesInVisualizer}
				/>
			)}
		</div>
	);
}

export default function SchemaVisualizer({ schema }: SchemaVisualizerProps) {
	// Get the full database schema for inspector panel
	const { currentSchema } = useSchemaBuilderSelectors();

	// Prepare dbSchema for the context
	const dbSchema = useMemo(() => {
		if (!currentSchema) return null;
		return {
			tables: currentSchema.tables,
			relationships: currentSchema.relationships ?? [],
		};
	}, [currentSchema]);

	return (
		<ReactFlowProvider>
			<VisualizerProvider schema={schema} dbSchema={dbSchema}>
				<TooltipProvider>
					<SchemaVisualizerInner schema={schema} />
				</TooltipProvider>
			</VisualizerProvider>
		</ReactFlowProvider>
	);
}
