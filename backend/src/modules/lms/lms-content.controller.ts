import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { CreateModuleContentDto } from '@/generated/nestjs-dto/create-moduleContent.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { UpdateContentDto } from '@/modules/lms/dto/update-content.dto';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { AuthUser } from '@supabase/supabase-js';

@Controller('lms/:lmsId/contents/') //TODO: configure pathing
export class LmsContentController {
  constructor(private readonly lmsContentService: LmsContentService) {}

  /**
   * Creates a module content
   *
   * @remarks This operation creates a new module content.
   * Requires `ADMIN` role.
   *
   */
  @ApiCreatedResponse({ type: ModuleContentDto })
  @ApiException(() => [ConflictException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Post()
  create(
    @Body() createModuleContentDto: CreateModuleContentDto,
    @Param('lmsId') lmsId: string,
    @Param('sectionId') moduleSectionId: string,
  ) {
    return this.lmsContentService.create(
      createModuleContentDto,
      lmsId,
      moduleSectionId,
    );
  }

  // /**
  //  * Retrieve all module contents
  //  *
  //  * @remarks Retrieves a paginated list of module contents based on the provided filters.
  //  * Requires `ADMIN` or `MENTOR` role.
  //  */
  // @ApiException(() => [BadRequestException, InternalServerErrorException])
  // @Roles(Role.ADMIN, Role.MENTOR)
  // @Get('/contents')
  // findAll(@Query() filters: BaseFilterDto & { moduleSectionId?: string }) {
  //   return this.lmsContentService.findAll(filters);
  // }

  /**
   * Retrieve a specific module content by ID
   *
   * @remarks Requires `ADMIN` or `MENTOR` role.
   *
   */
  @ApiOkResponse({ type: ModuleContentDto })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.lmsContentService.findOne(id, user.role, userId: user.id);
  }

  /**
   * Update a module content
   *
   * @remarks
   * This operation updates the details of an existing module content.
   * Requires `ADMIN` role.
   */
  @ApiOkResponse({ type: ModuleContentDto })
  @ApiException(() => [
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
  ])
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContentDto: UpdateContentDto) {
    return this.lmsContentService.update(id, updateContentDto);
  }

  /**
   * Delete a module content
   *
   * @remarks
   * This operation deletes a module content from the system.
   * Requires `ADMIN` role.
   */
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          examples: [
            'Module content marked for deletion',
            'Module content permanently deleted',
          ],
        },
      },
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Query() query?: DeleteQueryDto) {
    return this.lmsContentService.remove(id, query?.directDelete);
  }
}
