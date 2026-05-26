# constructive-templates

Boilerplate templates for Constructive applications.

## Templates

- **nextjs/constructive-app** — Next.js frontend boilerplate with auth, org management, and GraphQL SDK integration


## Setup

In constructive-db repo:

```bash
docker-compose up -d
eval "$(pgpm env)"
createdb constructive
pgpm admin-users bootstrap --yes
pgpm admin-users add --test --yes
pgpm deploy --yes --database constructive --package constructive-local
```

In constructive repo:
```bash
pnpm install
PGDATABASE=constructive pnpm dev
```

In constructive-app package:
```bash
pnpm install
eval "$(pgpm env)"
pnpm run create-db
pnpm run provision
pnpm run codegen
pnpm run dev
```