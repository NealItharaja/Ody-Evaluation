import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: '../../services/backend/openapi.json',
    output: {
      target: './src/generated/api.ts',
      client: 'react-query',
      httpClient: 'fetch',
      mode: 'tags-split',
      clean: true,
      prettier: false,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: './src/mutator.ts',
          name: 'apiFetch',
        },
      },
    },
  },
});
