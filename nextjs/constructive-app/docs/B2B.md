# B2B / Organizations — opt-in

This template ships as a **BASE tier** app: the `auth:email` module set only.
Out of the box it has authentication (sign in / up / out, password reset, email
verification), an account/profile surface, and a place to build your own app
data. It ships **no** organization, members, roles, or invite code — so a base
app builds clean with zero org imports.

Multi-tenant / team features (organizations, members, roles, org settings) are a
deliberate **opt-in**. You add them in two coordinated steps; you do **not**
hand-write the org UI — the registry org blocks already implement it.

## 1. Provision the org modules

The base default module set lives in `packages/provision/src/modules.ts`
(`AUTH_EMAIL_MODULES`). To go b2b, extend it with `ORG_MODULES` (also exported
from that file) when creating the database:

```ts
// packages/provision/src/create-db.ts
import { asModules, AUTH_EMAIL_MODULES, ORG_MODULES } from './modules.js';

const APP_MODULES = [...AUTH_EMAIL_MODULES, ...ORG_MODULES];
// ...
modules: asModules(APP_MODULES),
```

`ORG_MODULES` mirrors the `organization` flow's backend module set from the
flow catalog (`references/flows.json`): the org-scoped `permissions`, `limits`,
`levels`, `memberships`, `profiles`, `hierarchy` modules plus app- and
org-scoped `invites`. All scoped modules are tuple form
(`['memberships_module', { scope: 'org' }]`) — the colon-string form
(`'memberships_module:org'`) is rejected by the provision proc.

After provisioning, re-run codegen (`pnpm codegen`) so the generated admin SDK
(`@sdk/admin`) gains the org / members / invites query + mutation hooks that the
org blocks consume.

## 2. Add the registry org blocks

Install the organization blocks from the Constructive blocks registry and mount
them on your org routes — they bring their own data hooks, wired to the
org-scoped admin SDK:

```bash
npx shadcn@latest add org-create-card org-members-list org-roles-editor org-settings-form
```

| Block               | Purpose                                  |
| ------------------- | ---------------------------------------- |
| `org-create-card`   | Create a new organization                |
| `org-members-list`  | List / manage members of an organization |
| `org-roles-editor`  | Edit member roles & permissions          |
| `org-settings-form` | Organization profile & settings          |

Then reintroduce the org navigation seam that the base intentionally leaves
minimal:

- `src/lib/navigation/sidebar-config.ts` — add an `Organizations` nav entry and
  an org-level nav group.
- `src/lib/navigation/use-entity-params.ts` — reintroduce the `orgId` path param
  (and an org switcher) so `/orgs/[orgId]/*` routes resolve.
- `src/app-routes.ts` — add the org-scoped routes; the
  `requiredPermission: 'app-admin'` gate in `RouteGuard` is already present for
  app-admin surfaces to reuse.

That's the whole opt-in: provision the modules, regenerate the SDK, drop in the
blocks, and wire the routes. No org UI is hand-written in this template.

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
resolves **this tenant's** `memberships_public` schema via the metaschema
(scoped by `database_id`, not a floating `LIKE`) and runs:

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
