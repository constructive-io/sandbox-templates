/**
 * GraphQL-only export script for constructive-app.
 *
 * No pgpm workspace dependency — all data is fetched via GraphQL endpoints
 * and SQL modules are written directly using @pgpmjs/core file writers.
 *
 * This replaces the previous flow that required PgpmPackage.ensureWorkspace()
 * and a pgpm.json workspace file, which sandbox templates don't have.
 *
 * Usage:
 *   DATABASE_ID=xxx ACCESS_TOKEN=xxx tsx src/run-graphql-export.ts
 *
 * Environment:
 *   META_ENDPOINT     - GraphQL endpoint for metaschema/services data (default: http://api.localhost:3000/graphql)
 *   MIGRATE_ENDPOINT  - GraphQL endpoint for sql_actions (default: http://migrate-{dbName}.localhost:3000/graphql)
 *                     The migrate API is public (isPublic: true) after running
 *                     'pnpm provision', so subdomain routing works.
 *                     Falls back to X-Api-Name header routing if subdomain fails.
 *   ACCESS_TOKEN      - Metaschema-level Bearer token (loaded from .env)
 *   ADMIN_EMAIL       - Admin email for db-scoped sign-in (default: admin@myapp.local)
 *   ADMIN_PASSWORD    - Admin password for db-scoped sign-in (default: Password123!)
 *   DATABASE_ID       - UUID of the provisioned database (required, loaded from .env)
 *   DATABASE_NAME     - Database name for subdomain routing (default: myapp)
 *   EXTENSION_NAME    - Extension name for the DB module (default: myapp)
 *   META_EXTENSION_NAME - Extension name for the service module (default: myapp-service)
 *   AUTHOR            - Author string (default: constructive-app)
 *   GITHUB_USERNAME   - GitHub username for module scaffolding
 *   REPO_NAME         - Repository name for module scaffolding
 *
 * Migrate endpoint routing:
 *   The Constructive server (cnc server) handles ALL subdomains on one port.
 *   The migrate endpoint is routed via either:
 *   1. Subdomain routing: migrate-{dbName}.localhost:3000 → domain lookup (requires isPublic: true)
 *   2. X-Api-Name header: X-Api-Name=migrate + X-Database-Id → API name lookup
 *   Run 'pnpm provision' to create the migrate API with isPublic: true and
 *   link the ddl_audit_public schema (which contains safe views over db_migrate).
 */

import { PgpmRow, SqlWriteOptions, writePgpmFiles, writePgpmPlan } from '@pgpmjs/core';
import {
  GraphQLClient,
  exportGraphQLMeta,
  graphqlRowToPostgresRow,
  META_COMMON_HEADER,
  META_COMMON_FOOTER,
  META_TABLE_ORDER,
  makeReplacer,
  normalizeOutdir
} from '@pgpmjs/export';
import type { Schema } from '@pgpmjs/export';
import { createClient } from '@pgpmjs/migrate-client';
import { auth } from '@constructive-io/node';
import { createFetch } from '@constructive-io/fetch';
import { mkdirSync, rmSync, existsSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Patch globalThis.fetch with localhost-aware fetch BEFORE any GraphQL calls.
// @pgpmjs/export's GraphQLClient uses native fetch() which can't resolve
// *.localhost subdomains in Node.js. createFetch() handles DNS rewriting
// and Host header preservation.
globalThis.fetch = createFetch();

// Load .env from project root
dotenv.config({ path: path.resolve(import.meta.dirname, '../../../.env'), override: true });

/**
 * Creates the module directory structure (deploy/revert/verify) directly
 * without requiring a pgpm workspace or PgpmPackage.initModule().
 */
function prepareModuleDir(outdir: string, name: string): string {
  const moduleDir = path.resolve(outdir, name);
  mkdirSync(moduleDir, { recursive: true });

  // If a pgpm.plan already exists, clean deploy/revert/verify dirs
  // (same behavior as preparePackage in @pgpmjs/export)
  const planPath = path.join(moduleDir, 'pgpm.plan');
  const dirs = ['deploy', 'revert', 'verify'];
  if (existsSync(planPath)) {
    for (const d of dirs) {
      const p = path.join(moduleDir, d);
      rmSync(p, { recursive: true, force: true });
    }
  }

  return moduleDir;
}

async function main() {
  const projectRoot = path.resolve(import.meta.dirname, '../../..');
  const extensionName = process.env.EXTENSION_NAME || 'myapp';
  const metaExtensionName = process.env.META_EXTENSION_NAME || 'myapp-service';
  const author = process.env.AUTHOR || 'constructive-app';

  // GraphQL-specific env vars
  const metaEndpoint = process.env.META_ENDPOINT || process.env.API_ENDPOINT || 'http://api.localhost:3000/graphql';
  const token = process.env.ACCESS_TOKEN || process.env.TOKEN;
  const databaseId = process.env.DATABASE_ID;
  const databaseNameEnv = process.env.DATABASE_NAME || 'myapp';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@myapp.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Password123!';
  // The migrate endpoint uses subdomain routing with the tenant's dbName
  // (e.g., http://migrate-myapp.localhost:3000/graphql). After 'pnpm provision',
  // the migrate API is public (isPublic: true) with ddl_audit_public.sql_actions
  // linked, so subdomain routing works. The 'migrate' subdomain (no suffix) is
  // owned by the platform's own migrate API, so we must use the '-{dbName}' form.
  // Falls back to X-Api-Name header routing if subdomain fails.
  const migrateEndpoint = process.env.MIGRATE_ENDPOINT || `http://migrate-${databaseNameEnv}.localhost:${process.env.NEXT_PUBLIC_API_PORT || '3000'}/graphql`;

  console.log(`\npgpm GraphQL export (workspace-free)\n`);
  console.log(`  projectRoot:      ${projectRoot}`);
  console.log(`  metaEndpoint:     ${metaEndpoint}`);
  console.log(`  migrateEndpoint:  ${migrateEndpoint || '(not set — sql_actions will be skipped)'}`);
  console.log(`  extension:        ${extensionName}`);
  console.log(`  author:           ${author}`);
  console.log(`  databaseName:     ${databaseNameEnv}`);

  if (!databaseId) {
    console.error('DATABASE_ID is required. Provide the UUID of the provisioned database.');
    process.exit(1);
  }

  // Output directory — packages/ under the project root
  const outdir = normalizeOutdir(path.resolve(projectRoot, 'packages/'));

  // 1. Create GraphQL client for discovery
  const headers: Record<string, string> = { 'X-Meta-Schema': 'true' };
  if (databaseId) {
    headers['X-Database-Id'] = databaseId;
  }
  const client = new GraphQLClient({ endpoint: metaEndpoint, token, headers });

  // 2. Resolve database name via GraphQL
  console.log(`\nResolving database via GraphQL...`);
  let databaseName = databaseNameEnv;
  const dbRows = await client.fetchAllNodes(
    'databases',
    'id\nname',
    { id: databaseId }
  );

  if (dbRows.length === 0) {
    console.error(`No database found with id ${databaseId}`);
    process.exit(1);
  }

  const dbRow = graphqlRowToPostgresRow(dbRows[0] as Record<string, unknown>);
  databaseName = (dbRow.name as string) || 'myapp';
  console.log(`  database: ${databaseName} (${databaseId})`);

  // 3. Fetch schemas via GraphQL
  console.log(`Fetching schemas via GraphQL...`);
  const schemaRows = await client.fetchAllNodes(
    'schemas',
    'name\nschemaName',
    { databaseId }
  );

  const schemas: Schema[] = schemaRows.map((row: Record<string, unknown>) => {
    const pgRow = graphqlRowToPostgresRow(row as Record<string, unknown>);
    return {
      name: pgRow.name as string,
      schema_name: pgRow.schema_name as string
    };
  });

  const schema_names = schemas.map(s => s.schema_name);
  console.log(`  schemas: ${schema_names.length}`);

  if (schema_names.length === 0) {
    console.error('No schemas found for database', databaseId);
    process.exit(1);
  }

  // 4. Get a db-scoped admin token for the migrate endpoint
  console.log(`Signing in on db-scoped auth endpoint...`);
  let dbToken: string | undefined;
  try {
    const dbAuthEndpoint = process.env.DB_AUTH_ENDPOINT || `http://auth-${databaseName}.localhost:3000/graphql`;
    const authClient = auth.createClient({ endpoint: dbAuthEndpoint });
    const signInData = await authClient.mutation.signIn(
      { input: { email: adminEmail, password: adminPassword } },
      { select: { result: { select: { accessToken: true } } } }
    ).unwrap();
    dbToken = (signInData as Record<string, Record<string, Record<string, string>>>)
      ?.signIn?.result?.accessToken;
    if (dbToken) {
      console.log(`  ✓ Got db-scoped admin token`);
    } else {
      console.warn(`  ⚠ Sign-in returned no token — sql_actions may fail`);
    }
  } catch (err) {
    console.warn(`  ⚠ Could not sign in on db-scoped auth endpoint: ${err instanceof Error ? err.message : err}`);
    console.warn(`  Falling back to ACCESS_TOKEN for migrate endpoint`);
  }

  // ==========================================================================
  // 5. Fetch sql_actions via migrate-client (db_migrate endpoint)
  // ==========================================================================
  let sqlActionRows: Record<string, unknown>[] = [];

  if (migrateEndpoint) {
    console.log(`Fetching sql_actions from ${migrateEndpoint}...`);
    // The migrate endpoint uses subdomain routing (migrate-{dbName}.localhost) when
    // the migrate API is public (isPublic: true). The X-Api-Name header is included
    // as a fallback for environments where subdomain DNS doesn't resolve.
    //
    // AUTH: The migrate endpoint REQUIRES a db-scoped token. The platform-level
    // ACCESS_TOKEN (token var) is for the meta/services api (api.localhost) and
    // returns UNAUTHENTICATED on the tenant's migrate API. We MUST use dbToken.
    const migrateHeaders: Record<string, string> = {
      'X-Database-Id': databaseId,
      'X-Api-Name': 'migrate',
      ...(dbToken ? { Authorization: `Bearer ${dbToken}` } : token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const db = createClient({
      endpoint: migrateEndpoint,
      headers: migrateHeaders
    });

    try {
      // Fetch all sql_actions in a single request. Cursor-based pagination
      // requires a unique defined order, but the ddl_audit_public.sql_actions
      // view doesn't expose a primary key, so PostGraphile rejects cursors
      // for this view. Using a large first: N gets everything in one round-trip.
      const PAGE_SIZE = 10000;
      const result = await db.sqlAction.findMany({
        select: {
          id: true,
          databaseId: true,
          name: true,
          deploy: true,
          revert: true,
          verify: true,
          content: true,
          deps: true,
          action: true,
          actionId: true,
          actorId: true,
          payload: true
        },
        where: {
          databaseId: { equalTo: databaseId }
        },
        orderBy: ['ID_ASC'],
        first: PAGE_SIZE
      }).unwrap();

      const connection = result.sqlActions;
      for (const node of connection.nodes) {
        sqlActionRows.push(
          graphqlRowToPostgresRow(node as unknown as Record<string, unknown>)
        );
      }

      console.log(`  Found ${sqlActionRows.length} sql_actions`);
      if (connection.pageInfo?.hasNextPage) {
        console.warn(`  Warning: more than ${PAGE_SIZE} sql_actions exist; some may be truncated`);
      }
    } catch (err) {
      console.warn(`  Warning: Could not fetch sql_actions: ${err instanceof Error ? err.message : err}`);
    }
  } else {
    console.log('No migrate endpoint provided, skipping sql_actions export.');
  }

  // ==========================================================================
  // 6. Write database module (sql_actions)
  // ==========================================================================
  const schemasForReplacement = schemas.filter((s) => schema_names.includes(s.schema_name));
  const { replacer } = makeReplacer({ schemas: schemasForReplacement, name: extensionName });

  const opts: SqlWriteOptions = {
    name: extensionName,
    replacer,
    outdir,
    author
  };

  if (sqlActionRows.length > 0) {
    console.log(`Writing database module...`);
    prepareModuleDir(outdir, extensionName);
    writePgpmPlan(sqlActionRows as unknown as PgpmRow[], opts);
    writePgpmFiles(sqlActionRows as unknown as PgpmRow[], opts);
  } else {
    console.log('No sql_actions found. Skipping database module export.');
  }

  // ==========================================================================
  // 7. Fetch and write metadata/services module
  // ==========================================================================
  // Small delay between the migrate client's huge sql_actions response
  // (4070 rows) and the first API request. The previous response's
  // connection is still being closed on the server when the next request
  // arrives, which causes the server to ECONNRESET the new socket. A brief
  // pause gives the server time to fully drain the prior response.
  await new Promise((r) => setTimeout(r, 200));
  console.log(`Fetching metadata from ${metaEndpoint}...`);
  const metaClient = new GraphQLClient({ endpoint: metaEndpoint, token, headers });

  // Cap concurrency on the meta client. exportGraphQLMeta fires ~78 queries
  // in parallel via Promise.all, and @constructive-io/fetch's localhost
  // wrapper opens a fresh TCP socket per request (no Agent/keep-alive).
  // Throttling the client's query() method through a small semaphore avoids
  // bursts of fresh sockets that can trip ECONNRESET from the server or OS.
  const META_CONCURRENCY = 6;
  let inFlight = 0;
  const waiters: Array<() => void> = [];
  const acquire = () =>
    new Promise<void>((resolve) => {
      if (inFlight < META_CONCURRENCY) {
        inFlight++;
        resolve();
      } else {
        waiters.push(() => {
          inFlight++;
          resolve();
        });
      }
    });
  const release = () => {
    inFlight--;
    const next = waiters.shift();
    if (next) next();
  };
  const originalMetaQuery = metaClient.query.bind(metaClient);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (metaClient as any).query = async (...args: any[]) => {
    await acquire();
    try {
      return await originalMetaQuery(...(args as Parameters<typeof originalMetaQuery>));
    } finally {
      release();
    }
  };

  const metaResult = await exportGraphQLMeta({
    client: metaClient,
    database_id: databaseId
  });

  const metaTableCount = Object.keys(metaResult).length;
  console.log(`  Fetched ${metaTableCount} meta tables with data`);

  if (metaTableCount > 0) {
    console.log(`Writing metadata module...`);
    prepareModuleDir(outdir, metaExtensionName);

    const metaReplacer = makeReplacer({
      schemas: schemasForReplacement,
      name: metaExtensionName,
      schemaPrefix: extensionName
    });

    const metaPackage: PgpmRow[] = [];
    const tablesWithContent: string[] = [];

    for (const tableName of META_TABLE_ORDER) {
      const tableSql = metaResult[tableName];
      if (tableSql) {
        const replacedSql = metaReplacer.replacer(tableSql);

        const deps = tableName === 'database'
          ? []
          : tablesWithContent.length > 0
            ? [`migrate/${tablesWithContent[tablesWithContent.length - 1]}`]
            : [];

        metaPackage.push({
          deps,
          deploy: `migrate/${tableName}`,
          content: `${META_COMMON_HEADER}\n\n${replacedSql}\n\n${META_COMMON_FOOTER}\n`
        });

        tablesWithContent.push(tableName);
      }
    }

    opts.replacer = metaReplacer.replacer;
    opts.name = metaExtensionName;
    opts.outdir = outdir;

    writePgpmPlan(metaPackage, opts);
    writePgpmFiles(metaPackage, opts);
  }

  console.log(`\nGraphQL export complete!`);
  if (sqlActionRows.length > 0) {
    console.log(`  DB module:   ${path.join(outdir, extensionName)}`);
  }
  if (metaTableCount > 0) {
    console.log(`  Meta module: ${path.join(outdir, metaExtensionName)}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('GraphQL export failed:', err);
  process.exit(1);
});