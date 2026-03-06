/**
 * Provision configuration for a Constructive app.
 *
 * Agents fill this in from the app brief (build/app-brief.yaml).
 * The provision.ts script reads this config and executes all SDK calls.
 */

export interface ProvisionTable {
  name: string;
  nodeType: string;
  policyType: string;
  grantRoles: string[];
  grantPrivileges: [string, string][];
  compose?: { nodeType: string; nodeData?: Record<string, unknown> }[];
}

export interface ProvisionRelation {
  source: string;
  target: string;
  type: string;
  deleteAction?: string;
  junctionSecurity?: {
    policyType: string;
    grantRoles: string[];
    grantPrivileges: [string, string][];
  };
}

export interface ProvisionConfig {
  platformAuth: string;
  platformApi: string;
  database: {
    name: string;
    modules: string[];
    bootstrapUser: boolean;
  };
  auth: {
    email: string;
    password: string;
  };
  tables: ProvisionTable[];
  relations: ProvisionRelation[];
}

export function defineProvisionConfig(config: ProvisionConfig): ProvisionConfig {
  return config;
}

/**
 * Placeholder default export.
 * Agents replace this with a filled-in config from build/app-brief.yaml.
 * provision.ts imports this as the default export — removing it causes a runtime error.
 */
export default defineProvisionConfig({
  platformAuth: 'http://auth.localhost:3000/graphql',
  platformApi: 'http://api.localhost:3000/graphql',
  database: {
    name: 'REPLACE_ME',
    modules: ['all'],
    bootstrapUser: true,
  },
  auth: {
    email: 'admin@example.com',
    password: 'REPLACE_ME',
  },
  tables: [],
  relations: [],
});
