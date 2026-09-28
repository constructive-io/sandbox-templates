/**
 * Writes the tenant's verification policy (app_settings_auth.verification_policy).
 *
 * The policy is what switches a tenant from per-user opt-in 2FA to default-on:
 *   login   — every non-exempt account answers a security question
 *   step_up — sensitive (postured) actions demand an SMS code
 *   sign_up — registration collects phone + questions
 *   exemptions — the provisioned owner (app_memberships.is_owner)
 *
 * NULL (the column default) keeps the legacy per-user behavior; this script
 * is the deliberate switch. The UPDATE rides the owner-bootstrap setup window
 * (measured from owner bootstrap per #3765) exactly like configure-sms's
 * allow_sms_sign_in flip — run within six hours of claiming the tenant.
 */
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(MODULE_DIR, '../../../../.env') });

const env = process.env;
const DATABASE_ID = env.DATABASE_ID ?? '';
if (!DATABASE_ID) throw new Error('DATABASE_ID is required — run local:bringup first');

const PGHOST = env.PGHOST ?? 'localhost';
const PGPORT = env.PGPORT ?? '15432';
const PGDATABASE = env.PGDATABASE ?? 'constructive-functions-db1';
const psqlBase = ['-h', PGHOST, '-p', PGPORT, '-U', env.PGUSER ?? 'postgres', '-d', PGDATABASE];

const POLICY = {
  login: { require: { methods: ['security_questions'], mode: 'all_of' } },
  step_up: { default: { methods: ['sms_otp'] } },
  sign_up: { collect: ['phone', 'security_questions'] },
  exemptions: [{ kind: 'owner' }]
};

// The settings module's rls_settings row names the tenant's auth schema —
// same resolution configure-sso uses (never a literal: a scope prefixes its
// physical objects).
const schema = execFileSync(
  'psql',
  [...psqlBase, '-Atc',
    `SELECT s.schema_name FROM routing_public.rls_settings rs
       JOIN metaschema_public.schema s ON s.id = rs.authenticate_schema_id
      WHERE rs.database_id = '${DATABASE_ID}'::uuid`],
  { encoding: 'utf-8' }
).trim();

execFileSync(
  'psql',
  [...psqlBase, '-v', 'ON_ERROR_STOP=1', '-c',
    `UPDATE "${schema}".app_settings_auth SET verification_policy = '${JSON.stringify(POLICY)}'::jsonb`],
  { stdio: ['ignore', 'inherit', 'inherit'] }
);

console.log(
  `2fa: verification_policy written on ${schema}.app_settings_auth — ` +
    'login=security_questions, step_up=sms_otp, sign_up collects both, owner exempt'
);
