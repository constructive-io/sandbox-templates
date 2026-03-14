/**
 * SDK Placeholder - Admin Context
 *
 * This file is a placeholder that allows the app to compile before running codegen.
 * After running `pnpm codegen`, this file will be replaced with the generated SDK.
 *
 * Admin SDK contains:
 * - Organizations, members, permissions
 * - Invites, grants, profiles
 * - App/Org settings and levels
 *
 * Usage:
 *   1. Set NEXT_PUBLIC_DB_NAME in .env.local
 *   2. Run: pnpm codegen
 *   3. This file will be replaced with generated code
 */

// Placeholder exports - will be replaced by codegen
export const __SDK_PLACEHOLDER__ = true;

// Re-export common types that might be imported
export type { DocumentNode } from 'graphql';

// Stubs for app-provider.tsx — codegen replaces these with real implementations
export type QueryResult = { data?: unknown; error?: unknown };
export function configure(_opts: { adapter: unknown }) {
	// no-op until codegen runs
}
