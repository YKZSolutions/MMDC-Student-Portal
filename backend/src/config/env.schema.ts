import z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  SUPABASE_ENV: z.enum(['cloud', 'local']).default('cloud'),

  SUPABASE_CLOUD_URL: z.url(),
  SUPABASE_LOCAL_URL: z.url(),

  SUPABASE_CLOUD_ADMIN_KEY: z.string().min(1),
  SUPABASE_LOCAL_SERVICE_ROLE_KEY: z.string().min(1),

  DATABASE_CLOUD_URL: z.url(),
  DATABASE_LOCAL_URL: z.url(),

  DIRECT_CLOUD_URL: z.url(),
  DIRECT_LOCAL_URL: z.url(),

  GEMINI_API_KEY: z.string(),

  SITE_URL: z.url().default('http://localhost:3000'),

  PAYMONGO_SECRET_KEY: z.string(),
  PAYMONGO_WEBHOOK_SECRET: z.string(),
});

export type EnvVars = z.infer<typeof envSchema>;
