// src/queries/useMeta.ts
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { executeCrmInScope } from '@/graphql/execute';
import { TypedDocumentString } from '@/graphql/typed-document';
import type { MetaQuery } from '@/lib/gql/meta-query.types';

import { type DashboardCacheScopeKey, useDashboardCacheScopeKey } from './use-dashboard-cache-scope';
import { dashboardQueryKeys } from './dashboard-query-keys';

export const metaKey = (scope: DashboardCacheScopeKey) => dashboardQueryKeys.meta(scope);

const MetaDoc = new TypedDocumentString<MetaQuery, Record<string, never>>(`
	query Meta {
		_meta {
			tables {
				name
				query {
					all
					create
					delete
					one
					update
				}
				fields {
					name
					type {
						gqlType
						isArray
						modifier
						pgAlias
						pgType
						subtype
						typmod
					}
				}
				inflection {
					allRows
					allRowsSimple
					conditionType
					connection
					createField
					createInputType
					createPayloadType
					deleteByPrimaryKey
					deletePayloadType
					edge
					edgeField
					enumType
					filterType
					inputType
					orderByType
					patchField
					patchType
					tableFieldName
					tableType
					typeName
					updateByPrimaryKey
					updatePayloadType
				}
				checkConstraints {
					name
					fields {
						name
						type {
							gqlType
							isArray
							modifier
							pgAlias
							pgType
							subtype
							typmod
						}
					}
				}
				constraints {
					... on MetaschemaCheckConstraint {
						name
						fields {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
					}
					... on MetaschemaExclusionConstraint {
						name
						fields {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
					}
					... on MetaschemaForeignKeyConstraint {
						name
						fields {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
						refFields {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
						refTable {
							name
						}
					}
					... on MetaschemaPrimaryKeyConstraint {
						name
						fields {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
					}
					... on MetaschemaUniqueConstraint {
						name
						fields {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
					}
				}
				exclusionConstraints {
					name
					fields {
						name
						type {
							gqlType
							isArray
							modifier
							pgAlias
							pgType
							subtype
							typmod
						}
					}
				}
				foreignKeyConstraints {
					name
					fields {
						name
						type {
							gqlType
							isArray
							modifier
							pgAlias
							pgType
							subtype
							typmod
						}
					}
					refFields {
						name
						type {
							gqlType
							isArray
							modifier
							pgAlias
							pgType
							subtype
							typmod
						}
					}
					refTable {
						name
					}
				}
				primaryKeyConstraints {
					name
					fields {
						name
						type {
							gqlType
							isArray
							modifier
							pgAlias
							pgType
							subtype
							typmod
						}
					}
				}
				uniqueConstraints {
					name
					fields {
						name
						type {
							gqlType
							isArray
							modifier
							pgAlias
							pgType
							subtype
							typmod
						}
					}
				}
				relations {
					belongsTo {
						fieldName
						isUnique
						keys {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
						references {
							name
						}
						type
					}
					has {
						fieldName
						isUnique
						keys {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
						referencedBy {
							name
						}
						type
					}
					hasOne {
						fieldName
						isUnique
						keys {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
						referencedBy {
							name
						}
						type
					}
					hasMany {
						fieldName
						isUnique
						keys {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
						referencedBy {
							name
						}
						type
					}
					manyToMany {
						fieldName
						junctionLeftConstraint {
							name
							fields {
								name
								type {
									gqlType
									isArray
									modifier
									pgAlias
									pgType
									subtype
									typmod
								}
							}
							refFields {
								name
								type {
									gqlType
									isArray
									modifier
									pgAlias
									pgType
									subtype
									typmod
								}
							}
							refTable {
								name
							}
						}
						junctionLeftKeyAttributes {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
						junctionRightConstraint {
							name
							fields {
								name
								type {
									gqlType
									isArray
									modifier
									pgAlias
									pgType
									subtype
									typmod
								}
							}
							refFields {
								name
								type {
									gqlType
									isArray
									modifier
									pgAlias
									pgType
									subtype
									typmod
								}
							}
							refTable {
								name
							}
						}
						junctionRightKeyAttributes {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
						junctionTable {
							name
						}
						leftKeyAttributes {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
						rightKeyAttributes {
							name
							type {
								gqlType
								isArray
								modifier
								pgAlias
								pgType
								subtype
								typmod
							}
						}
						rightTable {
							name
						}
						type
					}
				}
			}
		}
	}
`);

export interface UseMetaOptions {
	enabled?: boolean;
}

export function useMeta(options: UseMetaOptions = {}): UseQueryResult<MetaQuery, Error> {
	const { enabled = true } = options;
	const scopeKey = useDashboardCacheScopeKey();
	return useQuery<MetaQuery, Error>({
		queryKey: metaKey(scopeKey),
		queryFn: () =>
			executeCrmInScope(
				{ endpoint: scopeKey.endpoint, authScope: scopeKey.databaseId ?? undefined },
				MetaDoc,
			),
		staleTime: 5 * 60 * 1000, // 5 min - finite so invalidation + remount triggers refetch
		gcTime: 30 * 60 * 1000, // 30 min - survive long schema-editing sessions
		refetchOnMount: 'always', // Always refetch on mount (stale-while-revalidate)
		enabled,
	});
}
