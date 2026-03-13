'use client';

import { Book, Database, FileCode, Rocket, Terminal, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDbName } from '@/app-config';

/**
 * Getting Started - Build Guide for AI Agents
 * 
 * This page serves as the entry point for agents to understand
 * how to build features in this Constructive app.
 */
export default function GettingStartedPage() {
	let dbName = 'your-db';
	try {
		dbName = getDbName();
	} catch {
		// DB name not configured yet
	}

	return (
		<div className="h-full overflow-y-auto">
		<div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
			{/* Header */}
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-3">
					<Rocket className="h-8 w-8 text-primary" />
					Start Building Here
				</h1>
				<p className="text-muted-foreground">
					Build guide for AI agents • Database: <code className="text-primary font-semibold">{dbName}</code>
				</p>
			</div>

			{/* SDK Endpoints */}
			<Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Database className="h-5 w-5 text-primary" />
						SDK Endpoints
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 font-mono text-sm">
						<div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
							<span className="px-2 py-0.5 rounded bg-blue-500 text-white text-xs font-bold">admin</span>
							<div className="flex-1">
								<div className="text-blue-600 dark:text-blue-400">admin-{dbName}.localhost:3000</div>
								<div className="text-muted-foreground text-xs mt-1">Organizations, members, permissions, invites</div>
								<div className="text-xs mt-1">Import: <code className="text-blue-600">@sdk/admin</code></div>
							</div>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
							<span className="px-2 py-0.5 rounded bg-green-500 text-white text-xs font-bold">auth</span>
							<div className="flex-1">
								<div className="text-green-600 dark:text-green-400">auth-{dbName}.localhost:3000</div>
								<div className="text-muted-foreground text-xs mt-1">Users, emails, authentication</div>
								<div className="text-xs mt-1">Import: <code className="text-green-600">@sdk/auth</code></div>
							</div>
						</div>
						<div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
							<span className="px-2 py-0.5 rounded bg-purple-500 text-white text-xs font-bold">app</span>
							<div className="flex-1">
								<div className="text-purple-600 dark:text-purple-400">app-public-{dbName}.localhost:3000</div>
								<div className="text-muted-foreground text-xs mt-1">Your business data (boards, cards, etc.)</div>
								<div className="text-xs mt-1">Import: <code className="text-purple-600">@sdk/app</code></div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Build Flow */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Zap className="h-5 w-5 text-yellow-500" />
						Build Flow
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Step 1 */}
					<div className="relative pl-8 pb-4 border-l-2 border-orange-500/30">
						<div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">1</div>
						<div className="font-semibold text-orange-600 dark:text-orange-400">Define Tables</div>
						<div className="text-xs text-muted-foreground mb-2">packages/provision/src/index.ts</div>
						<pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto">
{`await sdk.createTable('boards', {
  columns: {
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
  },
  rls: 'DirectOwner',
});`}
						</pre>
					</div>

					{/* Step 2 */}
					<div className="relative pl-8 pb-4 border-l-2 border-cyan-500/30">
						<div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs font-bold">2</div>
						<div className="font-semibold text-cyan-600 dark:text-cyan-400">Deploy to Database</div>
						<pre className="text-xs bg-muted/50 p-3 rounded-lg mt-2">
{`cd packages/provision && pnpm provision`}
						</pre>
					</div>

					{/* Step 3 */}
					<div className="relative pl-8 pb-4 border-l-2 border-pink-500/30">
						<div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold">3</div>
						<div className="font-semibold text-pink-600 dark:text-pink-400">Generate SDK</div>
						<pre className="text-xs bg-muted/50 p-3 rounded-lg mt-2">
{`cd packages/app && pnpm codegen

# Output:
#   src/graphql/sdk/admin/  → 44 tables
#   src/graphql/sdk/auth/   → 6 tables
#   src/graphql/sdk/app/    → your tables`}
						</pre>
					</div>

					{/* Step 4 */}
					<div className="relative pl-8">
						<div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">4</div>
						<div className="font-semibold text-emerald-600 dark:text-emerald-400">Build UI</div>
						<div className="text-xs text-muted-foreground mb-2">src/app/boards/page.tsx</div>
						<pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-x-auto">
{`import { useBoardsQuery } from '@sdk/app';

export default function BoardsPage() {
  const { data } = useBoardsQuery({
    selection: { fields: { id: true, name: true } },
  });
  return <BoardsList boards={data?.boards?.nodes} />;
}`}
						</pre>
					</div>
				</CardContent>
			</Card>

			{/* Import Rules */}
			<Card className="border-amber-500/20">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg">
						<FileCode className="h-5 w-5 text-amber-500" />
						Import Rules
					</CardTitle>
					<CardDescription>Where to import each API from</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b">
									<th className="text-left py-2 font-medium">API</th>
									<th className="text-left py-2 font-medium">Import From</th>
								</tr>
							</thead>
							<tbody className="font-mono text-xs">
								<tr className="border-b border-dashed">
									<td className="py-2 text-green-600">useCurrentUserQuery, fetchUsersQuery</td>
									<td className="py-2"><code className="bg-green-500/10 px-2 py-0.5 rounded">@sdk/auth</code></td>
								</tr>
								<tr className="border-b border-dashed">
									<td className="py-2 text-green-600">useSignInMutation, useSetPasswordMutation</td>
									<td className="py-2"><code className="bg-green-500/10 px-2 py-0.5 rounded">@sdk/auth</code></td>
								</tr>
								<tr className="border-b border-dashed">
									<td className="py-2 text-green-600">useCreateUserMutation, useDeleteUserMutation</td>
									<td className="py-2"><code className="bg-green-500/10 px-2 py-0.5 rounded">@sdk/auth</code></td>
								</tr>
								<tr className="border-b border-dashed">
									<td className="py-2 text-blue-600">fetchOrgMembershipsQuery, useOrganizationsQuery</td>
									<td className="py-2"><code className="bg-blue-500/10 px-2 py-0.5 rounded">@sdk/admin</code></td>
								</tr>
								<tr className="border-b border-dashed">
									<td className="py-2 text-blue-600">useSubmitInviteCodeMutation</td>
									<td className="py-2"><code className="bg-blue-500/10 px-2 py-0.5 rounded">@sdk/admin</code></td>
								</tr>
								<tr>
									<td className="py-2 text-purple-600">useBoardsQuery, useCreateBoardMutation</td>
									<td className="py-2"><code className="bg-purple-500/10 px-2 py-0.5 rounded">@sdk/app</code></td>
								</tr>
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>

			{/* Quick Commands */}
			<Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Terminal className="h-5 w-5 text-emerald-500" />
						Quick Commands
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-2 font-mono text-sm">
						<div className="flex items-center gap-3 p-2 rounded bg-muted/50">
							<code className="text-emerald-600 flex-1">pnpm provision</code>
							<span className="text-muted-foreground text-xs">Deploy tables</span>
						</div>
						<div className="flex items-center gap-3 p-2 rounded bg-muted/50">
							<code className="text-emerald-600 flex-1">pnpm codegen</code>
							<span className="text-muted-foreground text-xs">Generate SDK</span>
						</div>
						<div className="flex items-center gap-3 p-2 rounded bg-muted/50">
							<code className="text-emerald-600 flex-1">pnpm dev</code>
							<span className="text-muted-foreground text-xs">Start dev server</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Key Files */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-lg">
						<Book className="h-5 w-5 text-indigo-500" />
						Key Files
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 font-mono text-xs">
						<div className="flex gap-2">
							<span className="text-indigo-500 min-w-[280px]">packages/provision/src/index.ts</span>
							<span className="text-muted-foreground">→ Define tables</span>
						</div>
						<div className="flex gap-2">
							<span className="text-indigo-500 min-w-[280px]">packages/app/graphql-codegen.config.ts</span>
							<span className="text-muted-foreground">→ SDK config</span>
						</div>
						<div className="flex gap-2">
							<span className="text-indigo-500 min-w-[280px]">packages/app/src/graphql/sdk/</span>
							<span className="text-muted-foreground">→ Generated SDK</span>
						</div>
						<div className="flex gap-2">
							<span className="text-indigo-500 min-w-[280px]">packages/app/src/lib/gql/hooks/</span>
							<span className="text-muted-foreground">→ Custom hooks</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Footer CTA */}
			<div className="text-center py-6 border-t">
				<p className="text-muted-foreground">
					Ready to build? Create your first table in{' '}
					<code className="text-primary">packages/provision/src/index.ts</code>
				</p>
			</div>
		</div>
		</div>
	);
}
