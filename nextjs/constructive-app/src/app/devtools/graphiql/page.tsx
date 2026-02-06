'use client';

import { GraphiQLDevtool } from '@constructive-io/graphiql-devtool';
// GraphiQL base styles (required for editor functionality)
import '@graphiql/react/dist/style.css';
// Our theme overrides
import '@constructive-io/graphiql-devtool/styles.css';

const DEFAULT_QUERY = `# Welcome to GraphiQL Devtool
#
# GraphiQL is an in-browser tool for writing, validating, and
# testing GraphQL queries.
#
# Type queries into this side of the screen, and you will see intelligent
# typeaheads aware of the current GraphQL type schema and live syntax and
# validation errors highlighted within the text.
#
# GraphQL queries typically start with a "{" character. Lines that start
# with a # are ignored.
#
# Try the example query below:

query IntrospectionQuery {
  __schema {
    queryType {
      name
    }
    types {
      name
      kind
    }
  }
}
`;

export default function GraphiQLDevtoolPage() {
  // Use the schema builder endpoint for testing
  const endpoint = process.env.NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT || 'http://api.localhost:3000/graphql';

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b px-4 py-2">
        <h1 className="text-lg font-semibold">GraphiQL Devtool</h1>
        <p className="text-sm text-muted-foreground">
          Endpoint: <code className="rounded bg-muted px-1">{endpoint}</code>
        </p>
      </header>
      <main className="flex-1">
        <GraphiQLDevtool
          endpoint={endpoint}
          defaultQuery={DEFAULT_QUERY}
          height="100%"
        />
      </main>
    </div>
  );
}
