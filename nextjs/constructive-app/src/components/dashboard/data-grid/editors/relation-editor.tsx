import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { type GridCell } from '@glideapps/glide-data-grid';
import { Check, Link, Search, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { queryKeys, useTable } from '@/lib/gql';
import { useDashboardCacheScopeKey } from '@/lib/gql/hooks/dashboard/use-dashboard-cache-scope';
import { useMeta } from '@/lib/gql/hooks/dashboard/use-dashboard-meta-query';
import { cn } from '@/lib/utils';
import { useAppStore, useShallow } from '@/store/app-store';
import { Badge } from '@constructive-io/ui/badge';
import { Button } from '@constructive-io/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@constructive-io/ui/input-group';
import { Label } from '@constructive-io/ui/label';
import { ScrollArea } from '@constructive-io/ui/scroll-area';

import { EditorFocusTrap } from './editor-focus-trap';
import { RelationRecordTooltip } from './relation-record-tooltip';

type RelationKind = 'belongsTo' | 'hasOne' | 'hasMany' | 'manyToMany';

/** Data passed to onSaveComplete for optimistic updates */
export interface RelationSaveData {
	/** The selected record(s) - single object for belongsTo/hasOne, array for hasMany/manyToMany */
	relationData: unknown;
	/** The foreign key value (ID) for belongsTo relations */
	foreignKeyValue: unknown;
}

interface RelationEditorProps {
	value: GridCell;
	onFinishedEditing: (newValue?: GridCell) => void;
	tableName: string;
	recordId?: string | number | null;
	fieldName: string;
	currentValue: unknown;
	/** Called after successful save with data for optimistic updates */
	onSaveComplete?: (data: RelationSaveData) => void;
}

function coerceToArray(v: unknown): any[] {
	if (v == null) return [];
	if (Array.isArray(v)) return v;
	if (typeof v === 'object') return [v];
	try {
		const parsed = typeof v === 'string' ? JSON.parse(v) : v;
		if (Array.isArray(parsed)) return parsed;
		if (parsed && typeof parsed === 'object') return [parsed];
	} catch {}
	return [];
}

function getRelationDisplayText(relation: any): string {
	if (!relation || typeof relation !== 'object') {
		return String(relation || '');
	}

	// Try common display field patterns
	const displayFields = ['name', 'title', 'label', 'displayName', 'fullName', 'email', 'username'];

	for (const field of displayFields) {
		if (relation[field] != null && String(relation[field]).trim()) {
			return String(relation[field]);
		}
	}

	// Fallback to ID
	if (relation.id != null) {
		return `Record ${relation.id}`;
	}

	return 'Unknown Record';
}

export const RelationEditor: React.FC<RelationEditorProps> = ({
	onFinishedEditing,
	tableName,
	recordId,
	fieldName,
	currentValue,
	onSaveComplete,
}) => {
	const { data: meta } = useMeta();
	const scopeKey = useDashboardCacheScopeKey();
	const queryClient = useQueryClient();
	const { ensureRelationInfo, relationInfoForTable } = useAppStore(
		useShallow((s) => ({
			ensureRelationInfo: s.ensureRelationInfo,
			relationInfoForTable: tableName ? s.relationInfoCache[tableName] : undefined,
		})),
	);

	const relationEntry = relationInfoForTable?.[fieldName];

	// Resolve relation kind/table from global cache
	useEffect(() => {
		if (!tableName) return;
		if (relationInfoForTable?.[fieldName]) return;
		ensureRelationInfo(tableName, meta);
	}, [tableName, fieldName, meta, ensureRelationInfo, relationInfoForTable]);

	const relationDef = useMemo(() => {
		const entry = relationEntry;
		if (!entry) return null as null | { kind: RelationKind; relatedTable?: string };
		return { kind: entry.kind as RelationKind, relatedTable: entry.relatedTable };
	}, [relationEntry]);

	const isMulti = relationDef?.kind === 'hasMany' || relationDef?.kind === 'manyToMany';
	const relatedTableName = relationDef?.relatedTable;
	const isManyToMany = relationDef?.kind === 'manyToMany';
	const requiredMetaMissing = useMemo(() => {
		if (!relationEntry || recordId == null) return true;
		if (typeof recordId === 'string' && recordId.startsWith('draft:')) return true;
		if (!relationEntry.relatedTable) return true;
		switch (relationEntry.kind) {
			case 'belongsTo':
				return !relationEntry.foreignKeyField;
			case 'hasOne':
			case 'hasMany':
				return !relationEntry.foreignKeyField;
			case 'manyToMany':
				return !(
					relationEntry.junctionTable &&
					relationEntry.junctionLeftKeyField &&
					relationEntry.junctionRightKeyField
				);
			default:
				return true;
		}
	}, [relationEntry, recordId]);

	const canPersist = Boolean(relationEntry && !requiredMetaMissing);

	// Current selected relations
	const initialSelection = useMemo(() => coerceToArray(currentValue), [currentValue]);
	const [editingValue, setEditingValue] = useState<any[]>(initialSelection);
	const [searchQuery, setSearchQuery] = useState('');

	// Display candidates from global cache
	const displayCandidates = useMemo(() => {
		const entry = relationEntry;
		return entry?.displayCandidates?.length ? entry.displayCandidates : ['name', 'displayName', 'fullName', 'title'];
	}, [relationEntry]);

	// Query related table options
	const whereFilter = useMemo(() => {
		if (!searchQuery.trim() || displayCandidates.length === 0) return undefined;
		const includesFilters = displayCandidates.map((f) => ({ [f]: { includesInsensitive: searchQuery } }));
		return { or: includesFilters } as any;
	}, [searchQuery, displayCandidates]);

	const { data: options = [], isLoading } = useTable(relatedTableName || '', {
		enabled: !!relatedTableName,
		select: 'all', // Fetch all fields to support JSON preview tooltip
		limit: 20,
		where: whereFilter,
	}) as any;

	const { data: junctionRows = [], isLoading: isJunctionLoading } = useTable(relationEntry?.junctionTable || '', {
		enabled:
			canPersist &&
			isManyToMany &&
			recordId != null &&
			!!relationEntry?.junctionTable &&
			!!relationEntry?.junctionLeftKeyField,
		select:
			relationEntry?.junctionLeftKeyField && relationEntry?.junctionRightKeyField
				? {
					select: ['id', relationEntry.junctionLeftKeyField, relationEntry.junctionRightKeyField],
				}
				: 'minimal',
		limit: 500,
		where:
			relationEntry?.junctionLeftKeyField && recordId != null
				? ({ [relationEntry.junctionLeftKeyField]: { equalTo: recordId } } as any)
				: undefined,
	}) as any;

	const parentTable = useTable(tableName, { enabled: false }) as any;
	const relatedTable = useTable(relatedTableName || '', { enabled: false }) as any;
	const junctionTable = useTable(relationEntry?.junctionTable || '', { enabled: false }) as any;

	const [isSaving, setIsSaving] = useState(false);

	const handleSave = useCallback(() => {
		void (async () => {
			if (!relationEntry || recordId == null) {
				onFinishedEditing();
				return;
			}
			if (!canPersist) {
				onFinishedEditing();
				return;
			}

			const getRecordId = (r: any): string | number | null => {
				if (r == null) return null;
				if (typeof r === 'string' || typeof r === 'number') return r;
				if (typeof r === 'object' && (typeof r.id === 'string' || typeof r.id === 'number')) return r.id;
				return null;
			};

			setIsSaving(true);
			try {
				const initialIds = new Set(initialSelection.map(getRecordId).filter((id): id is string | number => id != null));
				const nextIds = new Set(editingValue.map(getRecordId).filter((id): id is string | number => id != null));

				if (relationEntry.kind === 'belongsTo') {
					const selectedId = Array.from(nextIds)[0] ?? null;
					const fkField = relationEntry.foreignKeyField;
					if (!fkField) throw new Error('Missing foreignKeyField for belongsTo relation');
					await parentTable.update(recordId, { [fkField]: selectedId });
					onSaveComplete?.({
						relationData: editingValue[0] ?? null,
						foreignKeyValue: selectedId,
					});
					onFinishedEditing();
					return;
				}

				if (relationEntry.kind === 'hasOne') {
					const fkField = relationEntry.foreignKeyField;
					if (!fkField) throw new Error('Missing foreignKeyField for hasOne relation');
					const prevId = Array.from(initialIds)[0] ?? null;
					const nextId = Array.from(nextIds)[0] ?? null;
					if (prevId && prevId !== nextId) {
						await relatedTable.update(prevId, { [fkField]: null });
					}
					if (nextId) {
						await relatedTable.update(nextId, { [fkField]: recordId });
					}
					await queryClient.invalidateQueries({ queryKey: queryKeys.table(scopeKey, tableName) });
					onSaveComplete?.({
						relationData: editingValue[0] ?? null,
						foreignKeyValue: null, // hasOne FK is on related table, not parent
					});
					onFinishedEditing();
					return;
				}

				if (relationEntry.kind === 'hasMany') {
					const fkField = relationEntry.foreignKeyField;
					if (!fkField) throw new Error('Missing foreignKeyField for hasMany relation');
					const toAdd = Array.from(nextIds).filter((id) => !initialIds.has(id));
					const toRemove = Array.from(initialIds).filter((id) => !nextIds.has(id));

					await Promise.all([
						...toAdd.map((id) => relatedTable.update(id, { [fkField]: recordId })),
						...toRemove.map((id) => relatedTable.update(id, { [fkField]: null })),
					]);
					await queryClient.invalidateQueries({ queryKey: queryKeys.table(scopeKey, tableName) });
					onSaveComplete?.({
						relationData: editingValue,
						foreignKeyValue: null, // hasMany FK is on related table, not parent
					});
					onFinishedEditing();
					return;
				}

				if (relationEntry.kind === 'manyToMany') {
					const jt = relationEntry.junctionTable;
					const leftFk = relationEntry.junctionLeftKeyField;
					const rightFk = relationEntry.junctionRightKeyField;
					if (!jt || !leftFk || !rightFk) throw new Error('Missing junction metadata for manyToMany relation');

					const toAdd = Array.from(nextIds).filter((id) => !initialIds.has(id));
					const toRemove = Array.from(initialIds).filter((id) => !nextIds.has(id));

					const rows: any[] = Array.isArray(junctionRows) ? junctionRows : [];
					const byRight = new Map<string | number, any>();
					rows.forEach((r) => {
						const rightId = r?.[rightFk];
						if (rightId != null) byRight.set(rightId, r);
					});

					await Promise.all([
						...toAdd.map((id) => junctionTable.create({ [leftFk]: recordId, [rightFk]: id })),
						...toRemove
							.map((id) => byRight.get(id))
							.filter(Boolean)
							.map((row) => junctionTable.delete(row.id)),
					]);
					await Promise.all([
						queryClient.invalidateQueries({ queryKey: queryKeys.table(scopeKey, tableName) }),
						queryClient.invalidateQueries({ queryKey: queryKeys.table(scopeKey, jt) }),
					]);
					onSaveComplete?.({
						relationData: editingValue,
						foreignKeyValue: null, // manyToMany uses junction table, no direct FK
					});
					onFinishedEditing();
					return;
				}

				onFinishedEditing();
			} finally {
				setIsSaving(false);
			}
		})();
	}, [
		canPersist,
		editingValue,
		initialSelection,
		onFinishedEditing,
		onSaveComplete,
		recordId,
		relationEntry,
		relatedTable,
		junctionRows,
		junctionTable,
		parentTable,
		queryClient,
		tableName,
	]);

	const handleCancel = useCallback(() => {
		onFinishedEditing();
	}, [onFinishedEditing]);

	const handleRemoveRelation = useCallback(
		(index: number) => {
			if (!canPersist || isSaving) return;
			setEditingValue((prev) => prev.filter((_, i) => i !== index));
		},
		[canPersist, isSaving],
	);

	const togglePick = useCallback(
		(record: any) => {
			if (!canPersist || isSaving) return;
			setEditingValue((prev) => {
				const id = record?.id ?? JSON.stringify(record);
				const exists = prev.find((r) => (r?.id ?? JSON.stringify(r)) === id);
				if (exists) return prev.filter((r) => (r?.id ?? JSON.stringify(r)) !== id);
				if (isMulti) return [...prev, record];
				return [record];
			});
		},
		[canPersist, isMulti, isSaving],
	);

	// Handle Ctrl+Enter to save
	const handleEditorKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				if (canPersist && !isSaving) handleSave();
			}
		},
		[canPersist, handleSave, isSaving],
	);

	return (
		<EditorFocusTrap
      onEscape={handleCancel}
      onKeyDown={handleEditorKeyDown}
      className='bg-background flex max-w-[500px] min-w-[400px] flex-col gap-4 rounded-lg border p-4 shadow-lg'
    >
			{/* Header */}
			<div className='flex items-center gap-2'>
				<Link className='text-muted-foreground h-4 w-4' />
				<h3 className='text-sm font-medium'>{canPersist ? 'Edit Relations' : 'Related Records'}</h3>
				{isMulti && editingValue.length > 0 && (
					<Badge variant='secondary' size='sm' className='ml-auto tabular-nums'>
						{editingValue.length}
					</Badge>
				)}
			</div>

			{/* Current Relations */}
			<div className='space-y-2'>
				<div className='flex items-center gap-2'>
					<Label className='text-muted-foreground text-xs'>Current Relations</Label>
					{editingValue.length > 0 && (
						<Badge variant='outline' size='sm' className='tabular-nums'>
							{editingValue.length}
						</Badge>
					)}
				</div>
				<ScrollArea className='max-h-50 rounded-md border'>
					<div className='space-y-2 p-2'>
						{editingValue.length === 0 ? (
							<div className='text-muted-foreground py-4 text-center text-sm'>No relations linked</div>
						) : (
							editingValue.map((relation, index) => {
								const displayText = getRelationDisplayText(relation);
								return (
									<div key={index} className='bg-muted flex items-center gap-2 rounded-md p-2'>
										<RelationRecordTooltip record={relation} />
										<span className='min-w-0 flex-1 truncate text-sm'>{displayText}</span>
										<Badge variant='outline' className='text-2xs shrink-0'>
											{String(relation.id || index + 1).slice(0, 8)}
										</Badge>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => handleRemoveRelation(index)}
											disabled={!canPersist}
											className='text-muted-foreground hover:text-destructive h-6 w-6 shrink-0 p-0'
										>
											<X className='h-3 w-3' />
										</Button>
									</div>
								);
							})
						)}
					</div>
				</ScrollArea>
			</div>

				<div className='flex flex-col space-y-2'>
					<Label htmlFor='search' className='flex items-center gap-1 text-muted-foreground text-xs'>
						<span>Add from</span>
						<Badge variant='outline' size='sm' className='px-1'>{relatedTableName || 'related'}</Badge>
					</Label>

					<InputGroup>
						<InputGroupAddon>
							<Search />
						</InputGroupAddon>
						<InputGroupInput
							id='search'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder='Type to search...'
							size='sm'
						/>
					</InputGroup>

					<ScrollArea className='max-h-65 rounded-md border'>
						<div data-testid='relation-options' className='space-y-1 p-2'>
							{(isLoading || (isManyToMany && isJunctionLoading)) && (
								<div className='text-muted-foreground py-6 text-center text-sm'>Loading...</div>
							)}
							{!isLoading && options.length === 0 && (
								<div className='text-muted-foreground py-6 text-center text-sm'>No records found</div>
							)}
							{options.map((row: any) => {
								const id = row?.id ?? JSON.stringify(row);
								const label = getRelationDisplayTextFromCandidates(row, displayCandidates);
								const active = editingValue.find((r) => (r?.id ?? JSON.stringify(r)) === id);
							const disabled = !canPersist || isSaving;
								return (
								<div
										key={id}
									role='button'
									tabIndex={disabled ? -1 : 0}
									aria-disabled={disabled}
									onClick={() => {
										if (disabled) return;
										togglePick(row);
									}}
									onKeyDown={(e) => {
										if (disabled) return;
										if (e.key !== 'Enter' && e.key !== ' ') return;
										e.preventDefault();
										togglePick(row);
									}}
										className={cn(
										'w-full rounded-md px-2 py-1.5 text-left',
										!disabled && 'hover:bg-accent/50 cursor-pointer',
										disabled && 'cursor-not-allowed opacity-50',
											active && 'bg-accent/60',
										)}
									>
										<div className='flex items-center gap-2'>
											<RelationRecordTooltip record={row} />
											<span className='min-w-0 flex-1 truncate text-sm'>{label}</span>
											<Badge variant='outline' className='text-2xs shrink-0'>
												{String(row?.id ?? '—').slice(0, 8)}
											</Badge>
										</div>
								</div>
								);
							})}
						</div>
					</ScrollArea>
				</div>

			<div className='flex justify-end gap-2'>
				<Button variant='outline' size='sm' onClick={handleCancel} disabled={isSaving}>
					<X className='mr-1 h-3 w-3' />
					{canPersist ? 'Cancel' : 'Close'}
				</Button>
				{canPersist && (
					<Button size='sm' onClick={handleSave} disabled={isSaving || isLoading || (isManyToMany && isJunctionLoading)}>
						<Check className='mr-1 h-3 w-3' />
						Save
					</Button>
				)}
			</div>
		</EditorFocusTrap>
	);
};

function getRelationDisplayTextFromCandidates(row: any, candidates: string[]): string {
	if (!row || typeof row !== 'object') return String(row ?? '');
	for (const c of candidates) {
		if (row[c] != null && String(row[c]).trim()) return String(row[c]);
	}
	if ('id' in row) return `Record ${row.id}`;
	return 'Unknown Record';
}
