/** config.ts — Endpoint and credential configuration */

import dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

export const config = {
  apiEndpoint: process.env.API_ENDPOINT || 'http://api.localhost:3000/graphql',
  authEndpoint: process.env.AUTH_ENDPOINT || 'http://auth.localhost:3000/graphql',
  modulesEndpoint: process.env.MODULES_ENDPOINT || 'http://modules.localhost:3000/graphql',

  get dbAuthEndpoint(): string {
    return process.env.DB_AUTH_ENDPOINT || `http://auth-${this.databaseName}.localhost:3000/graphql`;
  },
  get appEndpoint(): string {
    return process.env.APP_ENDPOINT || `http://api-${this.databaseName}.localhost:3000/graphql`;
  },
  get adminEndpoint(): string {
    return process.env.ADMIN_ENDPOINT || `http://admin-${this.databaseName}.localhost:3000/graphql`;
  },

  // NOT PGDATABASE which is 'postgres'
  pgInternalDatabase: process.env.PG_INTERNAL_DATABASE || 'constructive',
  databaseName: process.env.DATABASE_NAME || 'myapp',
  databaseId: process.env.DATABASE_ID,
  adminEmail: process.env.ADMIN_EMAIL || 'admin@myapp.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'Password123!',
  accessToken: process.env.ACCESS_TOKEN,

  get authHeaders(): Record<string, string> {
    return this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {};
  },
};
