import { PaginatedDto } from '@/common/dto/paginated.dto';
import { ProgramDto } from '@/generated/nestjs-dto/program.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Program } from '@prisma/client';

export class PaginatedProgramsDto extends PaginatedDto<Program> {
  @ApiProperty()
  programs: ProgramDto[];
}
