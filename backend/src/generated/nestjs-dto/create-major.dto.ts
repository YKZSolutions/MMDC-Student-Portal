import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMajorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  programId: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
