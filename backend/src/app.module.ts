import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CustomPrismaModule } from 'nestjs-prisma';
import { AuthGuard } from './common/guards/auth.guard';
import { RoleGuard } from './common/guards/role.guard';
import { UserStatusGuard } from './common/guards/user-status.guard';
import { EnvConfigModule } from './config/config.module';
import { extendedPrismaClient } from './lib/prisma/prisma.extension';
import { SupabaseModule } from './lib/supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { PaymongoModule } from './modules/paymongo/paymongo.module';
import { TestModule } from './modules/test/test.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    EnvConfigModule,
    UsersModule,
    CoursesModule,
    // PrismaModule.forRoot({
    //   isGlobal: true,
    // }),
    CustomPrismaModule.forRootAsync({
      isGlobal: true,
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient;
      },
    }),
    SupabaseModule,
    TestModule,
    AuthModule,
    PaymongoModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserStatusGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
