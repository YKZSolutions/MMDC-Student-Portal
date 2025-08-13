import { Public } from '@/common/decorators/auth.decorator';
import { StatusBypass } from '@/common/decorators/user-status.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';
import { UpdateBillPaymentDto } from '@/generated/nestjs-dto/update-billPayment.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { AuthUser } from '@/common/interfaces/auth.user-metadata';

@Controller('billing/:billId/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('pay')
  pay(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.initiatePayment(createPaymentDto);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  findAll(
    @Param('billingId') billingId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const { role, user_id } = user.user_metadata;

    if (!role || !user_id)
      throw new NotFoundException('User metadata not found');

    return this.paymentsService.findAll(billingId, role, user_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const { role, user_id } = user.user_metadata;

    if (!role || !user_id)
      throw new NotFoundException('User metadata not found');

    return this.paymentsService.findOne(id, role, user_id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdateBillPaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
