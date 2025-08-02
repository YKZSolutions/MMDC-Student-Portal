import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: './src/integrations/api/api-spec.json',
  output: 'src/integrations/api/client',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-fetch',
    '@tanstack/react-query',
    'zod',
  ],
})
