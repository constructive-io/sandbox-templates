/**
 * Provision configuration for a Constructive app.
 *
 * Agents fill this in from the app brief (build/app-brief.yaml).
 * The provision.ts script reads this config and executes all SDK calls.
 */

export interface ProvisionTable {
  name: string;
  nodeType: string;
  policyType: string;
  grantRoles: string[];
  grantPrivileges: [string, string][];
  compose?: { nodeType: string; nodeData?: Record<string, unknown> }[];
}

export interface ProvisionRelation {
  source: string;
  target: string;
  type: string;
  deleteAction?: string;
  junctionSecurity?: {
    policyType: string;
    grantRoles: string[];
    grantPrivileges: [string, string][];
  };
}

export interface ProvisionConfig {
  platformAuth: string;
  platformApi: string;
  database: {
    name: string;
    modules: string[];
    bootstrapUser: boolean;
  };
  auth: {
    email: string;
    password: string;
  };
  tables: ProvisionTable[];
  relations: ProvisionRelation[];
}

export function defineProvisionConfig(config: ProvisionConfig): ProvisionConfig {
  return config;
}

/**
 * ──────────────────────────────────────────────────────────────────────
 * REFERENCE: Valid values for provision config fields.
 * ──────────────────────────────────────────────────────────────────────
 *
 * nodeType — each creates specific columns automatically:
 *   'DataId'                 — id
 *   'DataDirectOwner'        — id, owner_id
 *   'DataEntityMembership'   — id, entity_id
 *   'DataOwnershipInEntity'  — id, owner_id, entity_id
 *   'DataTimestamps'         — id, created_at, updated_at
 *   'DataPeoplestamps'       — id, created_by, updated_by
 *   'DataPublishable'        — id, is_published, published_at
 *   'DataSoftDelete'         — id, deleted_at, is_deleted
 *
 * policyType — RLS policy applied to the table:
 *   'AuthzDirectOwner'          — personal resources (owner can CRUD own rows)
 *   'AuthzEntityMembership'     — org-scoped (entity members can access)
 *   'AuthzOwnershipInEntity'    — owner + entity scope combined
 *   'AuthzPublishable'          — public content with owner override
 *   'AuthzAllowAll'             — truly public data
 *   'AuthzDenyAll'              — locked-down system data
 *   Prefer AuthzEntityMembership over AuthzMembership for entity-scoped tables.
 *
 * grantRoles: typically ['authenticated']
 * grantPrivileges: array of [privilege, columns] tuples, e.g.:
 *   [['select', '*'], ['insert', '*'], ['update', '*'], ['delete', '*']]
 *
 * compose: additional Data modules applied to the same table.
 *   Always use { nodeData: { include_id: false } } on second and later modules.
 *
 * Relation types:
 *   'RelationBelongsTo'   — FK from source to target
 *   'RelationHasMany'     — reverse of BelongsTo
 *   'RelationManyToMany'  — junction table (provide junctionSecurity)
 *
 * deleteAction: 'c' = cascade, 'r' = restrict, 'n' = set null
 *
 * ──────────────────────────────────────────────────────────────────────
 * EXAMPLE: A filled-in config for a "Task Manager" app.
 * Copy this pattern and adjust names/types to match your app brief.
 * ──────────────────────────────────────────────────────────────────────
 *
 * export default defineProvisionConfig({
 *   platformAuth: 'http://auth.localhost:3000/graphql',
 *   platformApi: 'http://api.localhost:3000/graphql',
 *   database: {
 *     name: 'taskmanager',
 *     modules: ['all'],
 *     bootstrapUser: true,
 *   },
 *   auth: {
 *     email: 'admin@example.com',
 *     password: 'my-secure-password',
 *   },
 *   tables: [
 *     {
 *       name: 'projects',
 *       nodeType: 'DataEntityMembership',
 *       policyType: 'AuthzEntityMembership',
 *       grantRoles: ['authenticated'],
 *       grantPrivileges: [
 *         ['select', '*'],
 *         ['insert', '*'],
 *         ['update', '*'],
 *         ['delete', '*'],
 *       ],
 *       compose: [
 *         { nodeType: 'DataTimestamps', nodeData: { include_id: false } },
 *       ],
 *     },
 *     {
 *       name: 'tasks',
 *       nodeType: 'DataOwnershipInEntity',
 *       policyType: 'AuthzOwnershipInEntity',
 *       grantRoles: ['authenticated'],
 *       grantPrivileges: [
 *         ['select', '*'],
 *         ['insert', '*'],
 *         ['update', '*'],
 *         ['delete', '*'],
 *       ],
 *       compose: [
 *         { nodeType: 'DataTimestamps', nodeData: { include_id: false } },
 *       ],
 *     },
 *   ],
 *   relations: [
 *     {
 *       source: 'tasks',
 *       target: 'projects',
 *       type: 'RelationBelongsTo',
 *       deleteAction: 'c',
 *     },
 *   ],
 * });
 *
 * ──────────────────────────────────────────────────────────────────────
 */

/**
 * Placeholder default export.
 * Agents replace this with a filled-in config from build/app-brief.yaml.
 * provision.ts imports this as the default export — removing it causes a runtime error.
 */
export default defineProvisionConfig({
  platformAuth: 'http://auth.localhost:3000/graphql',
  platformApi: 'http://api.localhost:3000/graphql',
  database: {
    name: 'REPLACE_ME',
    modules: ['all'],
    bootstrapUser: true,
  },
  auth: {
    email: 'admin@example.com',
    password: 'REPLACE_ME',
  },
  tables: [],
  relations: [],
});
