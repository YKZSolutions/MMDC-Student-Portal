import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreatePricingDto } from '@/generated/nestjs-dto/create-pricing.dto';
import { UpdatePricingDto } from '@/generated/nestjs-dto/update-pricing.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  /**
   * Create a new pricing fee
   * @remarks This operation creates a new pricing entry in the database.
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  create(@Body() createPricingDto: CreatePricingDto) {
    return this.pricingService.create(createPricingDto);
  }

  /**
   * Fetch all pricings
   * @remarks This operation retrieves a paginated list of all pricing entries.
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiException(() => [InternalServerErrorException])
  findAll(@Query() filters: BaseFilterDto) {
    return this.pricingService.findAll(filters);
  }

  /**
   * Fetch a single pricing
   * @remarks This operation retrieves a single pricing entry by its id.
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  findOne(@Param('id') id: string) {
    return this.pricingService.findOne(id);
  }

  /**
   * Update a pricing entry
   * @remarks This operation updates the details of a single pricing fee by its ID.
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  update(@Param('id') id: string, @Body() updatePricingDto: UpdatePricingDto) {
    return this.pricingService.update(id, updatePricingDto);
  }

  /**
   * Delete a pricing (temporary or permanent)
   * @remarks
   * This endpoint performs either a **soft delete** or a **permanent deletion** of a pricing.
   * - If `directDelete` is true, the pricing is permanently deleted.
   * - If `directDelete` is not provided or false:
   * - If the pricing has not been soft-deleted yet, it will be soft-deleted by setting the `deletedAt` timestamp.
   * - If the pricing has already been soft-deleted, it will be permanently deleted.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(@Param('id') id: string, @Query() query?: DeleteQueryDto) {
    return this.pricingService.remove(id, query?.directDelete);
  }
}
