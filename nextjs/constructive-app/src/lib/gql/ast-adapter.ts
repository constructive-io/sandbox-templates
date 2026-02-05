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
import { convertToSelectionOptions, type FieldSelection } from './field-selector';
import { toCamelCasePlural } from './query-generator';

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
 * Convert field selection options to QueryBuilder SelectionOptions
 * Now uses the unified field selection system
 */
export function convertFieldSelectionToSelectionOptions(
	table: CleanTable,
	allTables: CleanTable[],
	options?: FieldSelection,
): SelectionOptions | null {
	return convertToSelectionOptions(table, allTables, options);
}

// Legacy helper functions removed - now using unified field selection system

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
	return table.fields.map((field) => {
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
 * Build AST-based SELECT query
 */
export function buildASTSelect(
	table: CleanTable,
	allTables: CleanTable[],
	options: QueryOptions = {},
): TypedDocumentString<Record<string, unknown>, QueryOptions> {
	const builder = createASTQueryBuilder(allTables);
	const selection = convertFieldSelectionToSelectionOptions(table, allTables, options.fieldSelection);

	const result = builder
		.query(table.name)
		.getMany({ select: selection || undefined })
		.print();

	return new TypedDocumentString(result._hash, {}) as TypedDocumentString<Record<string, unknown>, QueryOptions>;
}

/**
 * Build AST-based INSERT mutation
 */
export function buildASTInsert(
	table: CleanTable,
	allTables: CleanTable[],
	options: MutationOptions = {},
): TypedDocumentString<Record<string, unknown>, { objects: Record<string, unknown>[] } & MutationOptions> {
	const builder = createASTQueryBuilder(allTables);
	const selection = convertFieldSelectionToSelectionOptions(table, allTables, options.fieldSelection);

	const result = builder
		.query(table.name)
		.create({ select: selection || undefined })
		.print();

	return new TypedDocumentString(result._hash, {}) as TypedDocumentString<
		Record<string, unknown>,
		{ objects: Record<string, unknown>[] } & MutationOptions
	>;
}

/**
 * Build AST-based UPDATE mutation
 */
export function buildASTUpdate(
	table: CleanTable,
	allTables: CleanTable[],
	options: MutationOptions = {},
): TypedDocumentString<
	Record<string, unknown>,
	{ where: Record<string, unknown>; set: Record<string, unknown> } & MutationOptions
> {
	const builder = createASTQueryBuilder(allTables);
	const selection = convertFieldSelectionToSelectionOptions(table, allTables, options.fieldSelection);

	const result = builder
		.query(table.name)
		.update({ select: selection || undefined })
		.print();

	return new TypedDocumentString(result._hash, {}) as TypedDocumentString<
		Record<string, unknown>,
		{ where: Record<string, unknown>; set: Record<string, unknown> } & MutationOptions
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

/**
 * Build AST-based DELETE mutation
 */
export function buildASTDelete(
	table: CleanTable,
	allTables: CleanTable[],
	_options: MutationOptions = {},
): TypedDocumentString<Record<string, unknown>, { where: Record<string, unknown> } & MutationOptions> {
	const builder = createASTQueryBuilder(allTables);

	const result = builder.query(table.name).delete().print();

	return new TypedDocumentString(result._hash, {}) as TypedDocumentString<
		Record<string, unknown>,
		{ where: Record<string, unknown> } & MutationOptions
	>;
}

/**
 * Build AST-based COUNT query
 */
export function buildASTCount(
	table: CleanTable,
	allTables: CleanTable[],
): TypedDocumentString<
	{ [key: string]: { totalCount: number } },
	{ condition?: Record<string, unknown>; filter?: Record<string, unknown> }
> {
	const builder = createASTQueryBuilder(allTables);

	const result = builder.query(table.name).count().print();

	return new TypedDocumentString(result._hash, {}) as TypedDocumentString<
		{ [key: string]: { totalCount: number } },
		{ condition?: Record<string, unknown>; filter?: Record<string, unknown> }
	>;
}

/**
 * Build AST-based single row query
 */
export function buildASTFindOne(
	table: CleanTable,
	allTables: CleanTable[],
	_pkField: string = 'id',
): TypedDocumentString<Record<string, unknown>, Record<string, unknown>> {
	const builder = createASTQueryBuilder(allTables);

	const result = builder.query(table.name).getOne().print();

	return new TypedDocumentString(result._hash, {}) as TypedDocumentString<
		Record<string, unknown>,
		Record<string, unknown>
	>;
}
