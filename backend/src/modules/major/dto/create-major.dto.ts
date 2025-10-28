import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { CreateMajorDto } from '@/generated/nestjs-dto/create-major.dto';
import { Type } from 'class-transformer';

export class CreateProgramMajorDto {
  @ApiProperty({ type: () => CreateMajorDto, nullable: false, required: true })
  @ValidateNested()
  @IsDefined()
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
