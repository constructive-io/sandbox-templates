/**
 * env — the settings every provisioning step reads, from one place.
 *
 * The boilerplate root's .env (gitignored) is loaded relative to this module,
 * not process.cwd(), so a step works from whichever directory launches it.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as dotenv from 'dotenv';

const MODULE_DIR = dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = resolve(MODULE_DIR, '../../..');
const ROOT_ENV_PATH = resolve(ROOT_DIR, '.env');
dotenv.config({ path: ROOT_ENV_PATH });

export const env = process.env;

export const required = (name: string): string => {
  const value = env[name];
  if (!value) throw new Error(`missing ${name} in the environment (see .env.example)`);
  return value;
};

/** The platform Postgres `fun up --alt-ports` forwards to :15432. */
export const pgConfig = {
  host: env.PGHOST ?? 'localhost',
  port: Number(env.PGPORT ?? 15432),
  database: env.PGDATABASE ?? 'constructive-functions-db1',
  user: env.PGUSER ?? 'postgres',
  password: env.PGPASSWORD ?? 'password'
};

/** Upsert KEY=VALUE lines into the root .env, creating it if absent. */
export const writeEnv = (values: Record<string, string>): void => {
  const lines = existsSync(ROOT_ENV_PATH) ? readFileSync(ROOT_ENV_PATH, 'utf8').split('\n') : [];
  for (const [key, value] of Object.entries(values)) {
    const index = lines.findIndex((line) => line.startsWith(`${key}=`));
    if (index >= 0) lines[index] = `${key}=${value}`;
    else lines.push(`${key}=${value}`);
  }
  writeFileSync(ROOT_ENV_PATH, lines.join('\n').replace(/\n*$/, '\n'));
};
