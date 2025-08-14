import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CreateMajorDto as GeneratedCreateMajorDto } from '@/generated/nestjs-dto/create-major.dto';
import { Type } from 'class-transformer';

export class CreateMajorDto {
  @ApiProperty({
    type: GeneratedCreateMajorDto,
  })
  @ValidateNested()
  @Type(() => GeneratedCreateMajorDto)
  major: GeneratedCreateMajorDto;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  programId: string;
}
