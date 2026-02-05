# Table Permissions & RLS Guide

## 🎯 Overview

When you create tables through the schema-builder UI, the system **automatically grants basic permissions** to make tables immediately usable in your application's GraphQL endpoint. This guide explains how the permission system works and how to customize it.

## 🚀 Quick Start: What Happens Automatically

### Table Creation

When you create a new table, the system automatically:

✅ Grants `SELECT`, `INSERT`, `UPDATE`, `DELETE` privileges to `authenticated` role  
✅ Makes the table accessible via application GraphQL endpoints  
✅ Sets up UUID auto-generation for primary key fields  
✅ No RLS enabled by default (all authenticated users can access all records)

**This means your tables work immediately without manual configuration!**

## 🔒 Permission Concepts

### 1. Grants vs Policies

**Grants** = What operations are allowed (table-level or field-level)

- `SELECT` - Read data
- `INSERT` - Create new records
- `UPDATE` - Modify existing records
- `DELETE` - Remove records

**Policies** = Who can perform operations (row-level filtering)

- Applied when RLS is enabled
- Filter which specific rows a user can access
- Based on user context (e.g., user ID from JWT)

### 2. Table-Level vs Field-Level Grants

**Table-Level Grant** (all fields):

```typescript
// All authenticated users can SELECT all fields
await createGrant({
	databaseId: 'xxx',
	tableName: 'products',
	privileges: ['select', 'delete'],
});
```

**Field-Level Grant** (specific fields only):

```typescript
// Users can INSERT only specific fields
await createGrant({
	databaseId: 'xxx',
	tableName: 'products',
	privileges: ['insert'],
	fieldNames: ['name', 'description', 'price'],
	// Excludes: id, created_at, is_verified, etc.
});
```

**Why field-level grants matter:**

- **Security**: Prevent setting sensitive fields (e.g., `is_admin`, `is_verified`)
- **Data integrity**: Enforce business rules at database level
- **Auto-generated fields**: Exclude `id`, `created_at`, `updated_at`

## 🛠️ Using the Permission Hooks

### Basic Grant Creation

```typescript
import { useCreateTableGrant } from '@/lib/gql/hooks/schema-builder/use-table-grants';

function MyComponent() {
	const { mutateAsync: createGrant } = useCreateTableGrant();

	const handleSetupPermissions = async () => {
		// Grant all operations
		await createGrant({
			databaseId: 'xxx',
			tableName: 'products',
			privileges: ['select', 'insert', 'update', 'delete'],
		});
	};
}
```

### Batch Grant Creation

```typescript
import { useBatchCreateTableGrants } from '@/lib/gql/hooks/schema-builder/use-table-grants';

function setupProductPermissions() {
	const { mutateAsync: batchGrant } = useBatchCreateTableGrants();

	await batchGrant({
		databaseId: 'xxx',
		tableName: 'products',
		grants: [
			{ privileges: ['select', 'delete'] }, // All fields
			{ privileges: ['insert'], fieldNames: ['seller_id', 'name', 'price'] },
			{ privileges: ['update'], fieldNames: ['name', 'description', 'is_active'] },
		],
	});
}
```

### Enabling Row-Level Security (RLS)

```typescript
import { useSetupTableRls } from '@/lib/gql/hooks/schema-builder/use-table-rls';

function enableOwnershipSecurity() {
	const { mutateAsync: setupRls } = useSetupTableRls();

	// Users can only access their own records
	await setupRls({
		databaseId: 'xxx',
		tableName: 'products',
		ownerField: 'seller_id', // Field that identifies record owner
	});
}
```

## 📋 Common Permission Patterns

### Pattern 1: Public Table (Default)

**Use case:** Categories, tags, reference data

```typescript
// Automatically applied when you create a table
// All authenticated users can perform all operations
await createGrant({
	databaseId: 'xxx',
	tableName: 'categories',
	privileges: ['select', 'insert', 'update', 'delete'],
});
```

### Pattern 2: User-Owned Records

**Use case:** Products, posts, user profiles

```typescript
// Step 1: Grant operations (table or field-level)
await batchGrant({
	databaseId: 'xxx',
	tableName: 'products',
	grants: [
		{ privileges: ['select', 'delete'] },
		{ privileges: ['insert'], fieldNames: ['seller_id', 'name', 'price'] },
		{ privileges: ['update'], fieldNames: ['name', 'description'] },
	],
});

// Step 2: Enable RLS with owner field
await setupRls({
	databaseId: 'xxx',
	tableName: 'products',
	ownerField: 'seller_id',
});
```

### Pattern 3: Read-Only Table

**Use case:** System logs, audit trails

```typescript
// Only SELECT allowed
await createGrant({
	databaseId: 'xxx',
	tableName: 'audit_logs',
	privileges: ['select'],
});
```

### Pattern 4: Admin-Only Table

**Use case:** Configuration, system settings

```typescript
// Grant to admin role instead of authenticated
await createGrant({
	databaseId: 'xxx',
	tableName: 'settings',
	privileges: ['select', 'insert', 'update', 'delete'],
	roleName: 'administrator',
});
```

## 🐛 Common Issues & Solutions

### Issue 1: "Permission Denied for Table"

**Symptom:** GraphQL queries return permission denied errors

**Causes & Solutions:**

1. **No grants exist** → Create table grants using hooks above
2. **Field-level grant mismatch** → Check that all required fields are in grant
3. **RLS enabled but no policy** → Either disable RLS or create policy
4. **Wrong role** → Grant to 'authenticated' not 'anonymous'

### Issue 2: "Cannot Insert Record" (UUID fields)

**Symptom:** Required to provide `id` field but get permission denied

**Cause:** UUID primary key without default value

**Solution:** ✅ **Automatically handled!** The system now auto-sets `uuid_generate_v4()` as default for UUID primary keys.

**Manual fix if needed:**

```typescript
// When creating field, set default value
defaultValue: 'uuid_generate_v4()';

// Then exclude 'id' from INSERT grants
fieldNames: ['name', 'email']; // Don't include 'id'
```

### Issue 3: RLS Blocks All Access

**Symptom:** Even table owner cannot access records

**Causes & Solutions:**

1. **Missing policy** → Create policy for all operations
2. **Wrong entity field** → Use field that stores user ID (user_id, seller_id, customer_id)
3. **Policy on wrong table** → Check policy is on correct table
4. **Grants missing** → RLS requires both grants AND policies

## 🔍 Debugging Permissions

### Check if grants exist:

```sql
-- In PostgreSQL
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'your_schema_name'
  AND grantee = 'authenticated';
```

### Check if RLS is enabled:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'your_schema_name';
```

### Check policies:

```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'your_schema_name';
```

## 📚 Advanced Topics

### Custom Policy Templates

The system supports several policy templates:

- `direct_owner` - User can only access their own records
- `public_read` - All users can read, owner can modify
- `admin_all` - Admins have full access

To create custom policies, use `useCreateTablePolicy` directly:

```typescript
await createPolicy({
	databaseId: 'xxx',
	tableName: 'products',
	policyName: 'seller_access',
	privileges: ['select', 'update', 'delete'],
	template: 'direct_owner',
	data: { entity_field: 'seller_id' },
});
```

### Relationship Table Permissions

For tables like `order_items` that depend on parent tables:

```typescript
// Option 1: No RLS (access controlled by parent)
await createGrant({
	databaseId: 'xxx',
	tableName: 'order_items',
	privileges: ['select', 'insert', 'update', 'delete'],
});

// Option 2: RLS through parent (requires custom policy template)
// Currently not supported - use Option 1
```

## 🎓 Best Practices

1. ✅ **Use auto-grants**: Let the system handle basic permissions on table creation
2. ✅ **Start without RLS**: Enable RLS only when you need row-level isolation
3. ✅ **Field-level grants for INSERT/UPDATE**: Exclude sensitive and auto-generated fields
4. ✅ **Table-level grants for SELECT/DELETE**: Usually don't need field restrictions
5. ✅ **Test with real JWT**: Permissions work differently for authenticated vs anonymous users
6. ✅ **Document custom permissions**: Add comments explaining why you deviated from defaults

## 🚨 Critical Warnings

⚠️ **Never grant to public role** - Security risk, use 'authenticated' or 'anonymous'  
⚠️ **Always test permissions** - Permission bugs can break your entire application  
⚠️ **UUID primary keys need defaults** - System handles this automatically now  
⚠️ **RLS requires grants + policies** - Having just one or the other won't work  
⚠️ **Don't include 'id' in INSERT grants** - Let database generate IDs

## 📖 Related Documentation

- [SEED_GUIDE.md](../../../../../scripts/SEED_GUIDE.md) - Comprehensive RLS reference from seeder
- [PostGraphile Docs](https://www.graphile.org/postgraphile/) - GraphQL permissions
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) - Row-level security

## 🤝 Need Help?

If permissions aren't working as expected:

1. Check console logs for grant creation messages
2. Review PostgreSQL grants and policies (SQL above)
3. Verify API is configured with correct schema
4. Test in GraphiQL with proper JWT token
