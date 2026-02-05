'use client';

import { useCallback, useState } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@constructive-io/ui/alert-dialog';
import { useCardStack } from '@constructive-io/ui/stack';
import { showErrorToast, showSuccessToast } from '@constructive-io/ui/toast';
import {
	RiAddLine,
	RiDeleteBinLine,
	RiEditLine,
	RiEyeLine,
	RiEyeOffLine,
	RiFileCopyLine,
	RiFullscreenLine,
	RiLinksLine,
	RiPencilLine,
	RiTableLine,
} from '@remixicon/react';

import { useDeleteForeignKey } from '@/lib/gql/hooks/schema-builder/use-relationship-mutations';
import type { RelationshipDefinition, TableDefinition } from '@/lib/schema';
import { CARD_WIDTHS } from '@/lib/stack/card-widths';
import { RelationshipCard } from '@/components/table-editor/relationships';
import { AccessModelSelectorCard, DeleteTableDialog, RenameTableCard } from '@/components/tables';

import { FieldCard } from './field-card';
import { useVisualizerContext } from './visualizer-context';

// ============================================================================
// Types
// ============================================================================

export interface ContextMenuPosition {
	x: number;
	y: number;
}

interface NodeContextMenuProps {
	table: TableDefinition | null;
	position: ContextMenuPosition | null;
	onClose: () => void;
}

interface EdgeContextMenuProps {
	relationship: RelationshipDefinition | null;
	position: ContextMenuPosition | null;
	onClose: () => void;
}

interface PaneContextMenuProps {
	position: ContextMenuPosition | null;
	onClose: () => void;
	onFitView?: () => void;
	showSystemTables?: boolean;
	onToggleSystemTables?: () => void;
}

// ============================================================================
// Node Context Menu
// ============================================================================

export function NodeContextMenu({ table, position, onClose }: NodeContextMenuProps) {
	const stack = useCardStack();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	if (!table || !position) return null;

	const handleRename = () => {
		stack.push({
			id: `rename-table-${table.id}`,
			title: 'Rename Table',
			Component: RenameTableCard,
			props: { tableId: table.id, tableName: table.name },
			width: CARD_WIDTHS.narrow,
		});
		onClose();
	};

	const handleAddField = () => {
		stack.push({
			id: `create-field-${table.id}`,
			title: 'Add Field',
			Component: FieldCard,
			props: { tableId: table.id, tableName: table.name, editingField: null },
			width: CARD_WIDTHS.medium,
		});
		onClose();
	};

	const handleAddRelationship = () => {
		stack.push({
			id: `create-relationship-${table.id}`,
			title: 'Create Relationship',
			Component: RelationshipCard,
			props: { editingRelationship: null },
			width: CARD_WIDTHS.medium,
		});
		onClose();
	};

	const handleDelete = () => {
		setDeleteDialogOpen(true);
	};

	const handleDeleteComplete = () => {
		setDeleteDialogOpen(false);
		onClose();
	};

	return (
		<>
			{/* Custom positioned context menu */}
			<div
				className='bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed z-50 min-w-[160px]
					overflow-hidden rounded-md border p-1 shadow-md'
				style={{ left: position.x, top: position.y }}
			>
				<MenuItem icon={RiEditLine} onClick={onClose}>
					View Details
				</MenuItem>

				<MenuItem icon={RiPencilLine} onClick={handleRename}>
					Rename Table
				</MenuItem>
				<MenuSeparator />

				<MenuItem icon={RiAddLine} onClick={handleAddField}>
					Add Field
				</MenuItem>
				<MenuItem icon={RiLinksLine} onClick={handleAddRelationship}>
					Add Relationship
				</MenuItem>

				<MenuSeparator />

				<MenuItem icon={RiFileCopyLine} onClick={onClose} disabled>
					Duplicate Table
				</MenuItem>

				<MenuSeparator />

				<MenuItem icon={RiDeleteBinLine} onClick={handleDelete} destructive>
					Delete Table
				</MenuItem>
			</div>

			{/* Backdrop to close menu */}
			<div className='fixed inset-0 z-40' onClick={onClose} />

			{/* Delete confirmation dialog */}
			<DeleteTableDialog
				isOpen={deleteDialogOpen}
				onOpenChange={(open) => !open && handleDeleteComplete()}
				tableId={table.id}
				tableName={table.name}
				onTableDeleted={handleDeleteComplete}
			/>
		</>
	);
}

// ============================================================================
// Edge Context Menu
// ============================================================================

export function EdgeContextMenu({ relationship, position, onClose }: EdgeContextMenuProps) {
	const stack = useCardStack();
	const { getForeignKeyConstraint } = useVisualizerContext();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const deleteForeignKeyMutation = useDeleteForeignKey();

	if (!relationship || !position) return null;

	const fkConstraint = getForeignKeyConstraint(relationship);
	const canEdit = fkConstraint !== null;
	const canDelete = fkConstraint !== null;

	const handleEdit = () => {
		if (!fkConstraint) {
			showErrorToast({
				message: 'Cannot edit relationship',
				description: 'Could not find the foreign key constraint.',
			});
			onClose();
			return;
		}

		stack.push({
			id: `edit-relationship-${fkConstraint.id}`,
			title: 'Edit Relationship',
			Component: RelationshipCard,
			props: { editingRelationship: fkConstraint },
			width: CARD_WIDTHS.medium,
		});
		onClose();
	};

	const handleDelete = async () => {
		if (!fkConstraint) {
			showErrorToast({
				message: 'Cannot delete relationship',
				description: 'Could not find the foreign key constraint.',
			});
			return;
		}

		try {
			await deleteForeignKeyMutation.mutateAsync({ id: fkConstraint.id });
			showSuccessToast({
				message: 'Relationship deleted',
				description: 'The foreign key relationship has been removed.',
			});
			setDeleteDialogOpen(false);
			onClose();
		} catch (error) {
			showErrorToast({
				message: 'Failed to delete relationship',
				description: error instanceof Error ? error.message : 'An unexpected error occurred.',
			});
		}
	};

	return (
		<>
			{/* Custom positioned context menu */}
			<div
				className='bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed z-50 min-w-[160px]
					overflow-hidden rounded-md border p-1 shadow-md'
				style={{ left: position.x, top: position.y }}
			>
				<MenuItem icon={RiEditLine} onClick={handleEdit} disabled={!canEdit}>
					Edit Relationship
				</MenuItem>

				<MenuSeparator />

				<div className='px-2 py-1.5'>
					<div className='text-muted-foreground text-xs font-medium'>FK Actions</div>
				</div>
				<div className='text-muted-foreground px-2 pb-1.5 text-xs'>
					{relationship.onDelete && <div>ON DELETE: {relationship.onDelete}</div>}
					{relationship.onUpdate && <div>ON UPDATE: {relationship.onUpdate}</div>}
				</div>

				<MenuSeparator />

				<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
					<AlertDialogTrigger asChild>
						<button
							className={`relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-xs
								transition-colors outline-none select-none
								${!canDelete ? 'text-muted-foreground pointer-events-none opacity-50' : ''} text-destructive
								hover:bg-destructive/10 focus:bg-destructive/10`}
							disabled={!canDelete}
						>
							<RiDeleteBinLine className='mr-2 size-3.5' />
							Delete Relationship
						</button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Relationship</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete this foreign key relationship? This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
							>
								{deleteForeignKeyMutation.isPending ? 'Deleting...' : 'Delete'}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>

			{/* Backdrop to close menu */}
			<div className='fixed inset-0 z-40' onClick={onClose} />
		</>
	);
}

// ============================================================================
// Pane Context Menu
// ============================================================================

export function PaneContextMenu({
	position,
	onClose,
	onFitView,
	showSystemTables,
	onToggleSystemTables,
}: PaneContextMenuProps) {
	const stack = useCardStack();

	if (!position) return null;

	const handleCreateTable = () => {
		stack.push({
			id: 'create-table-select-model',
			title: 'Create Table',
			description: 'Securely create a new table based on its access model',
			Component: AccessModelSelectorCard,
			props: {},
			width: CARD_WIDTHS.extraWide,
		});
		onClose();
	};

	const handleFitView = () => {
		onFitView?.();
		onClose();
	};

	const handleToggleSystemTables = () => {
		onToggleSystemTables?.();
		onClose();
	};

	return (
		<>
			{/* Custom positioned context menu */}
			<div
				className='bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 fixed z-50 min-w-[160px]
					overflow-hidden rounded-md border p-1 shadow-md'
				style={{ left: position.x, top: position.y }}
			>
				<MenuItem icon={RiTableLine} onClick={handleCreateTable}>
					Create Table
				</MenuItem>

				<MenuSeparator />

				<MenuItem icon={RiFullscreenLine} onClick={handleFitView}>
					Fit View
				</MenuItem>

				<MenuItem icon={showSystemTables ? RiEyeOffLine : RiEyeLine} onClick={handleToggleSystemTables}>
					{showSystemTables ? 'Hide System Tables' : 'Show System Tables'}
				</MenuItem>
			</div>

			{/* Backdrop to close menu */}
			<div className='fixed inset-0 z-40' onClick={onClose} />
		</>
	);
}

// ============================================================================
// Helper Components
// ============================================================================

interface MenuItemProps {
	children: React.ReactNode;
	icon?: React.ComponentType<{ className?: string }>;
	onClick?: () => void;
	destructive?: boolean;
	disabled?: boolean;
}

function MenuItem({ children, icon: Icon, onClick, destructive, disabled }: MenuItemProps) {
	return (
		<button
			className={`relative flex w-full cursor-default items-center rounded-sm px-2 py-1.5 text-xs transition-colors
				outline-none select-none ${disabled ? 'text-muted-foreground pointer-events-none opacity-50' : ''}
				${destructive ? 'text-destructive hover:bg-destructive/10 focus:bg-destructive/10' : 'hover:bg-accent focus:bg-accent'}
				`}
			onClick={onClick}
			disabled={disabled}
		>
			{Icon && <Icon className='mr-2 size-3.5' />}
			{children}
		</button>
	);
}

function MenuSeparator() {
	return <div className='bg-muted -mx-1 my-1 h-px' />;
}

// ============================================================================
// Context Menu State Hook
// ============================================================================

export interface ContextMenuState {
	type: 'node' | 'edge' | 'pane' | null;
	position: ContextMenuPosition | null;
	nodeId: string | null;
	edgeId: string | null;
}

export function useContextMenuState() {
	const [state, setState] = useState<ContextMenuState>({
		type: null,
		position: null,
		nodeId: null,
		edgeId: null,
	});

	const openNodeMenu = useCallback((nodeId: string, x: number, y: number) => {
		setState({
			type: 'node',
			position: { x, y },
			nodeId,
			edgeId: null,
		});
	}, []);

	const openEdgeMenu = useCallback((edgeId: string, x: number, y: number) => {
		setState({
			type: 'edge',
			position: { x, y },
			nodeId: null,
			edgeId,
		});
	}, []);

	const openPaneMenu = useCallback((x: number, y: number) => {
		setState({
			type: 'pane',
			position: { x, y },
			nodeId: null,
			edgeId: null,
		});
	}, []);

	const closeMenu = useCallback(() => {
		setState({
			type: null,
			position: null,
			nodeId: null,
			edgeId: null,
		});
	}, []);

	return {
		...state,
		openNodeMenu,
		openEdgeMenu,
		openPaneMenu,
		closeMenu,
	};
}
