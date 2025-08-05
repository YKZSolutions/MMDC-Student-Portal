import { Public } from '@/common/decorators/auth.decorator';
import { StatusBypass } from '@/common/decorators/user-status.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { PaymongoService } from './paymongo.service';

@Controller('paymongo')
export class PaymongoController {
  private readonly logger = new Logger(PaymongoController.name);

  constructor(private readonly paymongoService: PaymongoService) {}

  @Post('create-ewallet-source')
  @Public()
  @StatusBypass()
  async createEwallet(
    @Body() body: { amount: number; type: 'gcash' | 'maya' },
  ) {
    try {
      const source = await this.paymongoService.createEwalletSource(
        body.amount,
        body.type,
      );
      return { checkoutUrl: source.data.attributes.redirect.checkout_url };
    } catch (err) {
      if (err instanceof AxiosError) {
        this.logger.debug(err.response);
        throw new BadRequestException(err.response?.data.errors);
      }
      throw new InternalServerErrorException('Failed to create source');
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
