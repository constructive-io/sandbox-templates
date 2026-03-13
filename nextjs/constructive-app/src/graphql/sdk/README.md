# Per-DB SDK Structure

This directory contains three SDK contexts, each connecting to a different GraphQL endpoint:

## Contexts

| Context | Endpoint Pattern | Contains |
|---------|-----------------|----------|
| `admin` | `admin-{db}.localhost:3000` | Organizations, members, permissions, invites |
| `auth` | `auth-{db}.localhost:3000` | Users, emails, authentication |
| `app` | `app-public-{db}.localhost:3000` | Your business data |

## Usage

```typescript
// Import from the appropriate context
import { useOrganizationsQuery } from '@sdk/admin';
import { useCurrentUserQuery, fetchUsersQuery } from '@sdk/auth';
import { useBoardsQuery } from '@sdk/app';
```

## Generation

1. Set your database name in `.env.local`:
   ```
   NEXT_PUBLIC_DB_NAME=your-db-name
   ```

2. Run codegen:
   ```bash
   pnpm codegen
   ```

## Important Notes

- **User APIs are in `@sdk/auth`**, not `@sdk/admin`
  - `useCurrentUserQuery`, `fetchUsersQuery`, `useDeleteUserMutation`
- Organization/permission APIs are in `@sdk/admin`
- Your business tables are in `@sdk/app`
