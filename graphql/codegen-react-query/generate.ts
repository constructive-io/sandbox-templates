#!/usr/bin/env ts-node
/**
 * GraphQL Code Generation Script
 * 
 * Usage:
 *   pnpm run codegen
 * 
 */

import { generateCommand } from '@constructive-io/graphql-codegen';

async function main() {
  console.log('Starting GraphQL code generation...\n');

  const result = await generateCommand({
    config: './codegen.config.ts',
    verbose: true,
  });

  if (!result.success) {
    console.error('\n❌', result.message);
    if (result.errors?.length) {
      result.errors.forEach((e) => console.error('  -', e));
    }
    process.exit(1);
  }

  console.log('\n✓', result.message);
  console.log('\nGeneration complete!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
