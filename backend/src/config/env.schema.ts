import z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  SUPABASE_ENV: z.enum(['cloud', 'local']).default('cloud'),

  SUPABASE_CLOUD_URL: z.url(),
  SUPABASE_LOCAL_URL: z.url().optional(),

  SUPABASE_CLOUD_ADMIN_KEY: z.string().min(1),
  SUPABASE_LOCAL_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  DATABASE_CLOUD_URL: z.url(),
  DATABASE_LOCAL_URL: z.url().optional(),

  DIRECT_CLOUD_URL: z.url(),
  DIRECT_LOCAL_URL: z.url().optional(),

  GEMINI_API_KEY: z.string().optional(),

  SITE_URL: z.url().default('http://localhost:3000'),

  PAYMONGO_SECRET_KEY: z.string().optional(),
  PAYMONGO_WEBHOOK_SECRET: z.string().optional(),

  N8N_VECTOR_SEARCH_URL: z.url().optional(),
  N8N_API_KEY: z.string().optional(),
  N8N_TIMEOUT_MS: z.coerce.number().default(30000),
});

export type EnvVars = z.infer<typeof envSchema>;
