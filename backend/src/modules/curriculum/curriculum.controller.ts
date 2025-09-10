import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumWithCoursesDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumWithCourseDto } from './dto/update-curriculum.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';

@ApiBearerAuth()
@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}
  /**
   * Create a new curriculum
   * @remarks Creates a new curriculum with attached course plan
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  create(@Body() createCurriculumDto: CreateCurriculumWithCoursesDto) {
    return this.curriculumService.create(createCurriculumDto);
  }

  /**
   * Fetch curriculums
   * @remarks
   * Fetches all of the curriculums
   * Returns a list
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  findAll() {
    return this.curriculumService.findAll();
  }

  /**
   * Fetch a single curriculum
   * @remarks
   * Fetch the curriculum details and the courses attached to it.
   * Can find by id or find by code with a format of (programCode-majorCode)
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  findOne(@Param('id') id: string) {
    return this.curriculumService.findOne(id);
  }

  /**
   * Update curriculum
   * @remarks Updates an existing curriculum and course plan
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  update(
    @Param('id') id: string,
    @Body() updateCurriculumDto: UpdateCurriculumWithCourseDto,
  ) {
    return this.curriculumService.update(id, updateCurriculumDto);
  }

  /**
   * Deletes a curriculum (temporary or permanent)
   *
   * @remarks
   * This endpoint performs either a soft delete or a permanent deletion of a curriculum depending on the current state of the nill or the query parameter provided:
   *
   * - If `directDelete` is true, the curriculum is **permanently deleted** without checking if they are already softly deleted.
   * - If `directDelete` is not provided or false:
   *   - If the curriculum is not yet softly deleted (`deletedAt` is null), a **soft delete** is performed by setting the `deletedAt` timestamp.
   *   - If the curriculum is already softly deleted, a **permanent delete** is executed.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(@Param('id') id: string, @Query() query?: DeleteQueryDto) {
    return this.curriculumService.remove(id);
  }
}
