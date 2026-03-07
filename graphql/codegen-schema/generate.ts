#!/usr/bin/env ts-node
/**
 * Schema-Only Generation Script
 *
 * Fetches the GraphQL schema and saves it to disk without generating code.
 * Uses generate() with GenerateOptions directly (schemaOnly is not part of
 * the defineConfig type surface, but is accepted by generate()).
 *
 * Usage:
 *   pnpm run codegen
 */

import { generate } from '@constructive-io/graphql-codegen';
import type { GenerateOptions } from '@constructive-io/graphql-codegen';
import config from './codegen.config';

async function main() {
  console.log('Starting schema-only generation...\n');

  const options: GenerateOptions = {
    ...config,
    schemaOnly: true,
    schemaOnlyOutput: config.output || './schemas',
    schemaOnlyFilename: 'app-public.graphql',
  };

  const result = await generate(options);

  if (!result.success) {
    console.error('\n', result.message);
    if (result.errors?.length) {
      result.errors.forEach((e) => console.error('  -', e));
    }
    process.exit(1);
  }

  console.log('\n', result.message);
  console.log('\nSchema generation complete!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
