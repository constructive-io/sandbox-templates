/**
 * config.ts — Centralized configuration for constructive-app provisioning
 *
 * Routing modes:
 *   Domain-based (cnc server, port 3000):
 *     auth.localhost:3000              → Auth API (sign up / sign in)
 *     api.localhost:3000               → Platform API (schema builder / metaschema)
 *     admin-{dbName}.localhost:3000    → Admin API (orgs, members, permissions)
 *     app-public-{dbName}.localhost:3000 → App API (invites, app-level data)
 *
 * Override via API_ENDPOINT / AUTH_ENDPOINT env vars.
 */

import dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root (cwd is packages/provision/ when run via pnpm)
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export const config = {
  /** Platform API endpoint — schema builder / metaschema */
  apiEndpoint: process.env.API_ENDPOINT || 'http://api.localhost:3000/graphql',

  /** Auth API endpoint — global metaschema sign up (used by create-db) */
  authEndpoint: process.env.AUTH_ENDPOINT || 'http://auth.localhost:3000/graphql',

  /** Database-scoped auth endpoint — issues tokens valid for this DB's endpoints */
  get dbAuthEndpoint(): string {
    return process.env.DB_AUTH_ENDPOINT || `http://auth-${this.databaseName}.localhost:3000/graphql`;
  },

  /** App API endpoint — app-level data (per-database subdomain) */
  get appEndpoint(): string {
    return process.env.APP_ENDPOINT || `http://app-public-${this.databaseName}.localhost:3000/graphql`;
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
