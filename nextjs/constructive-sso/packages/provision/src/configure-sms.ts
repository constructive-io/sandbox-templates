/**
 * configure-sms — the Twilio Verify settings the platform's `sms` function
 * reads per invocation (one image, per-tenant settings).
 *
 * The values go into the tenant's OWN internal stores: `b2b:storage` installs
 * internal_config_module and internal_secrets_module at `app` scope, and
 * `ctx.config` / `ctx.secrets` take the nearest store along the tenant's
 * frames, which is that one (constructive-db-secrets skill). They are written
 * through the tenant's own config API (config-<slug>), as the owner's tenant
 * session — the path upstream's hosted-tenant billing runbook uses for the
 * same stores (tenant-function-surface skill: "T's config API").
 *
 * The secret mutation is write-only: the value is encrypted by the store's
 * generated setter and never readable through the API afterwards.
 *
 * Twilio side (one-time, outside this script): the Verify Service needs
 * CustomCodeEnabled=true. The platform generates the digits and sends them as
 * `customCode`; without the flag Twilio sends its own code and every check
 * fails while the sends look green. POST /v2/Services/{sid} CustomCodeEnabled=true.
 *
 * Values from .env: SMS_PROVIDER, TWILIO_VERIFY_SERVICE_SID, TWILIO_ACCOUNT_SID,
 * TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET. Idempotent (set-over-set).
 */

import { required } from './env.js';
import { gql, tenantSession } from './realm.js';

const CONFIG = required('GRAPHQL_CONFIG_URL');

async function main(): Promise<void> {
  const owner = await tenantSession();
  const api = <T>(query: string, variables: Record<string, unknown>) => gql<T>(CONFIG, query, variables, owner.token);

  for (const name of ['SMS_PROVIDER', 'TWILIO_VERIFY_SERVICE_SID']) {
    const value = required(name);
    const found = await api<{ appInternalConfigs: { nodes: Array<{ id: string }> } }>(
      `query ($name: String!) {
        appInternalConfigs(where: { name: { equalTo: $name }, realm: { isNull: true } }) { nodes { id } }
      }`,
      { name }
    );
    const existing = found.appInternalConfigs.nodes[0];
    if (existing) {
      await api(
        `mutation ($id: UUID!, $value: String!) {
          updateAppInternalConfig(input: { id: $id, appInternalConfigPatch: { value: $value } }) { clientMutationId }
        }`,
        { id: existing.id, value }
      );
    } else {
      await api(
        `mutation ($name: String!, $value: String!) {
          createAppInternalConfig(input: { appInternalConfig: { name: $name, value: $value } }) { clientMutationId }
        }`,
        { name, value }
      );
    }
  }

  for (const name of ['TWILIO_ACCOUNT_SID', 'TWILIO_API_KEY_SID', 'TWILIO_API_KEY_SECRET']) {
    await api(
      `mutation ($name: String!, $value: String!) {
        appInternalSecretsSet(input: { secretName: $name, secretValue: $value }) { clientMutationId }
      }`,
      { name, value: required(name) }
    );
  }
  console.log(`sms: provider '${required('SMS_PROVIDER')}' — 2 configs + 3 secrets in the tenant's app-scope stores`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exit(1);
});
