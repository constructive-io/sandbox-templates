/**
 * Manually defined types for PostGraphile's _meta introspection response.
 *
 * These types match the structure returned by the Meta query in use-dashboard-meta-query.ts.
 * Since the dashboard schema is dynamic (changes per application database), we don't use
 * codegen for it. However, the _meta introspection query has a fixed structure from PostGraphile.
 */

// ============================================================================
// Root Query Type
// ============================================================================

export interface MetaQuery {
	__typename?: 'Query';
	_meta?: Metaschema | null;
}

export interface Metaschema {
	__typename?: 'Metaschema';
	tables?: Array<MetaschemaTable | null> | null;
}

// ============================================================================
// Table Types
// ============================================================================

export interface MetaschemaTable {
	__typename?: 'MetaschemaTable';
	name: string;
	query: MetaschemaTableQuery;
	fields?: Array<MetaschemaField | null> | null;
	inflection: MetaschemaTableInflection;
	checkConstraints?: Array<MetaschemaCheckConstraint | null> | null;
	constraints?: Array<MetaschemaConstraint | null> | null;
	exclusionConstraints?: Array<MetaschemaExclusionConstraint | null> | null;
	foreignKeyConstraints?: Array<MetaschemaForeignKeyConstraint | null> | null;
	primaryKeyConstraints?: Array<MetaschemaPrimaryKeyConstraint | null> | null;
	uniqueConstraints?: Array<MetaschemaUniqueConstraint | null> | null;
	relations?: MetaschemaTableRelation | null;
}

export interface MetaschemaTableQuery {
	__typename?: 'MetaschemaTableQuery';
	all: string;
	create: string;
	delete?: string | null;
	one: string;
	update?: string | null;
}

// ============================================================================
// Field Types
// ============================================================================

export interface MetaschemaField {
	__typename?: 'MetaschemaField';
	name: string;
	type: MetaschemaType;
}

export interface MetaschemaType {
	__typename?: 'MetaschemaType';
	gqlType: string;
	isArray: boolean;
	modifier?: number | null;
	pgAlias: string;
	pgType: string;
	subtype?: string | null;
	/** PostgreSQL type modifier (e.g., precision/scale for numeric types) */
	typmod?: number | null;
}

// ============================================================================
// Inflection Types
// ============================================================================

export interface MetaschemaTableInflection {
	__typename?: 'MetaschemaTableInflection';
	allRows: string;
	allRowsSimple: string;
	conditionType: string;
	connection: string;
	createField: string;
	createInputType: string;
	createPayloadType: string;
	deleteByPrimaryKey?: string | null;
	deletePayloadType: string;
	edge: string;
	edgeField: string;
	enumType: string;
	filterType?: string | null;
	inputType: string;
	orderByType: string;
	patchField: string;
	patchType?: string | null;
	tableFieldName: string;
	tableType: string;
	typeName: string;
	updateByPrimaryKey?: string | null;
	updatePayloadType?: string | null;
}

// ============================================================================
// Constraint Types
// ============================================================================

export type MetaschemaConstraint =
	| MetaschemaCheckConstraint
	| MetaschemaExclusionConstraint
	| MetaschemaForeignKeyConstraint
	| MetaschemaPrimaryKeyConstraint
	| MetaschemaUniqueConstraint;

export interface MetaschemaCheckConstraint {
	__typename?: 'MetaschemaCheckConstraint';
	name: string;
	fields?: Array<MetaschemaField | null> | null;
}

export interface MetaschemaExclusionConstraint {
	__typename?: 'MetaschemaExclusionConstraint';
	name: string;
	fields?: Array<MetaschemaField | null> | null;
}

export interface MetaschemaForeignKeyConstraint {
	__typename?: 'MetaschemaForeignKeyConstraint';
	name: string;
	fields?: Array<MetaschemaField | null> | null;
	refFields?: Array<MetaschemaField | null> | null;
	refTable?: { __typename?: 'MetaschemaTable'; name: string } | null;
}

export interface MetaschemaPrimaryKeyConstraint {
	__typename?: 'MetaschemaPrimaryKeyConstraint';
	name: string;
	fields?: Array<MetaschemaField | null> | null;
}

export interface MetaschemaUniqueConstraint {
	__typename?: 'MetaschemaUniqueConstraint';
	name: string;
	fields?: Array<MetaschemaField | null> | null;
}

// ============================================================================
// Relation Types
// ============================================================================

export interface MetaschemaTableRelation {
	__typename?: 'MetaschemaTableRelation';
	belongsTo?: Array<MetaschemaTableBelongsToRelation | null> | null;
	has?: Array<MetaschemaTableHasRelation | null> | null;
	hasOne?: Array<MetaschemaTableHasRelation | null> | null;
	hasMany?: Array<MetaschemaTableHasRelation | null> | null;
	manyToMany?: Array<MetaschemaTableManyToManyRelation | null> | null;
}

export interface MetaschemaTableBelongsToRelation {
	__typename?: 'MetaschemaTableBelongsToRelation';
	fieldName?: string | null;
	isUnique: boolean;
	type?: string | null;
	keys?: Array<MetaschemaField | null> | null;
	references: { __typename?: 'MetaschemaTable'; name: string };
}

export interface MetaschemaTableHasRelation {
	__typename?: 'MetaschemaTableHasRelation';
	fieldName?: string | null;
	isUnique: boolean;
	type?: string | null;
	keys?: Array<MetaschemaField | null> | null;
	referencedBy: { __typename?: 'MetaschemaTable'; name: string };
}

export interface MetaschemaTableManyToManyRelation {
	__typename?: 'MetaschemaTableManyToManyRelation';
	fieldName?: string | null;
	type?: string | null;
	junctionLeftConstraint: MetaschemaForeignKeyConstraint;
	junctionLeftKeyAttributes: Array<MetaschemaField | null>;
	junctionRightConstraint: MetaschemaForeignKeyConstraint;
	junctionRightKeyAttributes: Array<MetaschemaField | null>;
	junctionTable: { __typename?: 'MetaschemaTable'; name: string };
	leftKeyAttributes: Array<MetaschemaField | null>;
	rightKeyAttributes: Array<MetaschemaField | null>;
	rightTable: { __typename?: 'MetaschemaTable'; name: string };
}
