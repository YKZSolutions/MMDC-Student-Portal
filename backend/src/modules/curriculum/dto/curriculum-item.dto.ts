import { CurriculumDto } from '@/generated/nestjs-dto/curriculum.dto';
import { MajorDto } from '@/generated/nestjs-dto/major.dto';
import { ProgramDto } from '@/generated/nestjs-dto/program.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class CurriculumItemDto extends CurriculumDto {
  @ValidateNested({ each: true })
  @Type(() => ProgramDto)
  program: ProgramDto;

  @ValidateNested({ each: true })
  @Type(() => MajorDto)
  major: MajorDto;
}
