import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { UpdateBillDto } from '@/generated/nestjs-dto/update-bill.dto';
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
  Query
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { FilterBillDto } from './dto/filter-bill.dto';

@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * Create a new bill
   * @remarks Creates a new bill item and can optionally attach a user
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  create(@Body() createBillingDto: CreateBillingDto) {
    return this.billingService.create(
      createBillingDto.bill,
      createBillingDto.dueDates,
      createBillingDto.userId,
    );
  }

  /**
   * Fetch bills
   * @remarks
   * Fetch bills with the option to filter and sort them.
   * Contents of the returned list will depend on the user and their role.
   * Returns a paginated response.
   */
  @Get()
  @ApiException(() => NotFoundException)
  findAll(
    @Query() filters: FilterBillDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    const { role, user_id } = user.user_metadata;

    return this.billingService.findAll(filters, role, user_id);
  }

  /**
   * Fetch a single bill
   * @remarks
   * If the user is not an admin, they are only limited to querying their own bills.
   */
  @Get(':id')
  @ApiException(() => NotFoundException)
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentAuthUser) {
    const { role, user_id } = user.user_metadata;

    return this.billingService.findOne(id, role, user_id);
  }

  /**
   * Update bill data
   * @remarks
   * Change the bill's details
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  update(@Param('id') id: string, @Body() updateBillingDto: UpdateBillDto) {
    return this.billingService.update(id, updateBillingDto);
  }

  /**
   * Deletes a bill (temporary or permanent)
   *
   * @remarks
   * This endpoint performs either a soft delete or a permanent deletion of a bill depending on the current state of the nill or the query parameter provided:
   *
   * - If `directDelete` is true, the bill is **permanently deleted** without checking if they are already softly deleted.
   * - If `directDelete` is not provided or false:
   *   - If the bill is not yet softly deleted (`deletedAt` is null), a **soft delete** is performed by setting the `deletedAt` timestamp.
   *   - If the bill is already softly deleted, a **permanent delete** is executed.
   */
  @Delete(':id')
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(@Param('id') id: string, @Query() query?: DeleteQueryDto) {
    return this.billingService.remove(id, query?.directDelete);
  }
}
