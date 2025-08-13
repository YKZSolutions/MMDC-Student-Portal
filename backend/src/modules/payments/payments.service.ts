import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import crypto from 'crypto';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { BillPaymentDto } from '@/generated/nestjs-dto/billPayment.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { Prisma, Role } from '@prisma/client';
import { UpdateBillPaymentDto } from '@/generated/nestjs-dto/update-billPayment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly baseUrl = 'https://api.paymongo.com/v1';
  private readonly headers = {
    Authorization: `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY + ':').toString('base64')}`,
    'Content-Type': 'application/json',
  };

  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private readonly httpService: HttpService,
  ) {}

  async initiatePayment(createBillingDto: CreatePaymentDto) {
    try {
      const payload = {
        data: {
          attributes: {
            amount: createBillingDto.payment.amountPaid,
            currency: 'PHP',
            payment_method_allowed: ['paymaya', 'gcash'],
            capture_type: 'automatic',
            description: createBillingDto.description || 'Payment intent',
            statement_descriptor:
              createBillingDto.statementDescriptor || 'Statement',
            metadata: {
              billingId: createBillingDto.billId,
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

  async create(createPaymentDto: CreatePaymentDto): Promise<BillPaymentDto> {
    try {
      const payment = await this.prisma.client.billPayment.create({
        data: {
          ...createPaymentDto.payment,
          billId: createPaymentDto.billId,
        },
      });

      return payment;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Error creating the payment');
    }
  }

  async findAll(
    billId: string,
    role: Role,
    userId: string,
  ): Promise<BillPaymentDto[]> {
    try {
      const payment = await this.prisma.client.billPayment.findMany({
        where: {
          billId,
          ...(role !== 'admin' && {
            bill: {
              userId,
            },
          }),
        },
        orderBy: {
          paymentDate: 'desc',
        },
      });
      return payment;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Error creating the payment');
    }
  }

  async findOne(
    id: string,
    role: Role,
    userId: string,
  ): Promise<BillPaymentDto> {
    try {
      const payment = await this.prisma.client.billPayment.findFirstOrThrow({
        where: {
          id,
          ...(role !== 'admin' && {
            bill: {
              userId,
            },
          }),
        },
      });

      return payment;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) throw err;
      throw new InternalServerErrorException('Error creating the payment');
    }
  }

  async update(
    id: string,
    updatePaymentDto: UpdateBillPaymentDto,
  ): Promise<BillPaymentDto> {
    try {
      const payment = await this.prisma.client.billPayment.update({
        where: { id },
        data: updatePaymentDto,
      });

      return payment;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) throw err;
      throw new InternalServerErrorException('Error creating the payment');
    }
  }

  async remove(
    id: string,
    directDelete?: boolean,
  ): Promise<{ message: string }> {
    try {
      if (!directDelete) {
        const payment = await this.prisma.client.billPayment.findFirstOrThrow({
          where: { id: id },
        });
        if (!payment.deletedAt) {
          await this.prisma.client.billPayment.update({
            where: { id: id },
            data: {
              deletedAt: new Date(),
            },
          });

          return {
            message: 'Payment has been soft deleted',
          };
        }
      }

      await this.prisma.client.billPayment.delete({
        where: { id: id },
      });

      return {
        message: 'Payment has been permanently deleted',
      };
    } catch (err) {
      this.logger.error(err);
      if (err instanceof Prisma.PrismaClientKnownRequestError) throw err;

      if (err instanceof HttpException) throw err;

      throw new InternalServerErrorException('Error deleting the payment');
    }
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
}
