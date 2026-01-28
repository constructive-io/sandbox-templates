import { defineConfig } from '@constructive-io/graphql-codegen';

export default defineConfig({
  endpoint: 'http://api.localhost:3000/graphql',
  output: './src/generated/',
<<<<<<< Updated upstream
  reactQuery: {
    enabled: true,
  },
=======
  reactQuery: true,
  verbose: true,
>>>>>>> Stashed changes
});
