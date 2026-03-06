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
