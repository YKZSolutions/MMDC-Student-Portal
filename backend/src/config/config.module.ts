import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env.schema';
import z from 'zod';

export const validateEnv = (config: Record<string, unknown>) => {
  const logger = new Logger('ConfigValidation');

  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    logger.error('Environment Variables Error:', z.treeifyError(parsed.error));
    process.exit(1);
  }
  return parsed.data;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
  ],
})
export class EnvConfigModule {}
