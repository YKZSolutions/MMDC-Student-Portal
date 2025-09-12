import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CreateMajorDto } from '@/generated/nestjs-dto/create-major.dto';
import { Type } from 'class-transformer';

export class CreateProgramMajorDto {
  @ApiProperty({ type: () => CreateMajorDto })
  @ValidateNested()
  @Type(() => CreateMajorDto)
  major: CreateMajorDto;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  programId: string;
}
