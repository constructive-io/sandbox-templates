export type PermissionType = 'app' | 'membership';

export interface PermissionItem {
	id: string;
	name: string;
	description?: string | null;
}
