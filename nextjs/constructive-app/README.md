# Constructive App Template

<p align="center" width="100%">
  <img height="120" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

## Quick Start

1. Copy `.env.example` to `.env.local` and set your database name:
   ```
   NEXT_PUBLIC_DB_NAME=your-db-name
   ```
2. Run `pnpm install && pnpm dev`
3. Run `pnpm codegen` to generate the GraphQL SDK from your database

## APIs

All endpoints are derived from `NEXT_PUBLIC_DB_NAME`:

| SDK | Endpoint | Purpose |
|-----|----------|---------|
| `@sdk/admin` | `http://admin-{db}.localhost:3000/graphql` | Organizations, members, permissions, invites |
| `@sdk/auth` | `http://auth-{db}.localhost:3000/graphql` | Users, emails, authentication |
| `@sdk/app` | `http://app-public-{db}.localhost:3000/graphql` | Your business data |

---

Built by the [Constructive](https://constructive.io) team.

## Disclaimer

AS DESCRIBED IN THE LICENSES, THE SOFTWARE IS PROVIDED "AS IS", AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND.

No developer or entity involved in creating this software will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the code, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.
