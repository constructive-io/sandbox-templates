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
