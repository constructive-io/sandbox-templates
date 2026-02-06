'use client';

import { Building2, Clock, Database, Eye, Table2, User, Users } from 'lucide-react';

import { Connector, DiagramNode, FanConnector, ScopeContainer } from './diagram-primitives';
import { getDiagramTheme } from './diagram-themes';

// ============================================================================
// Shared Helpers
// ============================================================================

const getMembershipLabel = (value: unknown) => {
	if (value === 1) return 'Group';
	if (value === 2) return 'Org';
	if (value === 3) return 'App';
	return 'scope';
};

// ============================================================================
// Ownership Diagrams
// ============================================================================

interface DiagramProps {
	tableName: string;
	config: Record<string, unknown>;
}

export function DirectOwnerDiagram({ tableName, config }: DiagramProps) {
	const theme = getDiagramTheme('DirectOwner');
	const fieldLabel = (config.entity_field as string) || 'owner_id';

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='User' theme={theme} />
			<FanConnector theme={theme} topLabel={fieldLabel} topLabelFilled={!!config.entity_field} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

export function DirectOwnerAnyDiagram({ tableName, config }: DiagramProps) {
	const theme = getDiagramTheme('DirectOwnerAny');
	const entityFields = Array.isArray(config.entity_fields) ? config.entity_fields : undefined;
	const fields = entityFields?.length ? entityFields : ['field1', 'field2'];
	const hasFields = entityFields && entityFields.length > 0;
	const fieldsLabel = fields.slice(0, 2).join(' | ') + (fields.length > 2 ? ' | ...' : '');

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='Users' theme={theme} stacked />
			<FanConnector theme={theme} topLabel={fieldsLabel} topLabelFilled={hasFields} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

export function ArrayContainsActorByJoinDiagram({ tableName, config }: DiagramProps) {
	const theme = getDiagramTheme('ArrayContainsActorByJoin');
	const tableLabel = (config.owned_table as string) || 'table';
	const arrayLabel = (config.owned_table_key as string) || 'members[]';
	const fkLabel = (config.this_object_key as string) || 'field';

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='User' theme={theme} />
			<Connector theme={theme} width={50} topLabel={arrayLabel} topLabelFilled={!!config.owned_table_key} />
			<DiagramNode icon={Table2} label={tableLabel} theme={theme} />
			<FanConnector theme={theme} topLabel={fkLabel} topLabelFilled={!!config.this_object_key} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

// ============================================================================
// Membership Diagrams
// ============================================================================

export function MembershipDiagram({ tableName, config }: DiagramProps) {
	const theme = getDiagramTheme('Membership');
	const scopeLabel = getMembershipLabel(config.membership_type);
	const isAdmin = config.is_admin as boolean;
	const permission = config.permission as string;

	const accessParts: string[] = [];
	if (isAdmin) accessParts.push('Admin');
	if (permission) accessParts.push(permission);
	const accessLabel = accessParts.length > 0 ? accessParts.join(' / ') : 'access';
	const hasFilled = isAdmin || !!permission;

	return (
		<div className='flex items-center justify-center gap-3'>
			<ScopeContainer theme={theme} label={scopeLabel}>
				<div
					className='flex h-12 w-12 items-center justify-center rounded-full border-2'
					style={{ borderColor: theme.border, backgroundColor: 'white' }}
				>
					<User size={24} style={{ color: theme.primary }} />
				</div>
			</ScopeContainer>
			<FanConnector theme={theme} topLabel={accessLabel} topLabelFilled={hasFilled} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

export function MembershipByFieldDiagram({ tableName, config }: DiagramProps) {
	const theme = getDiagramTheme('MembershipByField');
	const fieldLabel = (config.entity_field as string) || 'entity_id';
	const scopeLabel = getMembershipLabel(config.membership_type);

	return (
		<div className='flex items-center justify-center gap-3'>
			<ScopeContainer theme={theme} label={scopeLabel}>
				<div className='flex items-center gap-3'>
					<div
						className='flex h-10 w-10 items-center justify-center rounded-full border-2'
						style={{ borderColor: theme.border, backgroundColor: 'white' }}
					>
						<User size={20} style={{ color: theme.primary }} />
					</div>
					<div className='flex items-center gap-1 text-gray-400 dark:text-gray-500'>
						<span className='text-lg'>·</span>
						<span className='text-lg'>·</span>
					</div>
					<div
						className='flex h-10 w-10 items-center justify-center rounded-full border-2'
						style={{ borderColor: theme.border, backgroundColor: 'white' }}
					>
						<Building2 size={20} style={{ color: theme.primary }} />
					</div>
				</div>
			</ScopeContainer>
			<FanConnector theme={theme} topLabel={fieldLabel} topLabelFilled={!!config.entity_field} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

export function MembershipByJoinDiagram({ tableName, config }: DiagramProps) {
	const theme = getDiagramTheme('MembershipByJoin');
	const fkLabel = (config.entity_field as string) || 'field';
	const tableLabel = (config.obj_table as string) || 'table';
	const ownerLabel = (config.obj_field as string) || 'owner';
	const scopeLabel = getMembershipLabel(config.membership_type);

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='User' theme={theme} size='sm' />
			<Connector theme={theme} width={40} />
			<DiagramNode icon={Users} label={scopeLabel} theme={theme} size='sm' />
			<Connector theme={theme} width={40} topLabel={ownerLabel} topLabelFilled={!!config.obj_field} />
			<DiagramNode icon={Table2} label={tableLabel} theme={theme} size='sm' />
			<FanConnector theme={theme} topLabel={fkLabel} topLabelFilled={!!config.entity_field} />
			<DiagramNode icon={Database} label={tableName} theme={theme} size='sm' stacked />
		</div>
	);
}

// ============================================================================
// Array/List Membership Diagrams
// ============================================================================

export function ArrayContainsActorDiagram({ tableName, config }: DiagramProps) {
	const theme = getDiagramTheme('ArrayContainsActor');
	const arrayField = (config.array_field as string) || 'member_ids';

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='User' theme={theme} />
			<Connector theme={theme} width={50} topLabel='∈' topLabelFilled />
			<div className='flex flex-col items-center gap-2'>
				<div
					className='relative flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-sm'
					style={{ borderColor: theme.border, backgroundColor: theme.light }}
				>
					<Users size={24} style={{ color: theme.primary }} />
					<div
						className='absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px]
							font-bold'
						style={{ backgroundColor: theme.primary, color: 'white' }}
					>
						[]
					</div>
				</div>
				<span
					className='rounded border px-1.5 py-px text-[10px] leading-tight font-medium'
					style={{ borderColor: theme.primary, backgroundColor: theme.light, color: theme.primary }}
				>
					{arrayField}
				</span>
			</div>
			<FanConnector theme={theme} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

// ============================================================================
// Hierarchy Diagrams
// ============================================================================

export function OrgHierarchyDiagram({ tableName, config }: DiagramProps) {
	const theme = getDiagramTheme('OrgHierarchy');
	const direction = (config.direction as string) || 'down';
	const isDown = direction === 'down';

	return (
		<div className='flex items-center justify-center gap-2'>
			{/* Hierarchy indicator: two users with arrow showing direction */}
			<div className='flex flex-col items-center'>
				<div className='relative flex items-center gap-0.5'>
					{/* Viewer (manager or staff depending on direction) */}
					<div
						className='flex h-10 w-10 items-center justify-center rounded-full border-2'
						style={{
							borderColor: theme.primary,
							backgroundColor: theme.light,
						}}
					>
						<User size={18} style={{ color: theme.primary }} />
					</div>
					{/* Direction arrow */}
					<svg width='24' height='20' viewBox='0 0 24 20' fill='none'>
						<line x1='4' y1='10' x2='16' y2='10' stroke={theme.connector} strokeWidth='2' />
						<polygon points={isDown ? '20,10 14,6 14,14' : '4,10 10,6 10,14'} fill={theme.connector} />
					</svg>
					{/* Target user (staff or manager) */}
					<div
						className='flex h-8 w-8 items-center justify-center rounded-full border-2'
						style={{
							borderColor: theme.border,
							backgroundColor: 'white',
						}}
					>
						<User size={14} style={{ color: theme.primary }} />
					</div>
				</div>
				<span className='mt-1 text-[10px] font-medium' style={{ color: theme.primary }}>
					{isDown ? 'Manager → Staff' : 'Staff → Manager'}
				</span>
			</div>
			<Connector theme={theme} width={40} topLabel='sees' topLabelFilled />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

// ============================================================================
// Temporal/Publishing Diagrams
// ============================================================================

export function PublishableDiagram({ tableName, config }: DiagramProps) {
	const theme = getDiagramTheme('Publishable');
	const publishedField = (config.is_published_field as string) || 'is_published';

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='User' theme={theme} />
			<Connector theme={theme} width={50} topLabel='reads' topLabelFilled />
			<div className='flex flex-col items-center gap-2'>
				<div className='relative'>
					<div
						className='flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-sm'
						style={{ borderColor: theme.border, backgroundColor: theme.light }}
					>
						<Eye size={24} style={{ color: theme.primary }} />
					</div>
					<div
						className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full'
						style={{ backgroundColor: '#22C55E' }}
					>
						<svg width='12' height='12' viewBox='0 0 12 12' fill='none'>
							<path d='M2 6L5 9L10 3' stroke='white' strokeWidth='2' strokeLinecap='round' />
						</svg>
					</div>
				</div>
				<span
					className='rounded border px-1.5 py-px text-[10px] leading-tight font-medium'
					style={{ borderColor: theme.primary, backgroundColor: theme.light, color: theme.primary }}
				>
					{publishedField}
				</span>
			</div>
			<FanConnector theme={theme} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

export function TemporalDiagram({ tableName, config }: DiagramProps) {
	const theme = getDiagramTheme('Temporal');
	const fromField = (config.valid_from_field as string) || 'valid_from';
	const untilField = (config.valid_until_field as string) || 'valid_until';

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='User' theme={theme} />
			<Connector theme={theme} width={40} />
			<div className='flex flex-col items-center gap-1'>
				<div
					className='relative flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm'
					style={{ borderColor: theme.border, backgroundColor: theme.light }}
				>
					<Clock size={20} style={{ color: theme.primary }} />
				</div>
				<div className='flex items-center gap-1'>
					<span
						className='rounded border px-1 py-px text-[9px] leading-tight font-medium'
						style={{ borderColor: theme.border, backgroundColor: 'white', color: theme.primary }}
					>
						{fromField}
					</span>
					<span className='text-[10px] text-gray-400'>→</span>
					<span
						className='rounded border px-1 py-px text-[9px] leading-tight font-medium'
						style={{ borderColor: theme.border, backgroundColor: 'white', color: theme.primary }}
					>
						{untilField}
					</span>
				</div>
			</div>
			<FanConnector theme={theme} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

// ============================================================================
// Simple Access Diagrams
// ============================================================================

export function AllowAllDiagram({ tableName }: { tableName: string }) {
	const theme = getDiagramTheme('AllowAll');

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='Anyone' theme={theme} />
			<div className='relative flex flex-col items-center justify-center'>
				<svg width={60} height='40' viewBox='0 0 60 40' fill='none'>
					<circle cx='6' cy='20' r='4' fill={theme.connector} />
					<line x1='10' y1='20' x2='50' y2='20' stroke={theme.connectorLight} strokeWidth='2.5' strokeLinecap='round' />
					<circle cx='54' cy='20' r='4' fill={theme.connector} />
					{/* Checkmark icon in circle */}
					<circle cx='30' cy='20' r='10' fill={theme.light} stroke={theme.primary} strokeWidth='1.5' />
					<path
						d='M24 20L28 24L36 16'
						stroke={theme.primary}
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				</svg>
			</div>
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

export function DenyAllDiagram({ tableName }: { tableName: string }) {
	const theme = getDiagramTheme('DenyAll');

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='Anyone' theme={theme} />
			<div className='relative flex flex-col items-center justify-center'>
				<svg width={60} height='40' viewBox='0 0 60 40' fill='none'>
					<circle cx='6' cy='20' r='4' fill={theme.connector} />
					<line
						x1='10'
						y1='20'
						x2='50'
						y2='20'
						stroke={theme.connectorLight}
						strokeWidth='2.5'
						strokeLinecap='round'
						strokeDasharray='4 3'
					/>
					<circle cx='54' cy='20' r='4' fill={theme.connector} />
					{/* X icon in circle */}
					<circle cx='30' cy='20' r='10' fill={theme.light} stroke={theme.primary} strokeWidth='1.5' />
					<path d='M25 15L35 25M35 15L25 25' stroke={theme.primary} strokeWidth='2' strokeLinecap='round' />
				</svg>
			</div>
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

// ============================================================================
// Composite Diagram
// ============================================================================

export function CompositeDiagram({ tableName }: { tableName: string }) {
	const theme = getDiagramTheme('Composite');

	return (
		<div className='flex items-center justify-center gap-2'>
			{/* Stacked policy nodes */}
			<div className='flex flex-col items-center gap-1'>
				<div
					className='flex h-10 w-10 items-center justify-center rounded-lg border-2 shadow-sm'
					style={{ borderColor: theme.border, backgroundColor: theme.light }}
				>
					<User size={18} style={{ color: theme.primary }} />
				</div>
				<div
					className='flex h-10 w-10 items-center justify-center rounded-lg border-2 shadow-sm'
					style={{ borderColor: theme.border, backgroundColor: theme.light }}
				>
					<Users size={18} style={{ color: theme.primary }} />
				</div>
				<span className='text-muted-foreground text-[10px]'>Rules</span>
			</div>

			{/* Logic gate */}
			<div className='relative flex flex-col items-center justify-center'>
				<svg width={86} height='60' viewBox='0 0 86 60' fill='none'>
					{/* Input lines from stacked nodes */}
					<line x1='0' y1='20' x2='12' y2='30' stroke={theme.connectorLight} strokeWidth='2' />
					<line x1='0' y1='40' x2='12' y2='30' stroke={theme.connectorLight} strokeWidth='2' />
					{/* Gate body */}
					<rect x='12' y='18' width='54' height='24' rx='4' fill={theme.light} stroke={theme.primary} strokeWidth='1.5' />
					{/* Operator text */}
					<text x='39' y='34' textAnchor='middle' fontSize='10' fontWeight='600' fill={theme.primary}>
						AND/OR
					</text>
					{/* Output line */}
					<line x1='66' y1='30' x2='86' y2='30' stroke={theme.connector} strokeWidth='2' />
					<circle cx='82' cy='30' r='3' fill={theme.connector} />
				</svg>
			</div>

			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}
