import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { LmsService } from '@/modules/lms/lms.service';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { AuthUser } from '@/common/interfaces/auth.user-metadata';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { UpdateModuleDto } from '@/generated/nestjs-dto/update-module.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('modules')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  findAll(@CurrentUser() user: AuthUser, @Query() filters: BaseFilterDto) {
    return this.lmsService.findAll(user, filters);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  update(@Param('id', new ParseUUIDPipe()) id: string, dto: UpdateModuleDto) {
    return this.lmsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'Module deleted successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() query?: DeleteQueryDto,
  ) {
    return this.lmsService.remove(id, query?.directDelete);
  }
}
