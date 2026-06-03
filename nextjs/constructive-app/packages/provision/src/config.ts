/**
 * config.ts — Centralized configuration for constructive-app provisioning
 *
 * The Constructive hub is Host-routed (one cnc server on :3000, virtual hosts):
 *   auth.localhost:3000            → Global auth API (sign up / sign in for create-db)
 *   api.localhost:3000             → Metaschema READS (apis/schemas/tables/databases)
 *                                     + createApiSchema / createDatabase (schema-builder)
 *   modules.localhost:3000         → Provisioning MUTATIONS: createDatabaseProvisionModule,
 *                                     createBlueprint, constructBlueprint,
 *                                     createSecureTableProvision (the metaschema_modules API)
 *   auth-{dbName}.localhost:3000   → Per-tenant auth (tokens valid for this DB's endpoints)
 *   api-{dbName}.localhost:3000    → Per-tenant app DATA (the codegen `app` SDK host)
 *   admin-{dbName}.localhost:3000  → Per-tenant admin API (orgs, members, permissions)
 *
 * CRITICAL: the provisioning mutations live on `modules.localhost`, NOT `api.localhost`.
 * Pointing them at api.localhost fails with "Unknown type ...Input" because those
 * input types are only registered on the modules host. See helpers.createModulesClient.
 *
 * Override via API_ENDPOINT / PROVISION_MODULES_ENDPOINT / AUTH_ENDPOINT env vars.
 */

import dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root (cwd is packages/provision/ when run via pnpm)
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export const config = {
  /** Metaschema READ endpoint — apis/schemas/tables/databases + createApiSchema/createDatabase */
  apiEndpoint: process.env.API_ENDPOINT || 'http://api.localhost:3000/graphql',

  /**
   * Provisioning MUTATION endpoint — createDatabaseProvisionModule, createBlueprint,
   * constructBlueprint, createSecureTableProvision (the metaschema_modules API).
   * These types are ONLY on the modules host; routing them to apiEndpoint fails with
   * 'Unknown type ...Input'. PG_PROVISION_MODULES_ENDPOINT also accepted for parity
   * with the PG-prefixed env vars used elsewhere.
   */
  modulesEndpoint:
    process.env.PROVISION_MODULES_ENDPOINT ||
    process.env.PG_PROVISION_MODULES_ENDPOINT ||
    'http://modules.localhost:3000/graphql',

  /** Auth API endpoint — global metaschema sign up (used by create-db) */
  authEndpoint: process.env.AUTH_ENDPOINT || 'http://auth.localhost:3000/graphql',

  /** Database-scoped auth endpoint — issues tokens valid for this DB's endpoints */
  get dbAuthEndpoint(): string {
    return process.env.DB_AUTH_ENDPOINT || `http://auth-${this.databaseName}.localhost:3000/graphql`;
  },

  /** App DATA endpoint — per-tenant app business data (the `api-{dbName}` host codegen targets) */
  get appEndpoint(): string {
    return process.env.APP_ENDPOINT || `http://api-${this.databaseName}.localhost:3000/graphql`;
  },

  /** Admin API endpoint — CRUD for all entity types (per-database subdomain) */
  get adminEndpoint(): string {
    return process.env.ADMIN_ENDPOINT || `http://admin-${this.databaseName}.localhost:3000/graphql`;
  },

  /** Internal PostgreSQL database where all tenant schemas live (NOT PGDATABASE which is 'postgres') */
  pgInternalDatabase: process.env.PG_INTERNAL_DATABASE || 'constructive',

  /** Database name (set by create-db, read by provision) */
  databaseName: process.env.DATABASE_NAME || 'myapp',

  /** Database ID (set by create-db, read by provision scripts) */
  databaseId: process.env.DATABASE_ID,

  /** Admin email for sign up */
  adminEmail: process.env.ADMIN_EMAIL || 'admin@myapp.local',

  /** Admin password for sign up */
  adminPassword: process.env.ADMIN_PASSWORD || 'Password123!',

  /** Access token (set by create-db, read by provision scripts) */
  accessToken: process.env.ACCESS_TOKEN,

  /** Auth headers derived from access token */
  get authHeaders(): Record<string, string> {
    return this.accessToken
      ? { Authorization: `Bearer ${this.accessToken}` }
      : {};
  },
};
