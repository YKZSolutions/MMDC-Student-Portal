import { Injectable } from '@nestjs/common';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { GeminiService } from '@/lib/gemini/gemini.service';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import { ContentEmbedding } from '@google/genai';

export interface VectorSearchResult {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  similarity: number;
}

@Injectable()
export class VectorSearchService {
  constructor(
    private readonly gemini: GeminiService,
    private readonly supabase: SupabaseService,
  ) {}

  /**
   * Search for relevant documents using vector similarity
   */
  @Log({
    logArgsMessage: ({ query, limit, threshold }) =>
      `Vector search query="${query}" limit=${limit} threshold=${threshold}`,
    logSuccessMessage: (result) =>
      `Vector search completed, found ${result.length} results`,
    logErrorMessage: (err, { query }) =>
      `Vector search failed for query="${query}" | Error=${err.message}`,
  })
  async search(
    @LogParam('query') query: string,
    @LogParam('limit') limit: number = 5,
    @LogParam('threshold') threshold: number = 0.7,
  ): Promise<VectorSearchResult[]> {
    // 1. Generate embedding for the query
    const queryEmbedding: ContentEmbedding[] =
      await this.gemini.generateEmbedding(query);

    const embeddingValues: number[] = queryEmbedding
      .filter(
        (contentEmbedding) =>
          contentEmbedding.values !== undefined &&
          contentEmbedding.values.length > 0,
      )
      .map((contentEmbedding) => contentEmbedding.values)
      .flat() as number[];

    if (embeddingValues.length === 0) {
      throw new Error('No embeddings generated');
    }

    // 2. Search for similar documents in Supabase
    return await this.supabase.searchSimilarDocuments(
      embeddingValues,
      limit,
      threshold,
    );
  }

  /**
   * Search and format result as a context string for the LLM
   */
  @Log({
    logArgsMessage: ({ query }) =>
      `Generate context from vector search for query="${query}"`,
    logSuccessMessage: (result) =>
      `Generated context with ${result.split('\n\n').length} documents`,
    logErrorMessage: (err, { query }) =>
      `Failed to generate context for query="${query}" | Error=${err.message}`,
  })
  async searchAndFormatContext(
    @LogParam('query') query: string[],
    limit: number = 5,
    threshold: number = 0.7,
  ): Promise<string> {
    const combinedQuery = query.join(' ');

    const results = await this.search(combinedQuery, limit, threshold);

    if (results.length === 0) {
      return 'No relevant information found in the knowledge base.';
    }

    // Format results as context
    const context = results
      .map((result, index) => {
        const metadata = result.metadata
          ? `\nMetadata: ${JSON.stringify(result.metadata)}`
          : '';
        return `[Document ${index + 1}] (Similarity: ${(result.similarity * 100).toFixed(1)}%)${metadata}\n${result.content}`;
      })
      .join('\n\n---\n\n');

    return `Retrieved Information:\n\n${context}`;
  }
}
