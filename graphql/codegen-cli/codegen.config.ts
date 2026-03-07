import { defineConfig } from '@constructive-io/graphql-codegen';

export default defineConfig({
  endpoint: 'http://app-public-APPNAME.localhost:3000/graphql',
  output: './src/generated',
  cli: { toolName: 'APPNAME' },
  nodeHttpAdapter: true,
  verbose: true,
});
