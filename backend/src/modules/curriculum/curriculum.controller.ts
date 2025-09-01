import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumWithCoursesDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumWithCourseDto } from './dto/update-curriculum.dto';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';

@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Post()
  create(@Body() createCurriculumDto: CreateCurriculumWithCoursesDto) {
    return this.curriculumService.create(createCurriculumDto);
  }

  @Get()
  findAll() {
    return this.curriculumService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.curriculumService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCurriculumDto: UpdateCurriculumWithCourseDto,
  ) {
    return this.curriculumService.update(id, updateCurriculumDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query() query?: DeleteQueryDto) {
    return this.curriculumService.remove(id);
  }
}
