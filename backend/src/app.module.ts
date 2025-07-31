import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { EnvConfigModule } from './config/config.module';
import { CoursesModule } from './modules/courses/courses.module';
import { SupabaseModule } from './lib/supabase/supabase.module';
import { PrismaModule } from 'nestjs-prisma';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './common/guards/role.guard';
import { AuthGuard } from './common/guards/auth.guard';
import { TestModule } from './modules/test/test.module';

@Module({
  imports: [
    EnvConfigModule,
    UsersModule,
    CoursesModule,
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    TestModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
