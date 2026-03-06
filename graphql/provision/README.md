# @constructive-templates/provision

Pre-built provisioning template for Constructive apps. Handles the entire Phase 2.2 + 2.3 workflow: database creation, workarounds, secured table provisioning, and relation creation.

## Usage

1. Copy this template into your project
2. Fill in `provision.config.ts` with values from your app brief (`build/app-brief.yaml`)
3. Run provisioning:

```bash
pnpm install
pnpm provision
```

## Config Shape

```typescript
import { defineProvisionConfig } from './provision.config';

export default defineProvisionConfig({
  platformAuth: 'https://auth.example.com',
  platformApi: 'https://api.example.com',
  database: {
    name: 'my-app-db',
    modules: ['memberships'],
    bootstrapUser: true,
  },
  auth: {
    email: 'admin@example.com',
    password: 'secure-password',
  },
  tables: [
    {
      name: 'projects',
      nodeType: 'node',
      policyType: 'permissive',
      grantRoles: ['app_member'],
      grantPrivileges: [['app_member', 'ALL']],
      compose: [
        { nodeType: 'sluggable' },
        { nodeType: 'publishable' },
      ],
    },
  ],
  relations: [
    {
      source: 'projects',
      target: 'tasks',
      type: 'has-many',
      deleteAction: 'CASCADE',
    },
  ],
});
```

## Output

The script outputs a JSON result to stdout containing:

- `database`: name, id, and schema prefix of the created database
- `auth`: platform user ID and token references
- `tables`: list of created table names
- `relations`: list of created relation descriptors

This output is designed for consumption by `test/run-state.json`.
