import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PricingGroupService } from './pricing-group.service';
import { CreatePricingGroupItemDto } from './dto/create-pricing-group.dto';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { UpdatePricingGroupItemDto } from './dto/update-pricing-group.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';

@Controller('pricing-group')
export class PricingGroupController {
  constructor(private readonly pricingGroupService: PricingGroupService) {}

  /**
   * Create a new pricing group
   * @remarks This operation creates a new pricing group and links it to existing pricing entries.
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiException(() => [InternalServerErrorException])
  create(@Body() createPricingDto: CreatePricingGroupItemDto) {
    return this.pricingGroupService.create(createPricingDto);
  }

  /**
   * Fetch all pricing groups
   * @remarks This operation retrieves a paginated list of all pricing groups.
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiException(() => [InternalServerErrorException])
  findAll(@Query() filters: BaseFilterDto) {
    return this.pricingGroupService.findAll(filters);
  }

  /**
   * Fetch a single pricing group
   * @remarks This operation retrieves a single pricing group by its ID, including its associated prices.
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  findOne(@Param('id') id: string) {
    return this.pricingGroupService.findOne(id);
  }

  /**
   * Update a pricing group
   * @remarks This operation updates an existing pricing group and its associated prices.
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  update(
    @Param('id') id: string,
    @Body() updatePricingDto: UpdatePricingGroupItemDto,
  ) {
    return this.pricingGroupService.update(id, updatePricingDto);
  }

  /**
   * Delete a pricing group (temporary or permanent)
   * @remarks This endpoint soft or permanently deletes a pricing group based on its `deletedAt` status or a query parameter.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(@Param('id') id: string, @Query() query?: DeleteQueryDto) {
    return this.pricingGroupService.remove(id, query?.directDelete);
  }
}
