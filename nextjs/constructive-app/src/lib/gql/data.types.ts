import type { MetaQuery } from './meta-query.types';

import type { FieldSelection } from './field-selector';

// Extract the clean table type from the GraphQL response
export type MetaTable = NonNullable<NonNullable<NonNullable<MetaQuery['_meta']>['tables']>[number]>;

export type MetaField = NonNullable<NonNullable<MetaTable['fields']>[number]>;

export type MetaFieldType = NonNullable<MetaField['type']>;

export type MetaRelations = NonNullable<MetaTable['relations']>;

export type MetaBelongsToRelation = NonNullable<NonNullable<MetaRelations['belongsTo']>[number]>;

export type MetaHasOneRelation = NonNullable<NonNullable<MetaRelations['hasOne']>[number]>;

export type MetaHasManyRelation = NonNullable<NonNullable<MetaRelations['hasMany']>[number]>;

export type MetaManyToManyRelation = NonNullable<NonNullable<MetaRelations['manyToMany']>[number]>;

// Clean, non-nullable versions for easier usage
export interface CleanTable {
	name: string;
	fields: CleanField[];
	relations: CleanRelations;
}

export interface CleanField {
	name: string;
	type: {
		gqlType: string;
		isArray: boolean;
		modifier?: string | number | null;
		pgAlias?: string | null;
		pgType?: string | null;
		subtype?: string | null;
		typmod?: number | null;
	};
}

export interface CleanRelations {
	belongsTo: CleanBelongsToRelation[];
	hasOne: CleanHasOneRelation[];
	hasMany: CleanHasManyRelation[];
	manyToMany: CleanManyToManyRelation[];
}

export interface CleanBelongsToRelation {
	fieldName: string | null;
	isUnique: boolean;
	referencesTable: string;
	type: string | null;
	keys: CleanField[];
}

export interface CleanHasOneRelation {
	fieldName: string | null;
	isUnique: boolean;
	referencedByTable: string;
	type: string | null;
	keys: CleanField[];
}

export interface CleanHasManyRelation {
	fieldName: string | null;
	isUnique: boolean;
	referencedByTable: string;
	type: string | null;
	keys: CleanField[];
}

export interface CleanManyToManyRelation {
	fieldName: string | null;
	rightTable: string;
	junctionTable: string;
	type: string | null;
}

// Convert Meta table to clean table
export function cleanTable(metaTable: MetaTable): CleanTable {
	const relations = metaTable.relations;

	return {
		name: metaTable.name,
		fields: (metaTable.fields || [])
			.filter((f): f is NonNullable<typeof f> => f != null)
			.map((field) => ({
				name: field.name,
				type: {
					gqlType: field.type.gqlType,
					isArray: field.type.isArray,
					modifier: field.type.modifier,
					pgAlias: field.type.pgAlias,
					pgType: field.type.pgType,
					subtype: field.type.subtype,
					typmod: field.type.typmod,
				},
			})),
		relations: {
			belongsTo: (relations?.belongsTo || [])
				.filter((r): r is NonNullable<typeof r> => r != null)
				.map((relation) => ({
					fieldName: relation.fieldName ?? null,
					isUnique: relation.isUnique,
					referencesTable: relation.references?.name || '',
					type: relation.type ?? null,
					keys: (relation.keys || [])
						.filter((k): k is NonNullable<typeof k> => k != null)
						.map((key) => ({
							name: key.name,
							type: {
								gqlType: key.type?.gqlType || '',
								isArray: key.type?.isArray || false,
								modifier: key.type?.modifier,
								pgAlias: key.type?.pgAlias,
								pgType: key.type?.pgType,
								subtype: key.type?.subtype,
								typmod: key.type?.typmod,
							},
						})),
				})),
			hasOne: (relations?.hasOne || [])
				.filter((r): r is NonNullable<typeof r> => r != null)
				.map((relation) => ({
					fieldName: relation.fieldName ?? null,
					isUnique: relation.isUnique,
					referencedByTable: relation.referencedBy?.name || '',
					type: relation.type ?? null,
					keys: (relation.keys || [])
						.filter((k): k is NonNullable<typeof k> => k != null)
						.map((key) => ({
							name: key.name,
							type: {
								gqlType: key.type?.gqlType || '',
								isArray: key.type?.isArray || false,
								modifier: key.type?.modifier,
								pgAlias: key.type?.pgAlias,
								pgType: key.type?.pgType,
								subtype: key.type?.subtype,
								typmod: key.type?.typmod,
							},
						})),
				})),
			hasMany: (relations?.hasMany || [])
				.filter((r): r is NonNullable<typeof r> => r != null)
				.map((relation) => ({
					fieldName: relation.fieldName ?? null,
					isUnique: relation.isUnique,
					referencedByTable: relation.referencedBy?.name || '',
					type: relation.type ?? null,
					keys: (relation.keys || [])
						.filter((k): k is NonNullable<typeof k> => k != null)
						.map((key) => ({
							name: key.name,
							type: {
								gqlType: key.type?.gqlType || '',
								isArray: key.type?.isArray || false,
								modifier: key.type?.modifier,
								pgAlias: key.type?.pgAlias,
								pgType: key.type?.pgType,
								subtype: key.type?.subtype,
								typmod: key.type?.typmod,
							},
						})),
				})),
			manyToMany: (relations?.manyToMany || [])
				.filter((r): r is NonNullable<typeof r> => r != null)
				.map((relation) => ({
					fieldName: relation.fieldName ?? null,
					rightTable: relation.rightTable?.name || '',
					junctionTable: relation.junctionTable?.name || '',
					type: relation.type ?? null,
				})),
		},
	};
}

// Relay Connection pagination types
export interface PageInfo {
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	startCursor?: string | null;
	endCursor?: string | null;
}

export interface ConnectionResult<T = unknown> {
	nodes: T[];
	totalCount: number;
	pageInfo: PageInfo;
}

// Query operation types
export interface QueryOptions {
	first?: number;
	limit?: number;
	offset?: number;
	/** Cursor for forward pagination (used with first) */
	after?: string;
	/** Cursor for backward pagination (used with last) */
	before?: string;
	where?: Filter;
	orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
	fieldSelection?: FieldSelection;
	/** Whether to include pageInfo in the response */
	includePageInfo?: boolean;
}

export interface MutationOptions {
	returning?: string[];
	fieldSelection?: FieldSelection;
}

// Advanced filter types for PostGraphile connection filters

// Base type for all filter operators
export type FilterOperator =
	| 'isNull'
	| 'equalTo'
	| 'notEqualTo'
	| 'distinctFrom'
	| 'notDistinctFrom'
	| 'in'
	| 'notIn'
	| 'lessThan'
	| 'lessThanOrEqualTo'
	| 'greaterThan'
	| 'greaterThanOrEqualTo'
	// String operators
	| 'includes'
	| 'notIncludes'
	| 'includesInsensitive'
	| 'notIncludesInsensitive'
	| 'startsWith'
	| 'notStartsWith'
	| 'startsWithInsensitive'
	| 'notStartsWithInsensitive'
	| 'endsWith'
	| 'notEndsWith'
	| 'endsWithInsensitive'
	| 'notEndsWithInsensitive'
	| 'like'
	| 'notLike'
	| 'likeInsensitive'
	| 'notLikeInsensitive'
	| 'equalToInsensitive'
	| 'notEqualToInsensitive'
	| 'distinctFromInsensitive'
	| 'notDistinctFromInsensitive'
	| 'inInsensitive'
	| 'notInInsensitive'
	// Array operators
	| 'contains'
	| 'containedBy'
	| 'overlaps'
	// PostGIS operators
	| 'intersects'
	| 'intersects3D'
	| 'containsProperly'
	| 'coveredBy'
	| 'covers'
	| 'crosses'
	| 'disjoint'
	| 'orderingEquals'
	| 'overlaps'
	| 'touches'
	| 'within'
	| 'bboxIntersects2D'
	| 'bboxIntersects3D'
	| 'bboxOverlapsOrLeftOf'
	| 'bboxOverlapsOrRightOf'
	| 'bboxOverlapsOrBelow'
	| 'bboxOverlapsOrAbove'
	| 'bboxLeftOf'
	| 'bboxRightOf'
	| 'bboxBelow'
	| 'bboxAbove'
	| 'bboxContains'
	| 'bboxEquals';

// Represents a filter on a single field
export type FieldFilter = {
	[key in FilterOperator]?: any;
};

// Represents a filter on a related table (to-one or to-many)
export interface RelationalFilter {
	// `every` requires all related records to match, `some` requires at least one,
	// `none` requires no records to match. `some` is the default.
	every?: Filter;
	some?: Filter;
	none?: Filter;
}

// The main filter type, which can be nested
export type Filter = {
	[field: string]: FieldFilter | RelationalFilter | Filter;
} & {
	and?: Filter[];
	or?: Filter[];
	not?: Filter;
};
