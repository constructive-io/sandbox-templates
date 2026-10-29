# constructive-app

Next.js + Constructive per-tenant-database boilerplate. Ships the base
`auth:hardened` module set (email/password auth, sessions, rate limits,
passkeys, SSO infrastructure) with no org/B2B surface — see
[docs/B2B.md](./docs/B2B.md) for the org opt-in.

App code follows the rules in [docs/CONVENTIONS.md](./docs/CONVENTIONS.md)
(static-export routing, stack cards, query error states, scrolling).

> **Architecture note:** `constructive` is the ONE physical database (platform
> + every tenant's `{tenant}_*` schemas). `myapp` is the logical per-tenant DB
> name used for schema prefixes and subdomain routing
> (`api-myapp.localhost`) — it is never a connectable database.

## Repo layout assumptions

This template expects sibling checkouts of the Constructive monorepos:

```
<workspace>/
├── constructive/        # GraphQL server + pgpm CLI (@pgpmjs/export link target)
├── constructive-db/     # platform modules (constructive-local deploy)
└── sandbox-templates/nextjs/constructive-app/   # this repo
```

`packages/export` depends on `@pgpmjs/export` via a `link:` into
`constructive/pgpm/export/dist` — build it once with
`cd constructive/pgpm/export && pnpm install && pnpm build`.

## Full setup (from scratch)

```bash
# 1. In the constructive-db repo — platform deploy
docker compose up -d
pnpm install
eval "$(pgpm env)"
createdb constructive
pgpm admin-users bootstrap --database constructive --yes
pgpm admin-users add --database constructive --test --yes
pgpm deploy --yes --database constructive --package constructive-local

# 2. In the constructive repo (constructive/graphql/server) — GraphQL server
pnpm install
PGDATABASE=constructive pnpm dev
# (or: PGDATABASE=constructive cnc server --port 3000 --origin "*")

# 3. In this repo — create the tenant + provision modules
eval "$(pgpm env)"
pnpm run create-db
pnpm run provision
pgpm deploy --yes --database constructive --package dev-local
pnpm run seed

# 4. Generate the SDK from the live endpoints, then start the app
pnpm codegen
pnpm dev
```

Steps 1–3 (minus the GraphQL server, which runs separately) are automated by:

```bash
pnpm run local:bringup
```

## Export (regenerate packages/myapp + packages/myapp-service)

With the full setup running:

```bash
pnpm export:graphql
```

This rewrites `packages/myapp` (tenant DDL from `sql_actions`) and
`packages/myapp-service` (metaschema/services metadata). Never hand-edit the
generated SQL.

Then install the @pgpm module dependencies the proper way — `pgpm install`
inside each exported package dir (installs everything listed in the
package's `.control` `requires` into `extensions/` and records the resolved
versions in `package.json` + `.control`):

```bash
cd packages/myapp && pgpm install
cd ../myapp-service && pgpm install
```

## Redeployment (local, from exported packages)

Wipe the previous container/database first, then:

```bash
docker compose up -d
pnpm install
eval "$(pgpm env)"
createdb constructive
pgpm admin-users bootstrap --database constructive --yes
pgpm admin-users add --database constructive --test --yes

# Install @pgpm module deps (skip if extensions/ is already committed)
(cd packages/myapp-service && pgpm install)
(cd packages/myapp && pgpm install)

pgpm deploy --package myapp-service --database constructive --yes
pgpm deploy --package myapp --database constructive --yes
pgpm deploy --package dev-local --database constructive --yes
pgpm deploy --package myapp-test-seed --database constructive --yes

# GraphQL server (constructive repo): PGDATABASE=constructive pnpm dev
pnpm codegen
pnpm dev
```

## Debugging

Use `psql -P pager=off -d constructive` so output never blocks on the pager.
The deploy steps for `myapp-service` / `myapp` are the usual failure points
after upstream changes — inspect the failing SQL there first.

Note: `pnpm codegen` runs through `scripts/codegen.sh`, which preserves this
hand-written README — the codegen tool otherwise overwrites the project-root
`README.md` with a generated SDK overview on every run.

## Structure

| Path                      | Purpose                                                      |
| ------------------------- | ------------------------------------------------------------ |
| `src/`                    | Next.js app (auth, account, app shell)                       |
| `packages/provision`      | `create-db` / `provision` / `seed` scripts                   |
| `packages/export`         | `export:graphql` — live GraphQL → pgpm packages              |
| `packages/myapp`          | exported tenant DDL package (regenerated, never hand-edited) |
| `packages/myapp-service`  | exported metaschema/services package (regenerated)           |
| `packages/myapp-test-seed`| pgpm seed package for local dev data                         |
| `packages/dev-local`      | local-dev patch module for upstream drift                    |
| `extensions/`             | @pgpm modules installed via `pgpm install`                   |

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.
