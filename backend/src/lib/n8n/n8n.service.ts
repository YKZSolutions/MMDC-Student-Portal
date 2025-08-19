import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from '@/config/env.schema';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, timeout } from 'rxjs';

export type VectorSearchResponse = {
  output: string;
};

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);
  private readonly webhookUrl: string;

  constructor(
    private readonly configService: ConfigService<EnvVars>,
    private readonly httpService: HttpService,
  ) {
    this.webhookUrl = this.configService.get('N8N_VECTOR_SEARCH_URL') as string;

    if (!this.webhookUrl) {
      throw new Error('N8N_VECTOR_SEARCH_URL is not configured');
    }
  }

  async searchVector(query: string): Promise<VectorSearchResponse> {
    const method = 'searchVector';
    this.logger.log(`[${method}] START`);
    this.logger.debug(`Query: ${query}`);

    const res = this.httpService
      .post<VectorSearchResponse>(
        this.webhookUrl,
        { question: query },
        {
          headers: {
            key: `${this.configService.get('N8N_API_KEY')}`,
          },
        },
      )
      .pipe(
        timeout(Number(this.configService.get('N8N_TIMEOUT_MS'))),
        catchError((err: AxiosError) => {
          throw new ServiceUnavailableException(
            'Vector search service unavailable',
            err,
          );
        }),
      );

    const { data } = await firstValueFrom(res);
    return data;
  }
}
