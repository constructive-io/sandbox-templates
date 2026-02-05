/**
 * Color themes for policy diagrams
 */
export interface ColorTheme {
	primary: string;
	light: string;
	border: string;
	text: string;
	bg: string;
	connector: string;
	connectorLight: string;
}

/**
 * Theme colors for each policy type
 */
export const DIAGRAM_THEMES: Record<string, ColorTheme> = {
	DirectOwner: {
		primary: '#22C55E',
		light: '#DCFCE7',
		border: '#86EFAC',
		text: 'text-green-600',
		bg: 'bg-green-100',
		connector: '#22C55E',
		connectorLight: '#BBF7D0',
	},
	DirectOwnerAny: {
		primary: '#F97316',
		light: '#FFEDD5',
		border: '#FDBA74',
		text: 'text-orange-600',
		bg: 'bg-orange-100',
		connector: '#F97316',
		connectorLight: '#FED7AA',
	},
	MembershipByField: {
		primary: '#6366F1',
		light: '#E0E7FF',
		border: '#A5B4FC',
		text: 'text-indigo-600',
		bg: 'bg-indigo-100',
		connector: '#6366F1',
		connectorLight: '#C7D2FE',
	},
	Membership: {
		primary: '#14B8A6',
		light: '#CCFBF1',
		border: '#5EEAD4',
		text: 'text-teal-600',
		bg: 'bg-teal-100',
		connector: '#14B8A6',
		connectorLight: '#99F6E4',
	},
	ArrayContainsActorByJoin: {
		primary: '#3B82F6',
		light: '#DBEAFE',
		border: '#93C5FD',
		text: 'text-blue-600',
		bg: 'bg-blue-100',
		connector: '#3B82F6',
		connectorLight: '#BFDBFE',
	},
	MembershipByJoin: {
		primary: '#8B5CF6',
		light: '#EDE9FE',
		border: '#C4B5FD',
		text: 'text-violet-600',
		bg: 'bg-violet-100',
		connector: '#8B5CF6',
		connectorLight: '#DDD6FE',
	},
	AllowAll: {
		primary: '#10B981',
		light: '#D1FAE5',
		border: '#6EE7B7',
		text: 'text-emerald-600',
		bg: 'bg-emerald-100',
		connector: '#10B981',
		connectorLight: '#A7F3D0',
	},
	DenyAll: {
		primary: '#EF4444',
		light: '#FEE2E2',
		border: '#FCA5A5',
		text: 'text-red-600',
		bg: 'bg-red-100',
		connector: '#EF4444',
		connectorLight: '#FECACA',
	},
	Publishable: {
		primary: '#8B5CF6',
		light: '#EDE9FE',
		border: '#C4B5FD',
		text: 'text-violet-600',
		bg: 'bg-violet-100',
		connector: '#8B5CF6',
		connectorLight: '#DDD6FE',
	},
	ArrayContainsActor: {
		primary: '#0EA5E9',
		light: '#E0F2FE',
		border: '#7DD3FC',
		text: 'text-sky-600',
		bg: 'bg-sky-100',
		connector: '#0EA5E9',
		connectorLight: '#BAE6FD',
	},
	OrgHierarchy: {
		primary: '#F59E0B',
		light: '#FEF3C7',
		border: '#FCD34D',
		text: 'text-amber-600',
		bg: 'bg-amber-100',
		connector: '#F59E0B',
		connectorLight: '#FDE68A',
	},
	Temporal: {
		primary: '#EC4899',
		light: '#FCE7F3',
		border: '#F9A8D4',
		text: 'text-pink-600',
		bg: 'bg-pink-100',
		connector: '#EC4899',
		connectorLight: '#FBCFE8',
	},
};

/**
 * Get theme for a diagram key, with fallback
 */
export function getDiagramTheme(diagramKey: string): ColorTheme {
	return DIAGRAM_THEMES[diagramKey] ?? DIAGRAM_THEMES.AllowAll;
}
