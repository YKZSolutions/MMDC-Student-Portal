import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { InstallmentService } from './installment.service';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

@Controller('billing/:billId/installments')
export class InstallmentController {
  constructor(private readonly installmentService: InstallmentService) {}

  /**
   * Fetch installments
   * @remarks
   * Fetch installments ordered by descending createdAt date
   * Contents of the returned list will depend on the user and their role.
   * Returns a paginated response.
   */
  @Get()
  @ApiException(() => NotFoundException)
  findAll(
    @Param('billId') billId: string,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { role, user_id } = user.user_metadata;
    return this.installmentService.findAll(billId, role, user_id);
  }

  /**
   * Fetch a single installment
   * @remarks
   * If the user is not an admin, they are only limited to querying their own installments.
   */
  @Get(':id')
  @ApiException(() => NotFoundException)
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentAuthUser) {
    const { role, user_id } = user.user_metadata;
    return this.installmentService.findOne(id, role, user_id);
  }
}
