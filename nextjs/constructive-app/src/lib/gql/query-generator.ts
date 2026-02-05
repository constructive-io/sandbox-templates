/**
 * Unified query generator for dynamic GraphQL queries and mutations
 * Consolidates functionality from dynamic.ts and ast-adapter.ts
 * Uses AST-based approach for all query generation
 */
import * as t from 'gql-ast';
import { print } from 'graphql';
import type { ArgumentNode, FieldNode, VariableDefinitionNode } from 'graphql';
import * as inflection from 'inflection';

import { QueryBuilder } from '@/lib/query-builder';
import { getCustomAstForCleanField, requiresSubfieldSelection } from '@/lib/query-builder/custom-ast';
import type {
	IntrospectionSchema,
	MetaObject,
	MutationDefinition,
	QueryDefinition,
	SelectionOptions,
} from '@/lib/query-builder/types';
import { TypedDocumentString } from '@/graphql/typed-document';

import type { CleanTable, MutationOptions, QueryOptions } from './data.types';
import { convertToSelectionOptions as convertFieldSelection, type FieldSelection } from './field-selector';

/**
 * Convert PascalCase table name to camelCase plural for GraphQL queries
 * Uses the inflection library for proper pluralization
 * Example: "ActionGoal" -> "actionGoals", "User" -> "users", "Person" -> "people"
 */
export function toCamelCasePlural(tableName: string): string {
	// First convert to camelCase (lowercase first letter)
	const camelCase = inflection.camelize(tableName, true);
	// Then pluralize properly
	return inflection.pluralize(camelCase);
}

/**
 * Generate the PostGraphile OrderBy enum type name for a table
 * PostGraphile uses pluralized PascalCase: "Product" -> "ProductsOrderBy"
 * Example: "Product" -> "ProductsOrderBy", "Person" -> "PeopleOrderBy"
 */
export function toOrderByTypeName(tableName: string): string {
	const plural = toCamelCasePlural(tableName); // "products", "people"
	// Capitalize first letter for PascalCase
	return `${plural.charAt(0).toUpperCase() + plural.slice(1)}OrderBy`;
}

/**
 * Convert CleanTable to MetaObject format for QueryBuilder
 */
export function cleanTableToMetaObject(tables: CleanTable[]): MetaObject {
	return {
		tables: tables.map((table) => ({
			name: table.name,
			fields: table.fields.map((field) => ({
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
			primaryConstraints: [], // Would need to be derived from schema
			uniqueConstraints: [], // Would need to be derived from schema
			foreignConstraints: table.relations.belongsTo.map((rel) => ({
				refTable: rel.referencesTable,
				fromKey: {
					name: rel.fieldName || '',
					type: {
						gqlType: 'UUID', // Default, should be derived from actual field
						isArray: false,
						modifier: null,
						pgAlias: null,
						pgType: null,
						subtype: null,
						typmod: null,
					},
					alias: rel.fieldName || '',
				},
				toKey: {
					name: 'id',
					type: {
						gqlType: 'UUID',
						isArray: false,
						modifier: null,
						pgAlias: null,
						pgType: null,
						subtype: null,
						typmod: null,
					},
				},
			})),
		})),
	};
}

/**
 * Generate basic IntrospectionSchema from CleanTable array
 * This creates a minimal schema for AST generation
 */
export function generateIntrospectionSchema(tables: CleanTable[]): IntrospectionSchema {
	const schema: IntrospectionSchema = {};

	for (const table of tables) {
		const modelName = table.name;
		const pluralName = toCamelCasePlural(modelName);

		// Basic field selection for the model
		const selection = table.fields.map((field) => field.name);

		// Add getMany query
		schema[pluralName] = {
			qtype: 'getMany',
			model: modelName,
			selection,
			properties: convertFieldsToProperties(table.fields),
		} as QueryDefinition;

		// Add getOne query (by ID)
		const singularName = inflection.camelize(modelName, true);
		schema[singularName] = {
			qtype: 'getOne',
			model: modelName,
			selection,
			properties: convertFieldsToProperties(table.fields),
		} as QueryDefinition;

		// Add create mutation
		schema[`create${modelName}`] = {
			qtype: 'mutation',
			mutationType: 'create',
			model: modelName,
			selection,
			properties: {
				input: {
					name: 'input',
					type: `Create${modelName}Input`,
					isNotNull: true,
					isArray: false,
					isArrayNotNull: false,
					properties: {
						[inflection.camelize(modelName, true)]: {
							name: inflection.camelize(modelName, true),
							type: `${modelName}Input`,
							isNotNull: true,
							isArray: false,
							isArrayNotNull: false,
							properties: convertFieldsToNestedProperties(table.fields),
						},
					},
				},
			},
		} as MutationDefinition;

		// Add update mutation
		schema[`update${modelName}`] = {
			qtype: 'mutation',
			mutationType: 'patch',
			model: modelName,
			selection,
			properties: {
				input: {
					name: 'input',
					type: `Update${modelName}Input`,
					isNotNull: true,
					isArray: false,
					isArrayNotNull: false,
					properties: {
						patch: {
							name: 'patch',
							type: `${modelName}Patch`,
							isNotNull: true,
							isArray: false,
							isArrayNotNull: false,
							properties: convertFieldsToNestedProperties(table.fields),
						},
					},
				},
			},
		} as MutationDefinition;

		// Add delete mutation
		schema[`delete${modelName}`] = {
			qtype: 'mutation',
			mutationType: 'delete',
			model: modelName,
			selection,
			properties: {
				input: {
					name: 'input',
					type: `Delete${modelName}Input`,
					isNotNull: true,
					isArray: false,
					isArrayNotNull: false,
					properties: {
						id: {
							name: 'id',
							type: 'UUID',
							isNotNull: true,
							isArray: false,
							isArrayNotNull: false,
						},
					},
				},
			},
		} as MutationDefinition;
	}

	return schema;
}

/**
 * Convert CleanTable fields to QueryBuilder properties
 */
function convertFieldsToProperties(fields: CleanTable['fields']) {
	const properties: Record<string, unknown> = {};

	fields.forEach((field) => {
		properties[field.name] = {
			name: field.name,
			type: field.type.gqlType,
			isNotNull: !field.type.gqlType.endsWith('!'),
			isArray: field.type.isArray,
			isArrayNotNull: false,
		};
	});

	return properties;
}

/**
 * Convert fields to nested properties for mutations
 */
function convertFieldsToNestedProperties(fields: CleanTable['fields']) {
	const properties: Record<string, unknown> = {};

	fields.forEach((field) => {
		properties[field.name] = {
			name: field.name,
			type: field.type.gqlType,
			isNotNull: false, // Mutations typically allow optional fields
			isArray: field.type.isArray,
			isArrayNotNull: false,
		};
	});

	return properties;
}

/**
 * Generate field selections for PostGraphile mutations using custom AST logic
 * This handles both scalar fields and complex types that require subfield selections
 */
function generateFieldSelections(table: CleanTable): FieldNode[] {
	return table.fields
		.filter((field) => !isRelationalField(field.name, table)) // Exclude relational fields
		.map((field) => {
			if (requiresSubfieldSelection(field)) {
				// Use custom AST generation for complex types
				return getCustomAstForCleanField(field);
			} else {
				// Use simple field selection for scalar types
				return t.field({ name: field.name });
			}
		});
}

/**
 * Create AST-based query builder for a table
 */
export function createASTQueryBuilder(tables: CleanTable[]): QueryBuilder {
	const metaObject = cleanTableToMetaObject(tables);
	const introspectionSchema = generateIntrospectionSchema(tables);

	return new QueryBuilder({
		meta: metaObject,
		introspection: introspectionSchema,
	});
}

/**
 * Build a SELECT query for a table with optional filtering, sorting, and pagination
 * Uses direct AST generation without intermediate conversions
 */
export function buildSelect(
	table: CleanTable,
	allTables: readonly CleanTable[],
	options: QueryOptions = {},
): TypedDocumentString<Record<string, unknown>, QueryOptions> {
	const tableList = Array.from(allTables);
	const selection = convertFieldSelectionToSelectionOptions(table, tableList, options.fieldSelection);

	// Generate query directly using AST
	const queryString = generateSelectQueryAST(table, tableList, selection, options);

	return new TypedDocumentString(queryString, {}) as TypedDocumentString<Record<string, unknown>, QueryOptions>;
}

/**
 * Build a single row query by primary key or unique field
 */
export function buildFindOne(
	table: CleanTable,
	_pkField: string = 'id',
): TypedDocumentString<Record<string, unknown>, Record<string, unknown>> {
	const queryString = generateFindOneQueryAST(table);

	return new TypedDocumentString(queryString, {}) as TypedDocumentString<
		Record<string, unknown>,
		Record<string, unknown>
	>;
}

/**
 * Build a count query for a table
 */
export function buildCount(
	table: CleanTable,
): TypedDocumentString<
	{ [key: string]: { totalCount: number } },
	{ condition?: Record<string, unknown>; filter?: Record<string, unknown> }
> {
	const queryString = generateCountQueryAST(table);

	return new TypedDocumentString(queryString, {}) as TypedDocumentString<
		{ [key: string]: { totalCount: number } },
		{ condition?: Record<string, unknown>; filter?: Record<string, unknown> }
	>;
}

/**
 * Build PostGraphile-style CREATE mutation
 * PostGraphile expects: mutation { createTableName(input: { tableName: TableNameInput! }) { tableName { ... } } }
 */
export function buildPostGraphileCreate(
	table: CleanTable,
	_allTables: CleanTable[],
	_options: MutationOptions = {},
): TypedDocumentString<Record<string, unknown>, { input: { [key: string]: Record<string, unknown> } }> {
	const mutationName = `create${table.name}`;
	const singularName = inflection.camelize(table.name, true);

	// Create the variable definition for $input
	const variableDefinitions: VariableDefinitionNode[] = [
		t.variableDefinition({
			variable: t.variable({ name: 'input' }),
			type: t.nonNullType({
				type: t.namedType({ type: `Create${table.name}Input` }),
			}),
		}),
	];

	// Create the mutation arguments
	const mutationArgs: ArgumentNode[] = [
		t.argument({
			name: 'input',
			value: t.variable({ name: 'input' }),
		}),
	];

	// Get the field selections for the return value using custom AST logic
	const fieldSelections: FieldNode[] = generateFieldSelections(table);

	// Build the mutation AST
	const ast = t.document({
		definitions: [
			t.operationDefinition({
				operation: 'mutation',
				name: `${mutationName}Mutation`,
				variableDefinitions,
				selectionSet: t.selectionSet({
					selections: [
						t.field({
							name: mutationName,
							args: mutationArgs,
							selectionSet: t.selectionSet({
								selections: [
									t.field({
										name: singularName,
										selectionSet: t.selectionSet({
											selections: fieldSelections,
										}),
									}),
								],
							}),
						}),
					],
				}),
			}),
		],
	});

	// Print the AST to get the query string
	const queryString = print(ast);

	return new TypedDocumentString(queryString, { __ast: ast }) as TypedDocumentString<
		Record<string, unknown>,
		{ input: { [key: string]: Record<string, unknown> } }
	>;
}

/**
 * Build PostGraphile-style UPDATE mutation
 * PostGraphile expects: mutation { updateTableName(input: { id: UUID!, patch: TableNamePatch! }) { tableName { ... } } }
 */
export function buildPostGraphileUpdate(
	table: CleanTable,
	_allTables: CleanTable[],
	_options: MutationOptions = {},
): TypedDocumentString<Record<string, unknown>, { input: { id: string | number; patch: Record<string, unknown> } }> {
	const mutationName = `update${table.name}`;
	const singularName = inflection.camelize(table.name, true);

	// Create the variable definition for $input
	const variableDefinitions: VariableDefinitionNode[] = [
		t.variableDefinition({
			variable: t.variable({ name: 'input' }),
			type: t.nonNullType({
				type: t.namedType({ type: `Update${table.name}Input` }),
			}),
		}),
	];

	// Create the mutation arguments
	const mutationArgs: ArgumentNode[] = [
		t.argument({
			name: 'input',
			value: t.variable({ name: 'input' }),
		}),
	];

	// Get the field selections for the return value using custom AST logic
	const fieldSelections: FieldNode[] = generateFieldSelections(table);

	// Build the mutation AST
	const ast = t.document({
		definitions: [
			t.operationDefinition({
				operation: 'mutation',
				name: `${mutationName}Mutation`,
				variableDefinitions,
				selectionSet: t.selectionSet({
					selections: [
						t.field({
							name: mutationName,
							args: mutationArgs,
							selectionSet: t.selectionSet({
								selections: [
									t.field({
										name: singularName,
										selectionSet: t.selectionSet({
											selections: fieldSelections,
										}),
									}),
								],
							}),
						}),
					],
				}),
			}),
		],
	});

	// Print the AST to get the query string
	const queryString = print(ast);

	return new TypedDocumentString(queryString, { __ast: ast }) as TypedDocumentString<
		Record<string, unknown>,
		{ input: { id: string | number; patch: Record<string, unknown> } }
	>;
}

/**
 * Build PostGraphile-style DELETE mutation
 * PostGraphile expects: mutation { deleteTableName(input: { id: UUID! }) { clientMutationId } }
 */
export function buildPostGraphileDelete(
	table: CleanTable,
	_allTables: CleanTable[],
	_options: MutationOptions = {},
): TypedDocumentString<Record<string, unknown>, { input: { id: string | number } }> {
	const mutationName = `delete${table.name}`;

	// Create the variable definition for $input
	const variableDefinitions: VariableDefinitionNode[] = [
		t.variableDefinition({
			variable: t.variable({ name: 'input' }),
			type: t.nonNullType({
				type: t.namedType({ type: `Delete${table.name}Input` }),
			}),
		}),
	];

	// Create the mutation arguments
	const mutationArgs: ArgumentNode[] = [
		t.argument({
			name: 'input',
			value: t.variable({ name: 'input' }),
		}),
	];

	// PostGraphile delete mutations typically return clientMutationId
	const fieldSelections: FieldNode[] = [t.field({ name: 'clientMutationId' })];

	// Build the mutation AST
	const ast = t.document({
		definitions: [
			t.operationDefinition({
				operation: 'mutation',
				name: `${mutationName}Mutation`,
				variableDefinitions,
				selectionSet: t.selectionSet({
					selections: [
						t.field({
							name: mutationName,
							args: mutationArgs,
							selectionSet: t.selectionSet({
								selections: fieldSelections,
							}),
						}),
					],
				}),
			}),
		],
	});

	// Print the AST to get the query string
	const queryString = print(ast);

	return new TypedDocumentString(queryString, { __ast: ast }) as TypedDocumentString<
		Record<string, unknown>,
		{ input: { id: string | number } }
	>;
}

function convertFieldSelectionToSelectionOptions(
	table: CleanTable,
	allTables: CleanTable[],
	options?: FieldSelection,
): SelectionOptions | null {
	return convertFieldSelection(table, allTables, options);
}

/**
 * Generate SELECT query AST directly from CleanTable
 */
function generateSelectQueryAST(
	table: CleanTable,
	allTables: CleanTable[],
	selection: SelectionOptions | null,
	options: QueryOptions,
): string {
	const pluralName = toCamelCasePlural(table.name);

	// Generate field selections
	const fieldSelections = generateFieldSelectionsFromOptions(table, allTables, selection);

	// Build the query AST
	const variableDefinitions: VariableDefinitionNode[] = [];
	const queryArgs: ArgumentNode[] = [];

	// Add pagination variables if needed
	const limitValue = options.limit ?? options.first;
	if (limitValue !== undefined) {
		variableDefinitions.push(
			t.variableDefinition({
				variable: t.variable({ name: 'first' }),
				type: t.namedType({ type: 'Int' }),
			}),
		);
		queryArgs.push(
			t.argument({
				name: 'first',
				value: t.variable({ name: 'first' }),
			}),
		);
	}

	if (options.offset !== undefined) {
		variableDefinitions.push(
			t.variableDefinition({
				variable: t.variable({ name: 'offset' }),
				type: t.namedType({ type: 'Int' }),
			}),
		);
		queryArgs.push(
			t.argument({
				name: 'offset',
				value: t.variable({ name: 'offset' }),
			}),
		);
	}

	// Add cursor-based pagination variables if needed (for infinite scroll)
	if (options.after !== undefined) {
		variableDefinitions.push(
			t.variableDefinition({
				variable: t.variable({ name: 'after' }),
				type: t.namedType({ type: 'Cursor' }),
			}),
		);
		queryArgs.push(
			t.argument({
				name: 'after',
				value: t.variable({ name: 'after' }),
			}),
		);
	}

	if (options.before !== undefined) {
		variableDefinitions.push(
			t.variableDefinition({
				variable: t.variable({ name: 'before' }),
				type: t.namedType({ type: 'Cursor' }),
			}),
		);
		queryArgs.push(
			t.argument({
				name: 'before',
				value: t.variable({ name: 'before' }),
			}),
		);
	}

	// Add filter variables if needed
	if (options.where) {
		variableDefinitions.push(
			t.variableDefinition({
				variable: t.variable({ name: 'filter' }),
				type: t.namedType({ type: `${table.name}Filter` }),
			}),
		);
		queryArgs.push(
			t.argument({
				name: 'filter',
				value: t.variable({ name: 'filter' }),
			}),
		);
	}

	// Add orderBy variables if needed
	if (options.orderBy && options.orderBy.length > 0) {
		variableDefinitions.push(
			t.variableDefinition({
				variable: t.variable({ name: 'orderBy' }),
				// PostGraphile expects [ProductsOrderBy!] - list of non-null enum values
				type: t.listType({
					type: t.nonNullType({
						type: t.namedType({ type: toOrderByTypeName(table.name) }),
					}),
				}),
			}),
		);
		queryArgs.push(
			t.argument({
				name: 'orderBy',
				value: t.variable({ name: 'orderBy' }),
			}),
		);
	}

	// Build connection selections: totalCount, nodes, and optionally pageInfo
	const connectionSelections: FieldNode[] = [
		t.field({ name: 'totalCount' }),
		t.field({
			name: 'nodes',
			selectionSet: t.selectionSet({
				selections: fieldSelections,
			}),
		}),
	];

	// Add pageInfo if requested (for cursor-based pagination / infinite scroll)
	if (options.includePageInfo || options.after !== undefined || options.before !== undefined) {
		connectionSelections.push(
			t.field({
				name: 'pageInfo',
				selectionSet: t.selectionSet({
					selections: [
						t.field({ name: 'hasNextPage' }),
						t.field({ name: 'hasPreviousPage' }),
						t.field({ name: 'startCursor' }),
						t.field({ name: 'endCursor' }),
					],
				}),
			}),
		);
	}

	const ast = t.document({
		definitions: [
			t.operationDefinition({
				operation: 'query',
				name: `${pluralName}Query`,
				variableDefinitions,
				selectionSet: t.selectionSet({
					selections: [
						t.field({
							name: pluralName,
							args: queryArgs,
							selectionSet: t.selectionSet({
								selections: connectionSelections,
							}),
						}),
					],
				}),
			}),
		],
	});

	return print(ast);
}

/**
 * Generate field selections from SelectionOptions
 */
function generateFieldSelectionsFromOptions(
	table: CleanTable,
	allTables: CleanTable[],
	selection: SelectionOptions | null,
): FieldNode[] {
	const DEFAULT_NESTED_RELATION_FIRST = 20;

	if (!selection) {
		// Default to all non-relational fields (includes complex fields like JSON, geometry, etc.)
		return table.fields
			.filter((field) => !isRelationalField(field.name, table))
			.map((field) => {
				if (requiresSubfieldSelection(field)) {
					// For complex fields that require subfield selection, use custom AST generation
					return getCustomAstForCleanField(field);
				} else {
					// For simple fields, use basic field selection
					return t.field({ name: field.name });
				}
			});
	}

	const fieldSelections: FieldNode[] = [];

	Object.entries(selection).forEach(([fieldName, fieldOptions]) => {
		if (fieldOptions === true) {
			// Check if this field requires subfield selection
			const field = table.fields.find((f) => f.name === fieldName);
			if (field && requiresSubfieldSelection(field)) {
				// Use custom AST generation for complex fields
				fieldSelections.push(getCustomAstForCleanField(field));
			} else {
				// Simple field selection for scalar fields
				fieldSelections.push(t.field({ name: fieldName }));
			}
		} else if (typeof fieldOptions === 'object' && fieldOptions.select) {
			// Nested field selection (for relation fields)
			const nestedSelections: FieldNode[] = [];

			// Find the related table to check for complex fields
			const relatedTable = findRelatedTable(fieldName, table, allTables);

			Object.entries(fieldOptions.select).forEach(([nestedField, include]) => {
				if (include) {
					// Check if this nested field requires subfield selection
					const nestedFieldDef = relatedTable?.fields.find((f) => f.name === nestedField);
					if (nestedFieldDef && requiresSubfieldSelection(nestedFieldDef)) {
						// Use custom AST generation for complex nested fields
						nestedSelections.push(getCustomAstForCleanField(nestedFieldDef));
					} else {
						// Simple field selection for scalar nested fields
						nestedSelections.push(t.field({ name: nestedField }));
					}
				}
			});

			// Check if this is a hasMany relation that uses Connection pattern
			const relationInfo = getRelationInfo(fieldName, table);
			if (relationInfo && (relationInfo.type === 'hasMany' || relationInfo.type === 'manyToMany')) {
				// For hasMany/manyToMany relations, wrap selections in nodes { ... }
				fieldSelections.push(
					t.field({
						name: fieldName,
						args: [
							t.argument({
								name: 'first',
								value: t.intValue({ value: DEFAULT_NESTED_RELATION_FIRST.toString() }),
							}),
						],
						selectionSet: t.selectionSet({
							selections: [
								t.field({
									name: 'nodes',
									selectionSet: t.selectionSet({
										selections: nestedSelections,
									}),
								}),
							],
						}),
					}),
				);
			} else {
				// For belongsTo/hasOne relations, use direct selection
				fieldSelections.push(
					t.field({
						name: fieldName,
						selectionSet: t.selectionSet({
							selections: nestedSelections,
						}),
					}),
				);
			}
		}
	});

	return fieldSelections;
}

/**
 * Check if a field is relational (belongs to table relations)
 */
function isRelationalField(fieldName: string, table: CleanTable): boolean {
	const { belongsTo, hasOne, hasMany, manyToMany } = table.relations;

	return (
		belongsTo.some((rel) => rel.fieldName === fieldName) ||
		hasOne.some((rel) => rel.fieldName === fieldName) ||
		hasMany.some((rel) => rel.fieldName === fieldName) ||
		manyToMany.some((rel) => rel.fieldName === fieldName)
	);
}

/**
 * Get relation information for a field
 */
function getRelationInfo(fieldName: string, table: CleanTable): { type: string; relation: any } | null {
	const { belongsTo, hasOne, hasMany, manyToMany } = table.relations;

	// Check belongsTo relations
	const belongsToRel = belongsTo.find((rel) => rel.fieldName === fieldName);
	if (belongsToRel) {
		return { type: 'belongsTo', relation: belongsToRel };
	}

	// Check hasOne relations
	const hasOneRel = hasOne.find((rel) => rel.fieldName === fieldName);
	if (hasOneRel) {
		return { type: 'hasOne', relation: hasOneRel };
	}

	// Check hasMany relations
	const hasManyRel = hasMany.find((rel) => rel.fieldName === fieldName);
	if (hasManyRel) {
		return { type: 'hasMany', relation: hasManyRel };
	}

	// Check manyToMany relations
	const manyToManyRel = manyToMany.find((rel) => rel.fieldName === fieldName);
	if (manyToManyRel) {
		return { type: 'manyToMany', relation: manyToManyRel };
	}

	return null;
}

/**
 * Find the related table for a given relation field
 */
function findRelatedTable(relationField: string, table: CleanTable, allTables: CleanTable[]): CleanTable | null {
	// Find the related table name
	let referencedTableName: string | undefined;

	// Check belongsTo relations
	const belongsToRel = table.relations.belongsTo.find((rel) => rel.fieldName === relationField);
	if (belongsToRel) {
		referencedTableName = belongsToRel.referencesTable;
	}

	// Check hasOne relations
	if (!referencedTableName) {
		const hasOneRel = table.relations.hasOne.find((rel) => rel.fieldName === relationField);
		if (hasOneRel) {
			referencedTableName = hasOneRel.referencedByTable;
		}
	}

	// Check hasMany relations
	if (!referencedTableName) {
		const hasManyRel = table.relations.hasMany.find((rel) => rel.fieldName === relationField);
		if (hasManyRel) {
			referencedTableName = hasManyRel.referencedByTable;
		}
	}

	// Check manyToMany relations
	if (!referencedTableName) {
		const manyToManyRel = table.relations.manyToMany.find((rel) => rel.fieldName === relationField);
		if (manyToManyRel) {
			referencedTableName = manyToManyRel.rightTable;
		}
	}

	if (!referencedTableName) {
		return null;
	}

	// Find the related table in allTables
	return allTables.find((t) => t.name === referencedTableName) || null;
}

/**
 * Generate FindOne query AST directly from CleanTable
 */
function generateFindOneQueryAST(table: CleanTable): string {
	const singularName = inflection.camelize(table.name, true);

	// Generate field selections (include all non-relational fields, including complex types)
	const fieldSelections = table.fields
		.filter((field) => !isRelationalField(field.name, table))
		.map((field) => {
			if (requiresSubfieldSelection(field)) {
				// For complex fields that require subfield selection, use custom AST generation
				return getCustomAstForCleanField(field);
			} else {
				// For simple fields, use basic field selection
				return t.field({ name: field.name });
			}
		});

	const ast = t.document({
		definitions: [
			t.operationDefinition({
				operation: 'query',
				name: `${singularName}Query`,
				variableDefinitions: [
					t.variableDefinition({
						variable: t.variable({ name: 'id' }),
						type: t.nonNullType({
							type: t.namedType({ type: 'UUID' }),
						}),
					}),
				],
				selectionSet: t.selectionSet({
					selections: [
						t.field({
							name: singularName,
							args: [
								t.argument({
									name: 'id',
									value: t.variable({ name: 'id' }),
								}),
							],
							selectionSet: t.selectionSet({
								selections: fieldSelections,
							}),
						}),
					],
				}),
			}),
		],
	});

	return print(ast);
}

/**
 * Generate Count query AST directly from CleanTable
 */
function generateCountQueryAST(table: CleanTable): string {
	const pluralName = toCamelCasePlural(table.name);

	const ast = t.document({
		definitions: [
			t.operationDefinition({
				operation: 'query',
				name: `${pluralName}CountQuery`,
				variableDefinitions: [
					t.variableDefinition({
						variable: t.variable({ name: 'filter' }),
						type: t.namedType({ type: `${table.name}Filter` }),
					}),
				],
				selectionSet: t.selectionSet({
					selections: [
						t.field({
							name: pluralName,
							args: [
								t.argument({
									name: 'filter',
									value: t.variable({ name: 'filter' }),
								}),
							],
							selectionSet: t.selectionSet({
								selections: [t.field({ name: 'totalCount' })],
							}),
						}),
					],
				}),
			}),
		],
	});

	return print(ast);
}
