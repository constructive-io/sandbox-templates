import { Building2, Database, Key, Lock, Shield, Table2, Unlock, User, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { PolicyTypeKey } from './policies.types';

interface PolicyDiagramProps {
	policyType: PolicyTypeKey;
	tableName: string;
	data?: Record<string, unknown>;
}

type ColorTheme = {
	primary: string;
	light: string;
	border: string;
	text: string;
	bg: string;
	connector: string;
	connectorLight: string;
};

const THEME_COLORS: Record<PolicyTypeKey, ColorTheme> = {
	AuthzAllowAll: {
		primary: '#10B981',
		light: '#D1FAE5',
		border: '#6EE7B7',
		text: 'text-emerald-600',
		bg: 'bg-emerald-100',
		connector: '#10B981',
		connectorLight: '#A7F3D0',
	},
	AuthzDenyAll: {
		primary: '#EF4444',
		light: '#FEE2E2',
		border: '#FCA5A5',
		text: 'text-red-600',
		bg: 'bg-red-100',
		connector: '#EF4444',
		connectorLight: '#FECACA',
	},
	AuthzDirectOwner: {
		primary: '#22C55E',
		light: '#DCFCE7',
		border: '#86EFAC',
		text: 'text-green-600',
		bg: 'bg-green-100',
		connector: '#22C55E',
		connectorLight: '#BBF7D0',
	},
	OwnedRecords: {
		primary: '#A855F7',
		light: '#F3E8FF',
		border: '#D8B4FE',
		text: 'text-purple-600',
		bg: 'bg-purple-100',
		connector: '#A855F7',
		connectorLight: '#E9D5FF',
	},
	AuthzDirectOwnerAny: {
		primary: '#F97316',
		light: '#FFEDD5',
		border: '#FDBA74',
		text: 'text-orange-600',
		bg: 'bg-orange-100',
		connector: '#F97316',
		connectorLight: '#FED7AA',
	},
	AuthzArrayContainsActorByJoin: {
		primary: '#3B82F6',
		light: '#DBEAFE',
		border: '#93C5FD',
		text: 'text-blue-600',
		bg: 'bg-blue-100',
		connector: '#3B82F6',
		connectorLight: '#BFDBFE',
	},
	AuthzMembershipByField: {
		primary: '#6366F1',
		light: '#E0E7FF',
		border: '#A5B4FC',
		text: 'text-indigo-600',
		bg: 'bg-indigo-100',
		connector: '#6366F1',
		connectorLight: '#C7D2FE',
	},
	AuthzMembershipByJoin: {
		primary: '#8B5CF6',
		light: '#EDE9FE',
		border: '#C4B5FD',
		text: 'text-violet-600',
		bg: 'bg-violet-100',
		connector: '#8B5CF6',
		connectorLight: '#DDD6FE',
	},
	AuthzMembership: {
		primary: '#14B8A6',
		light: '#CCFBF1',
		border: '#5EEAD4',
		text: 'text-teal-600',
		bg: 'bg-teal-100',
		connector: '#14B8A6',
		connectorLight: '#99F6E4',
	},
};

interface DiagramNodeProps {
	icon: React.ElementType;
	label: string;
	theme: ColorTheme;
	size?: 'sm' | 'md';
	stacked?: boolean;
	badge?: React.ReactNode;
}

function DiagramNode({ icon: Icon, label, theme, size = 'md', stacked, badge }: DiagramNodeProps) {
	const sizeClasses = size === 'sm' ? 'h-12 w-12' : 'h-14 w-14';
	const iconSize = size === 'sm' ? 20 : 24;

	return (
		<div className='flex flex-col items-center gap-2'>
			<div className='relative'>
				{stacked && (
					<>
						<div
							className={cn('absolute -top-1.5 -left-2 rounded-full border-2 bg-white', sizeClasses)}
							style={{ borderColor: theme.border }}
						/>
						<div
							className={cn('absolute -top-0.5 -left-1 rounded-full border-2 bg-white', sizeClasses)}
							style={{ borderColor: theme.border }}
						/>
					</>
				)}
				<div
					className={cn('relative flex items-center justify-center rounded-full border-2 shadow-sm', sizeClasses)}
					style={{ borderColor: theme.border, backgroundColor: theme.light }}
				>
					<Icon size={iconSize} style={{ color: theme.primary }} />
				</div>
				{badge}
			</div>
			<span className='text-center text-xs text-gray-600 dark:text-gray-300'>{label}</span>
		</div>
	);
}

interface ConnectorProps {
	theme: ColorTheme;
	width?: number;
	label?: string;
	topLabel?: string;
	topLabelFilled?: boolean;
	showPermission?: boolean;
	permissionLabel?: string;
}

function Connector({
	theme,
	width = 50,
	label,
	topLabel,
	topLabelFilled,
	showPermission,
	permissionLabel,
}: ConnectorProps) {
	return (
		<div className='relative flex flex-col items-center justify-center'>
			{topLabel && (
				<div
					className={cn(
						`absolute -top-5 left-1/2 -translate-x-1/2 rounded border px-1.5 py-px text-[10px] leading-tight font-medium
						whitespace-nowrap`,
						topLabelFilled ? '' : 'border-dashed',
					)}
					style={{
						borderColor: topLabelFilled ? theme.primary : theme.border,
						backgroundColor: topLabelFilled ? theme.light : 'white',
						color: theme.primary,
					}}
				>
					{topLabel}
				</div>
			)}
			{showPermission && (
				<div
					className='absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded border
						border-amber-300/60 bg-amber-50 px-1.5 py-px'
				>
					<Key className='text-amber-600' size={10} />
					{permissionLabel && <span className='text-[10px] leading-tight text-amber-700'>{permissionLabel}</span>}
				</div>
			)}
			<svg width={width} height='40' viewBox={`0 0 ${width} 40`} fill='none'>
				<circle cx='6' cy='20' r='4' fill={theme.connector} />
				<line
					x1='10'
					y1='20'
					x2={width - 10}
					y2='20'
					stroke={theme.connectorLight}
					strokeWidth='2.5'
					strokeLinecap='round'
				/>
				<circle cx={width - 6} cy='20' r='4' fill={theme.connector} />
			</svg>
			{label && <span className='text-[10px] text-gray-500 dark:text-gray-400'>{label}</span>}
		</div>
	);
}

interface FanConnectorProps {
	theme: ColorTheme;
	topLabel?: string;
	topLabelFilled?: boolean;
}

function FanConnector({ theme, topLabel, topLabelFilled }: FanConnectorProps) {
	const labelLength = topLabel?.length || 0;
	const flatWidth = Math.max(40, labelLength * 6 + 16);
	const totalWidth = flatWidth + 40;
	const fanStartX = flatWidth + 4;
	const fanMidX = fanStartX + 3;
	const fanEndX = totalWidth - 12;
	const fanTipX = totalWidth - 6;

	return (
		<div className='relative mr-1 flex flex-col items-center justify-center'>
			{topLabel && (
				<div
					className={cn(
						'absolute -top-1.5 rounded border px-1.5 py-px text-[10px] leading-tight font-medium whitespace-nowrap',
						topLabelFilled ? '' : 'border-dashed',
					)}
					style={{
						borderColor: topLabelFilled ? theme.primary : theme.border,
						backgroundColor: topLabelFilled ? theme.light : 'white',
						color: theme.primary,
						left: (flatWidth + 6) / 2,
						transform: 'translateX(-50%)',
					}}
				>
					{topLabel}
				</div>
			)}
			<svg width={totalWidth} height='40' viewBox={`0 0 ${totalWidth} 40`} fill='none'>
				<circle cx='6' cy='20' r='4' fill={theme.connector} />
				<line
					x1='10'
					y1='20'
					x2={fanStartX}
					y2='20'
					stroke={theme.connectorLight}
					strokeWidth='2.5'
					strokeLinecap='round'
				/>
				<circle cx={fanMidX} cy='20' r='3' fill={theme.connector} />
				<line
					x1={fanMidX + 3}
					y1='20'
					x2={fanEndX}
					y2='8'
					stroke={theme.connector}
					strokeWidth='2'
					strokeLinecap='round'
				/>
				<line
					x1={fanMidX + 3}
					y1='20'
					x2={fanEndX}
					y2='20'
					stroke={theme.connector}
					strokeWidth='2'
					strokeLinecap='round'
				/>
				<line
					x1={fanMidX + 3}
					y1='20'
					x2={fanEndX}
					y2='32'
					stroke={theme.connector}
					strokeWidth='2'
					strokeLinecap='round'
				/>
				<circle cx={fanTipX} cy='8' r='3' fill={theme.connector} />
				<circle cx={fanTipX} cy='20' r='3' fill={theme.connector} />
				<circle cx={fanTipX} cy='32' r='3' fill={theme.connector} />
			</svg>
		</div>
	);
}

interface MembershipBadgeProps {
	theme: ColorTheme;
}

function MembershipBadge({ theme }: MembershipBadgeProps) {
	return (
		<div
			className='absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white
				shadow-sm'
			style={{ backgroundColor: theme.primary }}
		>
			<Shield className='text-white' size={12} />
		</div>
	);
}

interface ScopeContainerProps {
	theme: ColorTheme;
	label: string;
	children: React.ReactNode;
	permission?: string;
}

function ScopeContainer({ theme, label, children, permission }: ScopeContainerProps) {
	return (
		<div className='relative flex flex-col items-center'>
			<div
				className='relative rounded-xl border-2 px-4 py-3'
				style={{ backgroundColor: theme.light, borderColor: theme.border }}
			>
				<div
					className='absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full border-2
						border-white shadow-sm'
					style={{ backgroundColor: theme.primary }}
				>
					<Shield className='text-white' size={14} />
				</div>
				{permission && (
					<div
						className='absolute top-6 -right-2 flex items-center gap-0.5 rounded border border-amber-300/60 bg-amber-50
							px-1 py-px'
					>
						<Key className='text-amber-600' size={10} />
						<span className='text-[9px] text-amber-700'>{permission}</span>
					</div>
				)}
				<div className='flex items-center gap-3'>{children}</div>
			</div>
			<span className='mt-1.5 text-xs font-medium' style={{ color: theme.primary }}>
				{label}
			</span>
		</div>
	);
}

function ScopeIcon({ theme, size = 16 }: { theme: ColorTheme; size?: number }) {
	return (
		<div
			className='flex items-center justify-center rounded-full'
			style={{ backgroundColor: theme.light, width: size * 2.5, height: size * 2.5 }}
		>
			<Building2 size={size} style={{ color: theme.primary }} />
		</div>
	);
}

interface DirectOwnerDiagramProps {
	tableName: string;
	entityField?: string;
}

function DirectOwnerDiagram({ tableName, entityField }: DirectOwnerDiagramProps) {
	const theme = THEME_COLORS.AuthzDirectOwner;
	const fieldLabel = entityField || 'field';

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='User' theme={theme} />
			<FanConnector theme={theme} topLabel={fieldLabel} topLabelFilled={!!entityField} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

interface OwnedRecordsDiagramProps {
	tableName: string;
	entityField?: string;
	permission?: string;
}

function OwnedRecordsDiagram({ tableName, entityField, permission }: OwnedRecordsDiagramProps) {
	const theme = THEME_COLORS.OwnedRecords;
	const fieldLabel = entityField || 'field';

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='User' theme={theme} badge={<MembershipBadge theme={theme} />} />
			<Connector theme={theme} width={50} showPermission={!!permission} permissionLabel={permission} />
			<DiagramNode icon={Building2} label='Entity' theme={theme} />
			<FanConnector theme={theme} topLabel={fieldLabel} topLabelFilled={!!entityField} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

interface DirectOwnerAnyDiagramProps {
	tableName: string;
	entityFields?: string[];
}

function DirectOwnerAnyDiagram({ tableName, entityFields }: DirectOwnerAnyDiagramProps) {
	const theme = THEME_COLORS.AuthzDirectOwnerAny;
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

interface GroupMemberDiagramProps {
	tableName: string;
	ownedTable?: string;
	ownedTableKey?: string;
	thisObjectKey?: string;
}

function GroupMemberDiagram({ tableName, ownedTable, ownedTableKey, thisObjectKey }: GroupMemberDiagramProps) {
	const theme = THEME_COLORS.AuthzArrayContainsActorByJoin;
	const tableLabel = ownedTable || 'table';
	const arrayLabel = ownedTableKey || 'members[]';
	const fkLabel = thisObjectKey || 'field';

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='User' theme={theme} />
			<Connector theme={theme} width={50} topLabel={arrayLabel} topLabelFilled={!!ownedTableKey} />
			<DiagramNode icon={Table2} label={tableLabel} theme={theme} />
			<FanConnector theme={theme} topLabel={fkLabel} topLabelFilled={!!thisObjectKey} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

interface AclFieldDiagramProps {
	tableName: string;
	entityField?: string;
	membershipType?: string;
	permission?: string;
}

function AclFieldDiagram({ tableName, entityField, membershipType, permission }: AclFieldDiagramProps) {
	const theme = THEME_COLORS.AuthzMembershipByField;
	const fieldLabel = entityField || 'field';
	const scopeLabel = membershipType || 'scope';

	return (
		<div className='flex items-center justify-center gap-3'>
			<ScopeContainer theme={theme} label={scopeLabel} permission={permission}>
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
			</ScopeContainer>
			<FanConnector theme={theme} topLabel={fieldLabel} topLabelFilled={!!entityField} />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

interface MembershipByJoinDiagramProps {
	tableName: string;
	entityField?: string;
	objTable?: string;
	objField?: string;
	membershipType?: string;
}

function MembershipByJoinDiagram({
	tableName,
	entityField,
	objTable,
	objField,
	membershipType,
}: MembershipByJoinDiagramProps) {
	const theme = THEME_COLORS.AuthzMembershipByJoin;
	const fkLabel = entityField || 'field';
	const tableLabel = objTable || 'table';
	const ownerLabel = objField || 'owner';
	const scopeLabel = membershipType || 'scope';

	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={User} label='User' theme={theme} size='sm' badge={<MembershipBadge theme={theme} />} />
			<Connector theme={theme} width={40} />
			<DiagramNode icon={Users} label={scopeLabel} theme={theme} size='sm' />
			<Connector theme={theme} width={40} topLabel={ownerLabel} topLabelFilled={!!objField} />
			<DiagramNode icon={Table2} label={tableLabel} theme={theme} size='sm' />
			<FanConnector theme={theme} topLabel={fkLabel} topLabelFilled={!!entityField} />
			<DiagramNode icon={Database} label={tableName} theme={theme} size='sm' stacked />
		</div>
	);
}

interface MembershipDiagramProps {
	tableName: string;
	membershipType?: string;
	isAdmin?: boolean;
	permission?: string;
}

function MembershipDiagram({ tableName, membershipType, isAdmin, permission }: MembershipDiagramProps) {
	const theme = THEME_COLORS.AuthzMembership;
	const scopeLabel = membershipType || 'scope';
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

function OpenDiagram({ tableName }: { tableName: string }) {
	const theme = THEME_COLORS.AuthzAllowAll;
	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={Unlock} label='Allow all' theme={theme} />
			<Connector theme={theme} width={60} label='TRUE' />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

function ClosedDiagram({ tableName }: { tableName: string }) {
	const theme = THEME_COLORS.AuthzDenyAll;
	return (
		<div className='flex items-center justify-center gap-2'>
			<DiagramNode icon={Lock} label='Block all' theme={theme} />
			<Connector theme={theme} width={60} label='FALSE' />
			<DiagramNode icon={Database} label={tableName} theme={theme} stacked />
		</div>
	);
}

export function PolicyDiagram({ policyType, tableName, data = {} }: PolicyDiagramProps) {
	const getMembershipLabel = (value: unknown) => {
		if (value === 1) return 'Group';
		if (value === 2) return 'Org';
		if (value === 3) return 'Global';
		return '';
	};

	if (policyType === 'AuthzAllowAll') {
		return <OpenDiagram tableName={tableName} />;
	}

	if (policyType === 'AuthzDenyAll') {
		return <ClosedDiagram tableName={tableName} />;
	}

	if (policyType === 'AuthzDirectOwner') {
		return <DirectOwnerDiagram tableName={tableName} entityField={data.entity_field as string} />;
	}

	if (policyType === 'OwnedRecords') {
		return (
			<OwnedRecordsDiagram
				tableName={tableName}
				entityField={data.entity_field as string}
				permission={data.permission as string}
			/>
		);
	}

	if (policyType === 'AuthzDirectOwnerAny') {
		return <DirectOwnerAnyDiagram tableName={tableName} entityFields={data.entity_fields as string[]} />;
	}

	if (policyType === 'AuthzArrayContainsActorByJoin') {
		return (
			<GroupMemberDiagram
				tableName={tableName}
				ownedTable={data.owned_table as string}
				ownedTableKey={data.owned_table_key as string}
				thisObjectKey={data.this_object_key as string}
			/>
		);
	}

	if (policyType === 'AuthzMembershipByField') {
		return (
			<AclFieldDiagram
				tableName={tableName}
				entityField={data.entity_field as string}
				membershipType={getMembershipLabel(data.membership_type)}
				permission={data.permission as string}
			/>
		);
	}

	if (policyType === 'AuthzMembershipByJoin') {
		return (
			<MembershipByJoinDiagram
				tableName={tableName}
				entityField={data.entity_field as string}
				objTable={data.obj_table as string}
				objField={data.obj_field as string}
				membershipType={getMembershipLabel(data.membership_type)}
			/>
		);
	}

	if (policyType === 'AuthzMembership') {
		return (
			<MembershipDiagram
				tableName={tableName}
				membershipType={getMembershipLabel(data.membership_type)}
				isAdmin={data.is_admin as boolean}
				permission={data.permission as string}
			/>
		);
	}

	return null;
}
