import { Injectable, Inject, Logger } from '@nestjs/common';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import * as crypto from 'crypto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  VectorSearchResult,
  VectorSearchService,
} from '@/modules/chatbot/vector-search.service';

@Injectable()
export class CachedVectorSearchService {
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'vector_search:';
  private readonly logger = new Logger(CachedVectorSearchService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly vectorSearch: VectorSearchService,
  ) {}

  private generateCacheKey(
    query: string,
    limit: number,
    threshold: number,
  ): string {
    const hash = crypto
      .createHash('md5')
      .update(`${query}:${limit}:${threshold}`)
      .digest('hex');
    return `${this.CACHE_PREFIX}${hash}`;
  }

  @Log({
    logArgsMessage: ({ query, limit, threshold }) =>
      `Cached vector search query="${query}" limit=${limit} threshold=${threshold}`,
    logSuccessMessage: (result) =>
      `Vector search completed, found ${result.length} results`,
    logErrorMessage: (err: Error, { query }) =>
      `Cached vector search failed for query="${query}" | Error=${err.message}`,
  })
  async search(
    @LogParam('query') query: string,
    @LogParam('limit') limit = 5,
    @LogParam('threshold') threshold = 0.7,
  ): Promise<VectorSearchResult[]> {
    const cacheKey = this.generateCacheKey(query, limit, threshold);

    const cached = await this.cacheManager.get<VectorSearchResult[]>(cacheKey);
    if (cached) return cached;

    const results = await this.vectorSearch.search([query], limit, threshold);
    await this.cacheManager.set(cacheKey, results, this.CACHE_TTL);

    return results;
  }

  @Log({
    logArgsMessage: ({ query }) =>
      `Cached context generation for query="${query}"`,
    logSuccessMessage: () => `Context generation completed`,
    logErrorMessage: (err: Error, { query }) =>
      `Cached context generation failed for query="${query}" | Error=${err.message}`,
  })
  async searchAndFormatContext(
    @LogParam('query') query: string,
    limit = 5,
    threshold = 0.7,
  ): Promise<string> {
    const cacheKey = `${this.generateCacheKey(query, limit, threshold)}:context`;

    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) return cached;

    const context = await this.vectorSearch.searchAndFormatContext(
      [query],
      limit,
      threshold,
    );
    await this.cacheManager.set(cacheKey, context, this.CACHE_TTL);

    return context;
  }

  @Log({
    logArgsMessage: ({ query }) => `Invalidating cache for query="${query}"`,
    logSuccessMessage: () => `Cache invalidated successfully`,
    logErrorMessage: (err: Error, { query }) =>
      `Failed to invalidate cache for query="${query}" | Error=${err.message}`,
  })
  async invalidateQuery(
    @LogParam('query') query: string,
    limit = 5,
    threshold = 0.6,
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(query, limit, threshold);
    await this.cacheManager.del(cacheKey);
    await this.cacheManager.del(`${cacheKey}:context`);
  }

  @Log({
    logArgsMessage: () => `Clearing all vector search cache`,
    logSuccessMessage: () => `All cache cleared successfully`,
    logErrorMessage: (err: Error) =>
      `Failed to clear cache | Error=${err.message}`,
  })
  async clearAll(): Promise<void> {
    const store = (this.cacheManager as unknown as { store: any }).store;
    if (typeof store.keys !== 'function') return;

    const keys: string[] = await store.keys();
    const vectorSearchKeys = keys.filter((key) =>
      key.startsWith(this.CACHE_PREFIX),
    );

    await Promise.all(
      vectorSearchKeys.map((key) => this.cacheManager.del(key)),
    );
  }

  @Log({
    logArgsMessage: ({ queries }) =>
      `Warming up cache with ${queries.length} queries`,
    logSuccessMessage: (result) =>
      `Cache warmed up: ${result.successCount} successful, ${result.failCount} failed`,
    logErrorMessage: (err: Error) =>
      `Failed to warm up cache | Error=${err.message}`,
  })
  async warmUpCache(
    @LogParam('queries') queries: string[],
    limit = 5,
    threshold = 0.6,
  ): Promise<{ successCount: number; failCount: number }> {
    let successCount = 0;
    let failCount = 0;

    await Promise.all(
      queries.map(async (query) => {
        try {
          await this.search(query, limit, threshold);
          successCount++;
        } catch (error: unknown) {
          if (error instanceof Error) {
            this.logger.error(
              'Failed to warm up cache for query',
              error.message,
            );
          }
          failCount++;
        }
      }),
    );

    return { successCount, failCount };
  }
}
