import {
  Injectable,
  Logger
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaymongoService {
  private readonly logger = new Logger(PaymongoService.name);
  private readonly baseUrl = 'https://api.paymongo.com/v1';
  private readonly headers = {
    Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    'Content-Type': 'application/json',
  };

  // create(createPaymongoDto: CreatePaymongoDto) {
  //   return 'This action adds a new paymongo';
  // }

  // findAll() {
  //   return `This action returns all paymongo`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} paymongo`;
  // }

  // update(id: number, updatePaymongoDto: UpdatePaymongoDto) {
  //   return `This action updates a #${id} paymongo`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} paymongo`;
  // }

  async createEwalletSource(amount: number, type: 'gcash' | 'maya') {
    try {
      const payload = {
        data: {
          attributes: {
            amount,
            currency: 'PHP',
            type,
            redirect: {
              success: 'http://localhost:3000/success',
              failed: 'http://localhost:3000/failed',
            },
          },
        },
      };

      const response = await axios.post(`${this.baseUrl}/sources`, payload, {
        headers: this.headers,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create source: ${error}`);

      throw error;
    }
  }

  async createPaymentFromSource(sourceId: string, amount: number) {
    const payload = {
      data: {
        attributes: {
          amount,
          currency: 'PHP',
          source: {
            id: sourceId,
            type: 'source',
          },
          description: 'GCash/Maya Payment',
        },
      },
    };

    try {
      const response = await axios.post(`${this.baseUrl}/payments`, payload, {
        headers: this.headers,
      });

      this.logger.debug('Payment created:', response.data);
      return response.data;
    } catch (error) {
      this.logger.error(
        'Error creating payment:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
