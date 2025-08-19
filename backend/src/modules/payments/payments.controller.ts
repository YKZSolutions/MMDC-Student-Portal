import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { AuthUser } from '@/common/interfaces/auth.user-metadata';
import { UpdateBillPaymentDto } from '@/generated/nestjs-dto/update-billPayment.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentIntentResponseDto } from './dto/payment-intent.dto';
import { PaymentsService } from './payments.service';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';

@Controller('billing/:billId/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Initiate paymongo payment intent
   * @remarks Handles the payment intent and payment gateway redirect of paymongo
   */
  @Post('pay')
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  pay(
    @Param('billId') billId: string,
    @Body() initiatePaymentDto: InitiatePaymentDto,
    @CurrentUser() user: AuthUser,
  ): Promise<PaymentIntentResponseDto> {
    const { role, user_id } = user.user_metadata;

    if (!role || !user_id)
      throw new NotFoundException('User metadata not found');

    return this.paymentsService.initiatePayment(
      billId,
      initiatePaymentDto,
      user_id,
    );
  }

  /**
   * Create a new payment
   * @remarks Creates a new payment item
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiException(() => InternalServerErrorException)
  create(
    @Param('billId') billId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(billId, createPaymentDto);
  }

  /**
   * Fetch payments
   * @remarks
   * Fetch payments ordered by descending payment date
   * Contents of the returned list will depend on the user and their role.
   * Returns a paginated response.
   */
  @Get()
  @ApiException(() => NotFoundException)
  findAll(@Param('billId') billId: string, @CurrentUser() user: AuthUser) {
    const { role, user_id } = user.user_metadata;

    if (!role || !user_id)
      throw new NotFoundException('User metadata not found');

    return this.paymentsService.findAll(billId, role, user_id);
  }

  /**
   * Fetch a single payment
   * @remarks
   * If the user is not an admin, they are only limited to querying their own payments.
   */
  @Get(':id')
  @ApiException(() => NotFoundException)
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    const { role, user_id } = user.user_metadata;

    if (!role || !user_id)
      throw new NotFoundException('User metadata not found');

    return this.paymentsService.findOne(id, role, user_id);
  }

  /**
   * Update payment data
   * @remarks
   * Change the payment's details
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => InternalServerErrorException)
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdateBillPaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  /**
   * Deletes a payment (temporary or permanent)
   *
   * @remarks
   * This endpoint performs either a soft delete or a permanent deletion of a payment depending on the current state of the nill or the query parameter provided:
   *
   * - If `directDelete` is true, the payment is **permanently deleted** without checking if they are already softly deleted.
   * - If `directDelete` is not provided or false:
   *   - If the payment is not yet softly deleted (`deletedAt` is null), a **soft delete** is performed by setting the `deletedAt` timestamp.
   *   - If the payment is already softly deleted, a **permanent delete** is executed.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => InternalServerErrorException)
  remove(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true })) query?: DeleteQueryDto,
  ) {
    return this.paymentsService.remove(id, query?.directDelete);
  }
}
