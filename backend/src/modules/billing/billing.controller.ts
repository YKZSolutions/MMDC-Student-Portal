import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { BillDto } from '@/generated/nestjs-dto/bill.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Role } from '@/common/enums/roles.enum';
import { Public } from '@/common/decorators/auth.decorator';
import { StatusBypass } from '@/common/decorators/user-status.decorator';
import { UpdateBillDto } from '@/generated/nestjs-dto/update-bill.dto';
import { FilterBillDto } from './dto/filter-bill.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * Create a new bill
   * @remarks Creates a new bill item and can optionally attach a user
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiException(() => InternalServerErrorException)
  create(@Body() createBillingDto: CreateBillingDto) {
    return this.billingService.create(
      createBillingDto.bill,
      createBillingDto.userId,
    );
  }

  /**
   * Fetch bills
   * @remarks
   * Fetch bills with the option to filter and sort them.
   * Returns a paginated response.
   */
  @Get()
  @Public()
  @StatusBypass()
  findAll(
    @Query(new ValidationPipe({ transform: true })) filters: FilterBillDto,
  ) {
    console.log(filters);
    return this.billingService.findAll(filters);
    // return 'Doggy';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillingDto: UpdateBillDto) {
    return this.billingService.update(id, updateBillingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billingService.remove(id);
  }
}
