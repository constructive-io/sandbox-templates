/**
 * modules.ts — Provision module presets for the constructive-app.
 *
 * Source of truth: references/flows.json (the agentic-flow flow catalog).
 * The tuples below mirror `email-password.backend.modules` / `profile.backend.modules`
 * exactly — those entries are already provisioning-ready.
 *
 * IMPORTANT — module shape:
 *   - Unscoped modules are plain strings:        'users_module'
 *   - Scoped modules MUST use tuple form:        ['permissions_module', { scope: 'app' }]
 *
 *   The live `databaseProvisionModule` proc REJECTS the legacy colon-string form
 *   ('permissions_module:app') with a PROVISION-001 hard-fail. The generated SDK
 *   types `modules` as `string[]` because the underlying column is JSONB; pass
 *   `asModules(...)` at the call site to satisfy the SDK boundary.
 */

export type ModuleScope = { scope: 'app' | 'org' };
export type ProvisionModule = string | [string, ModuleScope];

/**
 * BASE tier — the `auth:email` preset.
 *
 * The ~13-module single-user auth surface backing the email-password / profile
 * flows. NO org / memberships{org} / hierarchy / invites modules — a base
 * scaffold ships no org/b2b code, so it does not provision those modules.
 *
 * Mirrors references/flows.json → email-password.backend.modules verbatim.
 */
export const AUTH_EMAIL_MODULES: ProvisionModule[] = [
  'users_module',
  'membership_types_module',
  ['permissions_module', { scope: 'app' }],
  ['limits_module', { scope: 'app' }],
  ['levels_module', { scope: 'app' }],
  ['memberships_module', { scope: 'app' }],
  'sessions_module',
  'user_state_module',
  'user_credentials_module',
  'config_secrets_module',
  'emails_module',
  'rls_module',
  'user_auth_module'
];

/**
 * B2B OPT-IN — the org modules layered on top of {@link AUTH_EMAIL_MODULES}.
 *
 * An app that adopts the registry org blocks (org-create-card,
 * org-members-list, org-roles-editor, org-settings-form) provisions these in
 * addition to the base set. Mirrors references/flows.json →
 * organization.backend.modules (the org-scoped half). See docs/B2B.md.
 */
export const ORG_MODULES: ProvisionModule[] = [
  ['permissions_module', { scope: 'org' }],
  ['limits_module', { scope: 'org' }],
  ['levels_module', { scope: 'org' }],
  ['memberships_module', { scope: 'org' }],
  ['profiles_module', { scope: 'org' }],
  ['hierarchy_module', { scope: 'org' }],
  ['invites_module', { scope: 'app' }],
  ['invites_module', { scope: 'org' }]
];

/**
 * Cast a typed module preset to the `string[]` shape the generated SDK expects.
 * The server accepts the JSONB tuple form at runtime; this only bridges the
 * narrow generated TypeScript signature.
 */
export function asModules(modules: ProvisionModule[]): string[] {
  return modules as unknown as string[];
}
