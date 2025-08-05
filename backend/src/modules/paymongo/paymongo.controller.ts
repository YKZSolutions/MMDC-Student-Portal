import { Public } from '@/common/decorators/auth.decorator';
import { StatusBypass } from '@/common/decorators/user-status.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { CreateMethodPaymongoDto } from './dto/create-method-paymongo.dto';
import { PaymongoService } from './paymongo.service';

@Controller('paymongo')
export class PaymongoController {
  private readonly logger = new Logger(PaymongoController.name);
  private readonly webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  constructor(private readonly paymongoService: PaymongoService) {}

  @Post('create-method')
  @Public()
  @StatusBypass()
  async createMethod(@Body() body: CreateMethodPaymongoDto) {
    try {
      const method = await this.paymongoService.createMethod(body);
      return method;
    } catch (err) {
      if (err instanceof AxiosError) {
        this.logger.debug(err.response);
        throw new BadRequestException(err.response?.data.errors);
      }
      throw new InternalServerErrorException('Failed to create source');
    }
  }

  @Post('webhook')
  @Public() // Leave these two here as PayMongo needs these to access the endpoint
  @StatusBypass()
  async handleWebhook(
    @Body() body: any,
    @Headers('paymongo-signature') signature: string,
  ) {
    try {
      // Verify signature if needed
      const isValid = this.paymongoService.verifySignature(
        body,
        signature,
        this.webhookSecret!,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid webhook signature');
      }

      const event = body.data;

      switch (event.attributes.type) {
        case 'source.chargeable': {
          const source = event.attributes.data;
          const sourceId = source.id;
          const amount = source.attributes.amount;

          await this.paymongoService.createPaymentFromSource(
            source,
            sourceId,
            amount,
          );
          break;
        }
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

  // @Post()
  // create(@Body() createPaymongoDto: CreatePaymongoDto) {
  //   return this.paymongoService.create(createPaymongoDto);
  // }

  // @Get()
  // findAll() {
  //   return this.paymongoService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.paymongoService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePaymongoDto: UpdatePaymongoDto) {
  //   return this.paymongoService.update(+id, updatePaymongoDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.paymongoService.remove(+id);
  // }
}
