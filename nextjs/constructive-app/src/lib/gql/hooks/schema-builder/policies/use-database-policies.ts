/**
 * Hook for fetching database policies
 * Tier 4 wrapper: Uses SDK hooks + composition
 */
import { useQuery } from '@tanstack/react-query';

import {
	fetchFieldsQuery,
	fetchPoliciesQuery,
	fetchSchemasQuery,
	fetchTablesQuery,
} from '@sdk/app-public';

interface FieldNode {
	id: string;
	name: string;
	type: string;
	fieldOrder: number | null;
	isHidden: boolean | null;
	smartTags: unknown;
}

interface SchemaNode {
	id: string;
	schemaName: string;
}

interface PolicyNode {
	createdAt: string | null;
	data: unknown;
	disabled: boolean | null;
	id: string;
	name: string | null;
	permissive: boolean | null;
	privilege: string | null;
	roleName: string | null;
	policyType: string | null;
	updatedAt: string | null;
}

type TableCategory = string | null;

export type DatabasePolicy = PolicyNode;
export type TableField = FieldNode;

export type { TableCategory, SchemaNode };

export interface PolicyTableData {
	id: string;
	name: string;
	useRls: boolean;
	policies: DatabasePolicy[];
	fields: TableField[];
	schema: SchemaNode | null;
	category: TableCategory;
}

export const databasePoliciesQueryKeys = {
	all: ['database-policies'] as const,
	byDatabase: (databaseId: string) => ['database-policies', databaseId] as const,
};

export interface UseDatabasePoliciesOptions {
	enabled?: boolean;
}

export function useDatabasePolicies(databaseId: string, options: UseDatabasePoliciesOptions = {}) {
	const isEnabled = options.enabled !== false && Boolean(databaseId);

	return useQuery<PolicyTableData[]>({
		queryKey: databasePoliciesQueryKeys.byDatabase(databaseId),
		queryFn: async (): Promise<PolicyTableData[]> => {
			// Step 1: Fetch tables for this database
			const tablesResult = await fetchTablesQuery({
				filter: { databaseId: { equalTo: databaseId } },
				orderBy: ['NAME_ASC'],
			});

			const tables = tablesResult.tables?.nodes ?? [];
			if (tables.length === 0) {
				return [];
			}

			// Build table data map
			const tableIds = tables.map((t) => t.id).filter((id): id is string => !!id);
			const schemaIds = [...new Set(tables.map((t) => t.schemaId).filter((id): id is string => !!id))];

			// Step 2: Fetch schemas, fields, and policies in parallel
			const [schemasResult, fieldsResult, policiesResult] = await Promise.all([
				schemaIds.length > 0
					? fetchSchemasQuery({ filter: { id: { in: schemaIds } } })
					: Promise.resolve({ schemas: { nodes: [] } }),
				tableIds.length > 0
					? fetchFieldsQuery({ filter: { tableId: { in: tableIds } } })
					: Promise.resolve({ fields: { nodes: [] } }),
				tableIds.length > 0
					? fetchPoliciesQuery({
							filter: { tableId: { in: tableIds } },
							orderBy: ['CREATED_AT_DESC'],
						})
					: Promise.resolve({ policies: { nodes: [] } }),
			]);

			// Build lookup maps
			const schemaMap = new Map<string, SchemaNode>();
			for (const schema of schemasResult.schemas?.nodes ?? []) {
				if (schema.id) {
					schemaMap.set(schema.id, {
						id: schema.id,
						schemaName: schema.schemaName ?? '',
					});
				}
			}

			const fieldsByTable = new Map<string, FieldNode[]>();
			for (const field of fieldsResult.fields?.nodes ?? []) {
				if (field.tableId) {
					const existing = fieldsByTable.get(field.tableId) ?? [];
					existing.push({
						id: field.id ?? '',
						name: field.name ?? '',
						type: field.type ?? '',
						fieldOrder: field.fieldOrder ?? null,
						isHidden: field.isHidden ?? null,
						smartTags: field.smartTags ?? null,
					});
					fieldsByTable.set(field.tableId, existing);
				}
			}

			const policiesByTable = new Map<string, PolicyNode[]>();
			for (const policy of policiesResult.policies?.nodes ?? []) {
				if (policy.tableId) {
					const existing = policiesByTable.get(policy.tableId) ?? [];
					existing.push({
						id: policy.id ?? '',
						name: policy.name ?? null,
						roleName: policy.roleName ?? null,
						privilege: policy.privilege ?? null,
						permissive: policy.permissive ?? null,
						disabled: policy.disabled ?? null,
						policyType: policy.policyType ?? null,
						data: policy.data ?? null,
						createdAt: policy.createdAt ?? null,
						updatedAt: policy.updatedAt ?? null,
					});
					policiesByTable.set(policy.tableId, existing);
				}
			}

			// Step 3: Build result
			return tables.map((table): PolicyTableData => ({
				id: table.id ?? '',
				name: table.name ?? '',
				useRls: table.useRls ?? false,
				policies: policiesByTable.get(table.id ?? '') ?? [],
				fields: fieldsByTable.get(table.id ?? '') ?? [],
				schema: table.schemaId ? schemaMap.get(table.schemaId) ?? null : null,
				category: (table.category as TableCategory) ?? null,
			}));
		},
		enabled: isEnabled,
		staleTime: 5 * 60 * 1000,
		refetchOnMount: isEnabled ? 'always' : false,
		refetchOnWindowFocus: 'always',
		refetchOnReconnect: 'always',
	});
}
