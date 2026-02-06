'use client';

import type { MergedPolicyType } from '../policy-types';
import {
	AllowAllDiagram,
	ArrayContainsActorByJoinDiagram,
	ArrayContainsActorDiagram,
	CompositeDiagram,
	DenyAllDiagram,
	DirectOwnerAnyDiagram,
	DirectOwnerDiagram,
	MembershipByFieldDiagram,
	MembershipByJoinDiagram,
	MembershipDiagram,
	OrgHierarchyDiagram,
	PublishableDiagram,
	TemporalDiagram,
} from './diagrams';

/**
 * Simple wrappers for diagrams that don't need config
 */
function AllowAllWrapper({ tableName }: { tableName: string; config: Record<string, unknown> }) {
	return <AllowAllDiagram tableName={tableName} />;
}

function DenyAllWrapper({ tableName }: { tableName: string; config: Record<string, unknown> }) {
	return <DenyAllDiagram tableName={tableName} />;
}

/**
 * Registry of diagram components by diagramKey (kebab-case keys)
 */
const DIAGRAM_COMPONENTS: Record<
	string,
	React.ComponentType<{ tableName: string; config: Record<string, unknown> }>
> = {
	// Ownership patterns
	'direct-owner': DirectOwnerDiagram,
	'direct-owner-any': DirectOwnerAnyDiagram,
	'array-contains-actor': ArrayContainsActorDiagram,
	'array-contains-actor-by-join': ArrayContainsActorByJoinDiagram,

	// Membership patterns
	membership: MembershipDiagram,
	'membership-by-field': MembershipByFieldDiagram,
	'membership-by-join': MembershipByJoinDiagram,
	'org-hierarchy': OrgHierarchyDiagram,

	// Temporal/Publishing
	publishable: PublishableDiagram,
	temporal: TemporalDiagram,

	// Simple
	'allow-all': AllowAllWrapper,
	'deny-all': DenyAllWrapper,

	// Composite
	composite: CompositeDiagram,

	// Legacy PascalCase keys for backwards compatibility
	DirectOwner: DirectOwnerDiagram,
	DirectOwnerAny: DirectOwnerAnyDiagram,
	MembershipByField: MembershipByFieldDiagram,
	Membership: MembershipDiagram,
	MembershipByJoin: MembershipByJoinDiagram,
	ArrayContainsActorByJoin: ArrayContainsActorByJoinDiagram,
	ArrayContainsActor: ArrayContainsActorDiagram,
	OrgHierarchy: OrgHierarchyDiagram,
	Publishable: PublishableDiagram,
	Temporal: TemporalDiagram,
	AllowAll: AllowAllWrapper,
	DenyAll: DenyAllWrapper,
};

interface PolicyDiagramProps {
	policyType: MergedPolicyType | null;
	tableName: string;
	config: Record<string, unknown>;
}

/**
 * Main diagram container - selects the appropriate diagram based on policy type
 */
export function PolicyDiagram({ policyType, tableName, config }: PolicyDiagramProps) {
	if (!policyType?.diagramKey) {
		return null;
	}

	const DiagramComponent = DIAGRAM_COMPONENTS[policyType.diagramKey];
	if (!DiagramComponent) {
		return null;
	}

	return (
		<div className='policy-diagram flex items-center justify-center py-4'>
			<DiagramComponent tableName={tableName || 'table'} config={config} />
		</div>
	);
}

/**
 * Render a diagram by diagramKey directly (without needing full policyType)
 */
export function PolicyDiagramByKey({
	diagramKey,
	tableName,
	config = {},
}: {
	diagramKey: string;
	tableName: string;
	config?: Record<string, unknown>;
}) {
	const DiagramComponent = DIAGRAM_COMPONENTS[diagramKey];
	if (!DiagramComponent) {
		return null;
	}

	return (
		<div className='policy-diagram flex items-center justify-center py-4'>
			<DiagramComponent tableName={tableName || 'table'} config={config} />
		</div>
	);
}
