import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export type VectorSearchResponse = {
  output: string;
};

@Injectable()
export class N8nService {
  private client: AxiosInstance;
  private readonly logger = new Logger(N8nService.name);

  constructor() {
    const baseURL = process.env.N8N_VECTOR_SEARCH_URL;
    if (!baseURL) {
      throw new Error('N8N_VECTOR_SEARCH_URL is not configured');
    }

    this.client = axios.create({
      baseURL,
      timeout: Number(process.env.N8N_TIMEOUT_MS || 30000), // 30 seconds
      // headers: process.env.N8N_API_KEY
      //   ? { Authorization: `Bearer ${process.env.N8N_API_KEY}` }
      //   : {},
    });

    this.logger.debug(`N8nService initialized with baseURL: ${baseURL}`);
  }

  async searchVector(query: string): Promise<VectorSearchResponse> {
    const method = 'searchVector';
    try {
      this.logger.log(`[${method}] START`);
      this.logger.debug(`Query: ${query}`);

      const res = await this.client.post('', { question: query });

      const data = res.data as VectorSearchResponse;
      const output = data?.output;

      if (!output) {
        this.logger.warn(
          `[${method}] Received empty output from vector search. Raw response: ${JSON.stringify(res.data)}`,
        );
      } else {
        this.logger.debug(
          `[${method}] SUCCESS. Output length: ${output.length}`,
        );
      }

      return { output };
    } catch (err) {
      throw new ServiceUnavailableException(
        'Vector search service unavailable',
      );
    }
  }
}
