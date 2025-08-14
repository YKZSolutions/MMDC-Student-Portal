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

  /**
   * Starts a payment intent from PayMongo which redirects to their payment gateway.
   *
   * @param createPaymentDto - The DTO containing payment data (amount, payment date, etc.)
   * @param userId - The ID of the user the payment is associated with. This will be included in the payload metadata
   */
  async initiatePayment(
    billId: string,
    createPaymentDto: CreatePaymentDto,
    userId: string,
  ) {
    try {
      const payload = {
        data: {
          attributes: {
            amount: createPaymentDto.payment.amountPaid,
            currency: 'PHP',
            payment_method_allowed: ['paymaya', 'gcash'],
            capture_type: 'automatic',
            description: createPaymentDto.description || 'Payment intent',
            statement_descriptor:
              createPaymentDto.statementDescriptor || 'Statement',
            metadata: {
              userId: userId,
              billingId: billId,
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

  /**
   * Creates a new payment entry in the database.
   *
   * @param createPaymentDto - The DTO containing payment data (amount, payment date, etc.)
   * @returns Data of the created payment entry
   */
  async create(
    billId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<BillPaymentDto> {
    try {
      const payment = await this.prisma.client.billPayment.create({
        data: {
          ...createPaymentDto.payment,
          billId: billId,
        },
      });

      return payment;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Error creating the payment');
    }
  }

  /**
   * Retrieves a list of payment entries from the database.
   * The data returned will depend on the user's role.
   *
   * @param billId - An ID reference of the bill to be paid
   * @param role - The user's role
   * @param userId - The user's ID
   * @returns An paginated list of all payments.
   */
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

  /**
   * Retrieves a single payment entry by ID.
   * If the user's role is not an admin, they can only retrieve their own bill.
   *
   * @param id - The ID of the payment to retrieve.
   * @param role - The user's role
   * @param userId - The user's id
   * @returns The payment object if found.
   * @throws NotFoundException - If there are no payment with the specified id
   */
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

  /**
   * Updates a payment entry by ID.
   *
   * @param id - The ID of the payment to update.
   * @param updatePaymentDto - The DTO with updated payment data.
   * @returns The updated payment object.
   */
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

  /**
   * Deletes a payment (temporary o permanent)
   *
   * - If `directDelete` is true, the payment is permanently deleted without checking `deletedAt`.
   * - If `directDelete` is false or undefined:
   *   - If `deletedAt` is null, it sets the current date to softly delete the payment.
   *   - If `deletedAt` is already set, the payment is permanently deleted.
   *
   * @param id - The ID of the payment to delete.
   * @param directDelete - Whether to skip soft delete and directly remove the payment.
   * @returns A message indicating the result.
   */
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

  /**
   * Checks whether the endpoint response came from paymongo
   *
   * @param body
   * @param signatureHeader
   * @returns If the signature is valid or not
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
