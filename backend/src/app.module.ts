import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { SupabaseService } from './lib/supabase/supabase.service';
import { EnvConfigModule } from './config/config.module';

@Module({
  imports: [EnvConfigModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
