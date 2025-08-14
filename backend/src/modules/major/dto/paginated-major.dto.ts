import { PaginatedDto } from '@/common/dto/paginated.dto';
import { MajorDto } from '@/generated/nestjs-dto/major.dto';
import { Major } from '@/generated/nestjs-dto/major.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedMajorsDto extends PaginatedDto<Major> {
  @ApiProperty()
  majors: MajorDto[];
}
