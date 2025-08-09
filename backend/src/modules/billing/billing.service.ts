import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(private readonly httpService: HttpService) {}

  private readonly baseUrl = 'https://api.paymongo.com/v1/payment_intents';
  private readonly headers = {
    Accept: 'application/json',
    Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    'Content-Type': 'application/json',
  };

  async create(createBillingDto: CreateBillingDto) {
    try {
      const payload = {
        data: {
          attributes: {
            amount: createBillingDto.amount,
            currency: 'PHP',
            payment_method_allowed: ['paymaya', 'gcash'],
            capture_type: 'automatic',
            description: createBillingDto.description || 'Payment intent',
            statement_descriptor: createBillingDto.statement || 'Statement',
            metadata: {
              billingId: createBillingDto.billingId,
            },
          },
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(this.baseUrl, payload, {
          headers: this.headers,
        }),
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) this.logger.error(error.response?.data);
      throw new InternalServerErrorException(error);
    }
  }

  findAll() {
    return `This action returns all billing`;
  }

  findOne(id: number) {
    return `This action returns a #${id} billing`;
  }

  update(id: number, updateBillingDto: UpdateBillingDto) {
    return `This action updates a #${id} billing`;
  }

  remove(id: number) {
    return `This action removes a #${id} billing`;
  }
}
