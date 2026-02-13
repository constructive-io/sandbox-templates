# Constructive App Boilerplate

A Next.js frontend boilerplate with authentication, organization management, invites, members, and a GraphQL SDK powered by Constructive.

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS 4** + shadcn/ui (Base UI)
- **TanStack React Query** for data fetching
- **GraphQL** with codegen SDK

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server (Turbopack, port 3001) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm lint:types` | TypeScript type check |
| `pnpm format` | Prettier format |
| `pnpm codegen` | Regenerate GraphQL SDK |
| `pnpm codegen:w` | Watch mode codegen |

## Configuration

- **`.env.local`** — GraphQL endpoint and database setup variables
- **`src/config/branding.ts`** — Customize app name, logos, and legal links
- **`graphql-codegen.config.ts`** — GraphQL codegen configuration
