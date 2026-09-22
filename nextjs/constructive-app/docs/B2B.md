# B2B / Organizations — opt-in

This template ships as a **BASE tier** app: the `auth:hardened` module set only.
Out of the box it has authentication (sign in / up / out, password reset, email
verification), an account/profile surface, and a place to build your own app
data. It ships **no** organization, members, roles, or invite code — so a base
app builds clean with zero org imports.

Multi-tenant / team features (organizations, members, roles, org settings) are a
deliberate **opt-in**. You add them in two coordinated steps; you do **not**
hand-write the org UI — the registry org blocks already implement it.

## 1. Provision the org modules

The base default module set lives in `packages/provision/src/modules.ts`
(`AUTH_HARDENED_MODULES`). To go b2b, extend it with `ORG_MODULES` (also exported
from that file) when creating the database:

```ts
// packages/provision/src/create-db.ts
import { asModules, AUTH_HARDENED_MODULES, ORG_MODULES } from './modules.js';

const APP_MODULES = [...AUTH_HARDENED_MODULES, ...ORG_MODULES];
// ...
modules: asModules(APP_MODULES),
```

`ORG_MODULES` is the delta between the upstream `b2b:storage` and
`auth:hardened` presets (constructive-db
`packages/node-type-registry/src/module-presets/`): the org-scoped
`permissions`, `limits`, `levels`, `memberships`, `profiles`, `hierarchy`
modules plus app- and org-scoped `invites` and `storage_module`. All scoped
modules are tuple form (`['memberships_module', { scope: 'org' }]`) — the
colon-string form (`'memberships_module:org'`) is rejected by the provision
proc.

After provisioning, re-run codegen (`pnpm codegen`) so the generated admin SDK
(`@sdk/admin`) gains the org / members / invites query + mutation hooks that the
org blocks consume.

## 2. Add the registry org blocks

Install the organization feature pack from the Constructive blocks registry.
The feature pack is a provider-neutral component that receives data and actions
via props, so this template includes an adapter (`src/components/orgs/org-feature-pack-adapter.tsx`)
that bridges the recovered GraphQL hooks to the feature pack's contracts:

```bash
# Install the shared foundation + the organizations feature pack
pnpm dlx shadcn@4.13.1 add @constructive/pack-foundation @constructive/feature-pack-organizations
```

| Registry item                 | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `pack-foundation`             | Shared resource, action-policy, error, and UI contracts  |
| `feature-pack-organizations`  | Members, invitations, settings, hierarchy, API keys      |

The feature pack installs to `src/blocks/feature-packs/organizations/` with
`@constructive-io/ui/*` imports rewritten to `@/components/ui/*` by the registry
compiler, so all UI primitives resolve to local source.

### Adapter pattern

The feature pack is provider-neutral: it receives `OrganizationsFeatureData`,
`OrganizationsFeatureActions`, and a `FeatureActionPolicy` via props. The adapter
(`OrgFeaturePackAdapter`) in `src/components/orgs/` calls the existing
GraphQL hooks (`useOrgMembers`, `useOrgInvites`, etc.), transforms the results to
the feature pack's contract types, wraps mutations as feature pack actions, and
renders `<OrganizationsFeaturePack>` with the appropriate `section` prop.

The org pages mount the adapter:

- `/orgs/members?orgId=...` — `<OrgFeaturePackAdapter section="members" />`
- `/orgs/invites?orgId=...` — `<OrgFeaturePackAdapter section="invitations" />`
- `/orgs/settings?orgId=...` — `<OrgFeaturePackAdapter section="settings" />`

### Navigation

The org navigation seam is already wired in this template:

- `src/lib/navigation/sidebar-config.ts` — includes an `Organizations` nav entry
  and an org-level nav group (Members, Invites, Settings).
- `src/lib/navigation/use-entity-params.ts` — resolves the `orgId` search param and
  provides an org switcher so the `/orgs/*` routes resolve.
- `src/app-routes.ts` — declares the org-scoped routes with `access: 'protected'`.

## 3. Prerequisite: the org-create RLS permission bit

Creating an organization is a `createUser` with **`type = 2`** (an org is modelled
as an entity-typed user row). The `users` table is RLS-protected, and the INSERT
policy for entity-type rows requires the **acting** user to hold the
**`create_entity`** app permission. Without it the create fails with:

```
new row violates row-level security policy for table "users"
```

`create_entity` is the 5th app-permission bit defined by `initialize_permissions`
(app scope) — i.e. bit value `0x10000` (`1 << 16`) in the 64-bit app permission
mask. The actor must have it set on their **app membership** row before they call
the org-create mutation (the `org-create-card` block).

How this template grants it: `packages/provision/src/create-db.ts` already
elevates the bootstrap admin to full permissions right after provisioning — it
scans **this tenant's** `memberships_public` schemas (app and, when
provisioned, org) and runs:

```sql
UPDATE "<tenant>_memberships_public".app_memberships
   SET is_admin = true, is_owner = true,
       permissions = (64 one-bits)::bit(64)   -- includes the create_entity bit
 WHERE actor_id = $1;
```

So the admin user that `create-db` registers can create orgs out of the box. For
**non-admin** users who must create orgs, grant just the `create_entity` bit on
their app membership (set bit `0x10000`, or via the admin SDK
`appMembership.update`) — do not blanket-grant `is_admin`.

### Note: `@constructive-io/node` and `*.localhost` ("fetch failed")

`create-db.ts` registers the org/admin user against the per-tenant auth host
`auth-<sub>.localhost` using `@constructive-io/node`'s `auth.createClient`. The
convenience `{ endpoint }` form builds a `FetchAdapter` that calls
`globalThis.fetch` directly. On many Linux/CI hosts Node cannot resolve
`*.localhost` (ENOTFOUND → **"fetch failed"**), and undici also drops a manual
`Host` header, breaking subdomain routing. (macOS resolves `*.localhost` to
127.0.0.1, so it often "just works" locally — but CI will not.)

Workaround — pass a `NodeHttpAdapter` (exported by `@constructive-io/node`)
instead of `endpoint`; it rewrites the hostname to `localhost` and injects the
original host as the `Host` header:

```ts
import { auth, NodeHttpAdapter } from '@constructive-io/node';

const dbAuthClient = auth.createClient({
  adapter: new NodeHttpAdapter(`http://auth-${databaseName}.localhost:3000/graphql`),
});
```

The package's own raw-HTTP path (`helpers.rawExecute`) already routes through
`@constructive-io/fetch`'s `createFetch()`, which applies the same rewrite — so
prefer that (or `NodeHttpAdapter`) for any `*.localhost` call that errors with
"fetch failed" in CI.
