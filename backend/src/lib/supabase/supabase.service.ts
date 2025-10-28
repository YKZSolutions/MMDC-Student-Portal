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

  /**
   * Search for similar documents using vector similarity
   * @param embedding The query embedding vector
   * @param limit Maximum number of results to return
   * @param threshold Minimum similarity score (0-1)
   */
  async searchSimilarDocuments(
    embedding: number[],
    limit: number = 5,
    threshold: number = 0.7,
  ) {
    const { data, error } = await this.supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      throw new Error(`Supabase vector search failed: ${error.message}`);
    }

    return data;
  }
}
