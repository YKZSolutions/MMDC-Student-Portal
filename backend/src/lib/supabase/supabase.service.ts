import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EnvVars } from '@/config/env.schema';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService<EnvVars>) {
    const isLocal = this.configService.get('SUPABASE_ENV') === 'local';

    const url = isLocal
      ? this.configService.get('SUPABASE_LOCAL_URL')
      : this.configService.get('SUPABASE_CLOUD_URL');

    const serviceRoleKey = isLocal
      ? this.configService.get('SUPABASE_LOCAL_SERVICE_ROLE_KEY')
      : this.configService.get('SUPABASE_CLOUD_ADMIN_KEY');

    this.supabase = createClient(url, serviceRoleKey);
  }

  get client() {
    return this.supabase;
  }

  get auth() {
    return this.supabase.auth;
  }

  get storage(): SupabaseClient['storage'] {
    return this.supabase.storage;
  }
}
