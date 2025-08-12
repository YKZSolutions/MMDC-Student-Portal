import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import crypto from 'crypto';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly baseUrl = 'https://api.paymongo.com/v1';
  private readonly headers = {
    Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    'Content-Type': 'application/json',
  };
  private readonly webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

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

  webhook(body: any, signature: string) {
    try {
      // Verify signature if needed
      const isValid = this.verifySignature(
        body,
        signature,
        this.webhookSecret!,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid webhook signature');
      }

      const event = body.data;

      switch (event.attributes.type) {
        case 'payment.paid': {
          // Confirm payment success
          this.logger.debug('PAIDDDDD!!!!');
          break;
        }
        case 'payment.failed': {
          this.logger.debug('FAILED!');
          break;
        }
        default: {
          this.logger.debug('UNCAUGHT');
          break;
        }
      }

      return { received: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to handle webhook request',
      );
    }
  }
}
