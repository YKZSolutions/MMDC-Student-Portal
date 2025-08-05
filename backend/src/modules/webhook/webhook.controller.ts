import { Public } from '@/common/decorators/auth.decorator';
import { StatusBypass } from '@/common/decorators/user-status.decorator';
import {
  Body,
  Controller,
  Headers,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PaymongoService } from '../paymongo/paymongo.service';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  constructor(
    private readonly webhookService: WebhookService,
    private readonly paymongoService: PaymongoService,
  ) {}

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

  @Post('paymongo')
  @Public() // Leave these two here as PayMongo needs these to access the endpoint
  @StatusBypass()
  async handleWebhook(
    @Body() body: any,
    @Headers('paymongo-signature') signature: string,
  ) {
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

      if (event.attributes.type === 'source.chargeable') {
        const source = event.attributes.data;
        const sourceId = source.id;
        const amount = source.attributes.amount;

        await this.paymongoService.createPaymentFromSource(sourceId, amount);
      } else if (event.attributes.type === 'payment.paid') {
        // Confirm payment success
        this.logger.debug('PAIDDDDD!!!!');
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
