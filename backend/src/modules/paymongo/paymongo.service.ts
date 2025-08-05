import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { CreateMethodPaymongoDto } from './dto/create-method-paymongo.dto';

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

  async createMethod(info: CreateMethodPaymongoDto) {
    try {
      switch (info.type) {
        case 'gcash': {
          return this.createGcashMethod(info);
        }
        case 'paymaya': {
          return this.createPaymayaMethod(info);
        }
        default: {
          break;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async createGcashMethod(info: CreateMethodPaymongoDto) {
    try {
      const payload = {
        data: {
          attributes: {
            ...info,
            currency: 'PHP',
            redirect: {
              success: 'http://localhost:3000/payment/success',
              failed: 'http://localhost:3000/payment/failed',
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

  async createPaymayaMethod(info: CreateMethodPaymongoDto) {
    try {
      const payload = {
        data: {
          attributes: {
            ...info,
            currency: 'PHP',
            redirect: {
              success: 'http://localhost:3000/payment/success',
              failed: 'http://localhost:3000/payment/failed',
            },
          },
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/payment_methods`,
        payload,
        {
          headers: this.headers,
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to create method: ${error}`);

      throw error;
    }
  }

  async createPaymentFromSource(source: any, sourceId: string, amount: number) {
    try {
      const paymentType = source.attributes.type;
      const payload = {
        data: {
          attributes: {
            amount,
            currency: 'PHP',
            source: {
              id: sourceId,
              type: 'source',
            },
            description:
              paymentType == 'paymaya' ? 'Maya' : 'GCash' + ' Payment',
          },
        },
      };
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

  /**
   * Helper Functions
   */

  verifySignature(body: any, signatureHeader: string, secret: string): boolean {
    try {
      const parts = signatureHeader.split(',').reduce((acc: any, part) => {
        const [key, value] = part.split('=');
        acc[key] = value;
        return acc;
      }, {});

      const timestamp = parts['t'];
      const testSig = parts['te'];
      const liveSig = parts['li'];

      if (!timestamp || (!testSig && !liveSig)) {
        this.logger.error('Invalid PayMongo signature header format');
        return false;
      }

      const expectedSig = liveSig || testSig;

      // Use the original JSON string
      const rawJson = JSON.stringify(body);

      // Concatenate timestamp + "." + payload
      const signedPayload = `${timestamp}.${rawJson}`;

      // Compute the HMAC
      const computedSig = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSig, 'utf8'),
        Buffer.from(computedSig, 'utf8'),
      );
    } catch (err) {
      this.logger.error(`Error verifying signature: ${err.message}`);
      return false;
    }
  }
}
