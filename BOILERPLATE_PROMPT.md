# Constructive Boilerplate - Maintenance Prompt

## Overview

The `nextjs/constructive-app` boilerplate is a **lightweight, minimal starter template** for building applications with the Constructive stack. It provides essential UI and basic functionality for:

- **Authentication**: Sign up, sign in, sign out
- **User Management**: User profile, settings
- **Organization Management**: Org settings, org-user management

**Critical Principle**: Keep the boilerplate **simple, minimal, and lightweight**. Remove all database-specific, complex state management, and advanced features that are not essential for a basic starter.

## Source of Truth

- **Reference**: `/Users/gefeihou/Documents/dashboard` (apps/admin)
- **Boilerplate**: `/Users/gefeihou/Documents/constructive-templates/nextjs/constructive-app`

The dashboard is the **updated, full-featured version** to copy from, but it contains many features that should **NOT** be included in the boilerplate.

## What to INCLUDE

### ✅ Core Features

1. **Authentication System**
   - Sign up, sign in, sign out flows
   - Token management (`src/lib/auth/token-manager.ts`)
   - Auth hooks from `src/lib/gql/hooks/auth/`

2. **User Management**
   - User profile pages
   - User settings
   - Basic user CRUD operations

3. **Organization Management**
   - Organization settings
   - **Org-user management** (managing users within an org)
   - Basic org CRUD operations
   - **NO database management features**

4. **UI Components**
   - All components from `@constructive-io/ui` package
   - Base UI primitives
   - Shared components in `src/components/`
   - Keep the modern, beautiful UI that matches dashboard

5. **GraphQL Integration**
   - **Schema Builder SDK** (codegen-generated hooks in `src/graphql/schema-builder-sdk/`)
   - GraphQL codegen configuration
   - **DO NOT MODIFY** codegen output - it's auto-generated

6. **Essential Infrastructure**
   - Next.js 15 + React 19 + TypeScript setup
   - Tailwind CSS v4 configuration
   - TanStack Query for data fetching
   - TanStack Form for forms
   - Basic routing and navigation
   - Environment configuration (3-tier: UI override > Docker runtime > Build-time)

### ✅ Essential Dependencies

Keep these from `package.json`:
- `@constructive-io/ui` (published version, not workspace:*)
- `@base-ui/react`
- `@tanstack/react-query`, `@tanstack/react-form`
- `next`, `react`, `react-dom`
- `tailwindcss`, `class-variance-authority`, `clsx`, `tailwind-merge`
- `graphql`, `graphql-request`, `gql.tada`
- `lucide-react` (icons)
- `next-themes`, `sonner` (toast)
- `zod` (validation)
- `zustand` (minimal state only)

## What to EXCLUDE

### ❌ Remove These Features

1. **Database Management**
   - Data grid components (`src/components/dashboard/data-grid/`)
   - Table management UI
   - Schema exploration
   - Database connection features
   - Cell registry, form registry for database types
   - PostgreSQL type handling (`ast-adapter.ts`)

2. **Complex State Management**
   - Remove `data-grid-slice.ts`
   - Remove `draft-rows-slice.ts`
   - Remove `policy-slice.ts`
   - Remove `schema-slice.ts`
   - **Keep only**: `auth-slice.ts`, `env-slice.ts`, `preferences-slice.ts`

3. **Advanced Features**
   - Storybook setup (remove `stories/`, `.storybook/`, storybook scripts)
   - Complex data visualization
   - Advanced table features
   - Seeding scripts (unless basic demo data)
   - GraphiQL devtool integration

4. **Heavy Dependencies**
   - `@glideapps/glide-data-grid` (canvas-based grid)
   - `@xyflow/react` (flow diagrams)
   - `react-leaflet`, `leaflet` (maps)
   - `ace-builds`, `react-ace` (code editor)
   - `pg-ast`, `pgsql-deparser` (PostgreSQL parsing)
   - `introspectron` (schema introspection)
   - `@dnd-kit/*` (drag and drop, unless needed for basic UI)
   - `match-sorter` (advanced filtering)
   - `inflection`, `pluralize` (unless needed for basic features)

5. **Testing Infrastructure** 
   - Remove extensive test suites if they're database-specific
   - Keep basic component tests
   - Keep test setup but remove heavy test fixtures

6. **Dev mode**
   - Remove all dev mode related stuff

### ❌ Files/Directories to Remove

```
src/components/dashboard/data-grid/
src/lib/cell-registry/
src/lib/form-registry/
src/lib/gql/query-generator.ts (if database-specific)
src/lib/gql/field-selector.ts (if database-specific)
src/lib/gql/ast-adapter.ts
src/lib/gql/hooks/dashboard/ (if database-specific)
src/lib/data/ (if database-specific)
src/store/data-grid-slice.ts
src/store/draft-rows-slice.ts
src/store/policy-slice.ts
src/store/schema-slice.ts
src/stories/
.storybook/
scripts/ (except basic ones)
docs/ (unless essential)
test/ (if database-specific)
```

## GraphQL Codegen

**CRITICAL**: The `src/graphql/schema-builder-sdk/` directory is **auto-generated** by `@constructive-io/graphql-codegen`.

- **Never modify** files in this directory manually
- Run `pnpm codegen` to regenerate after schema changes
- Configuration is in `graphql-codegen.config.ts`
- The SDK provides typed hooks: `useXxxQuery`, `useXxxMutation`

## Architecture Principles

### Keep It Simple

1. **Minimal State**: Only auth, env, and preferences in Zustand
2. **Basic Routing**: Simple Next.js app router structure
3. **Essential Pages**: Auth, user profile, org settings, org-user management
4. **Clean UI**: Just use the ui code from dashboard
5. **Type Safety**: Full TypeScript, but don't over-complicate

### UI/UX Standards

- Match the dashboard's modern, clean aesthetic
- Use `@constructive-io/ui` components consistently
- Tailwind CSS v4 conventions (see dashboard AGENTS.md)
- Responsive design
- Accessible components (Base UI primitives)

### Code Style

- Functional and declarative patterns
- Named exports
- TypeScript for all code
- Descriptive variable names
- Prettier formatting (single quotes, 120 char width)

## File Structure

```
constructive-app/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/       # Protected pages
│   │   │   ├── profile/       # User profile
│   │   │   ├── settings/      # User settings
│   │   │   └── org/           # Org management
│   │   │       ├── settings/  # Org settings
│   │   │       └── users/     # Org-user management
│   │   └── layout.tsx
│   ├── components/            # Shared components
│   │   ├── auth/             # Auth-related components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # UI components (from @constructive-io/ui)
│   ├── graphql/              # GraphQL SDK (auto-generated)
│   │   └── schema-builder-sdk/  # DO NOT MODIFY
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities
│   │   ├── auth/            # Auth utilities
│   │   ├── gql/             # GraphQL utilities (minimal)
│   │   └── runtime/         # Runtime config
│   ├── store/               # Zustand store (minimal)
│   │   ├── app-store.ts
│   │   ├── auth-slice.ts
│   │   ├── env-slice.ts
│   │   └── preferences-slice.ts
│   ├── app-config.ts        # App configuration
│   └── app-routes.ts        # Route definitions
├── public/                   # Static assets
├── .env.local               # Environment variables
├── graphql-codegen.config.ts # Codegen config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Updating from Dashboard

### Process

1. **Identify Changes**: Review what changed in dashboard
2. **Filter Relevance**: Determine if changes apply to boilerplate scope
3. **Copy Selectively**: Only copy auth, user, org-user related changes
4. **Remove Database Code**: Strip out any database management features
5. **Simplify State**: Ensure only minimal Zustand slices are used
6. **Test**: Verify auth flows, user management, org management work
7. **Document**: Update this prompt if scope changes

### What to Copy

- ✅ Auth flow improvements
- ✅ UI component updates from `@constructive-io/ui`
- ✅ User profile/settings enhancements
- ✅ Org settings improvements
- ✅ Org-user management features
- ✅ Bug fixes in shared utilities
- ✅ TypeScript improvements
- ✅ Tailwind CSS updates

### What NOT to Copy

- ❌ Database grid features
- ❌ Schema management
- ❌ Complex state slices
- ❌ Heavy dependencies
- ❌ Database-specific utilities
- ❌ Storybook stories
- ❌ Advanced data visualization

## Environment Variables

Keep minimal environment configuration:

```bash
# GraphQL Endpoint (Schema Builder)
NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT=http://api.localhost:3000/graphql

# Optional: Dev mode bypass
NEXT_PUBLIC_DEV_MODE=false
```

**Remove**: CRM/Dashboard endpoint, database connection strings, complex config

## Scripts

Keep essential scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "lint:types": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "test": "vitest run",
    "test:watch": "vitest --watch",
    "codegen": "rm -rf ./src/graphql/schema-builder-sdk && npx @constructive-io/graphql-codegen generate --config ./graphql-codegen.config.ts",
    "codegen:w": "npx @constructive-io/graphql-codegen generate --config ./graphql-codegen.config.ts --watch"
  }
}
```

**Remove**: Storybook scripts, seeding scripts, database-specific test scripts

## Key Differences: Dashboard vs Boilerplate

| Feature | Dashboard | Boilerplate |
|---------|-----------|-------------|
| **Purpose** | Full database management platform | Lightweight starter template |
| **State Management** | 8 Zustand slices | 3 slices (auth, env, preferences) |
| **GraphQL Endpoints** | Dual (Schema Builder + CRM) | Single (Schema Builder only) |
| **Data Grid** | Advanced canvas-based grid | Not included |
| **Dependencies** | ~87 packages | ~40-50 packages |
| **Features** | Database CRUD, schema mgmt, viz | Auth, user mgmt, org mgmt |
| **Complexity** | High | Low |
| **Use Case** | Production database tool | Quick project starter |

## Maintenance Checklist

When updating boilerplate from dashboard:

- [ ] Review dashboard changes since last sync
- [ ] Identify auth/user/org-related updates
- [ ] Copy relevant files to boilerplate
- [ ] Remove any database-specific code
- [ ] Verify Zustand slices are minimal (3 only)
- [ ] Check dependencies - remove heavy ones
- [ ] Test auth flows (sign up, sign in, sign out)
- [ ] Test user management features
- [ ] Test org management and org-user features
- [ ] Run `pnpm lint:types` to check TypeScript
- [ ] Run `pnpm build` to verify production build
- [ ] Update this prompt if scope changes

## Common Pitfalls

1. **Don't copy database features** - Easy to accidentally include data grid code
2. **Watch dependencies** - Dashboard has many heavy deps that bloat boilerplate
3. **Zustand slices** - Only keep auth, env, preferences
4. **GraphQL endpoints** - Boilerplate uses Schema Builder only, not CRM
5. **Storybook** - Not needed in boilerplate
6. **Test fixtures** - Remove database-specific test data
7. **Over-engineering** - Keep it simple, resist adding "nice to have" features

## Questions to Ask Before Adding Features

1. Is this essential for a basic starter app?
2. Does this relate to auth, user, or org management?
3. Will this significantly increase bundle size?
4. Does this add complex dependencies?
5. Is this database-specific functionality?

If any answer is "yes" to 3-5, **don't add it**.

## Version Alignment

- **Next.js**: Match dashboard version
- **React**: Match dashboard version
- **TypeScript**: Match dashboard version
- **Tailwind CSS**: Match dashboard version
- **@constructive-io/ui**: Use published version (not workspace:*)
- **TanStack packages**: Match dashboard versions

## Support

For questions about:
- **Architecture**: Refer to dashboard's AGENTS.md
- **UI Components**: Check `@constructive-io/ui` package
- **GraphQL Codegen**: See `@constructive-io/graphql-codegen` docs
- **Boilerplate Scope**: Use this document as the source of truth
