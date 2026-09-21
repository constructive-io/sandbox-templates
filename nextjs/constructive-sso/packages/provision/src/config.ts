/**
 * config.ts — Centralized configuration for constructive-app provisioning
 *
 * Routing modes:
 *   Domain-based (cnc server, port 3000):
 *     auth.localhost:3000         → Auth API (sign up / sign in)
 *     api.localhost:3000          → Platform API (schema builder / metaschema)
 *     api-{dbName}.localhost:3000 → App API (your business data)
 *   Override via API_ENDPOINT / AUTH_ENDPOINT / APP_ENDPOINT env vars.
 */

import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load .env from project root — resolved from this module's location so it
// works regardless of the launching directory (src/ -> ... -> project root).
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(MODULE_DIR, '../../../.env') });

export const config = {
  /** Platform API endpoint — schema builder / metaschema */
  apiEndpoint: process.env.API_ENDPOINT || 'http://api.localhost:3000/graphql',

  /** Auth API endpoint — global metaschema sign up (used by create-db) */
  authEndpoint: process.env.AUTH_ENDPOINT || 'http://auth.localhost:3000/graphql',

  /** Database-scoped auth endpoint — issues tokens valid for this DB's endpoints */
  get dbAuthEndpoint(): string {
    return process.env.DB_AUTH_ENDPOINT || `http://auth-${this.databaseName}.localhost:3000/graphql`;
  },

  /** App API endpoint — your business data (per-database subdomain) */
  get appEndpoint(): string {
    return process.env.APP_ENDPOINT || `http://api-${this.databaseName}.localhost:3000/graphql`;
  },

  /** Admin API endpoint — CRUD for all entity types (per-database subdomain) */
  get adminEndpoint(): string {
    return process.env.ADMIN_ENDPOINT || `http://admin-${this.databaseName}.localhost:3000/graphql`;
  },

  /** Modules API endpoint — blueprint, constructBlueprint, databaseProvisionModule, etc. */
  modulesEndpoint: process.env.MODULES_ENDPOINT || 'http://modules.localhost:3000/graphql',

  /**
   * Physical database the SQL pools connect to — metaschema, platform schemas,
   * AND all tenant schemas live here (schema-based tenancy: `{tenant}_*`
   * schemas inside one physical DB). Do NOT fall back to PGDATABASE: pgpm env
   * sets that to 'postgres' (maintenance DB), which is wrong here.
   */
  pgInternalDatabase: process.env.PG_INTERNAL_DATABASE || 'constructive-functions-db1',

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
  }
};
