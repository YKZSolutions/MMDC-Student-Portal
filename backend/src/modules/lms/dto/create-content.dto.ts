import { CreateModuleContentDto } from '@/generated/nestjs-dto/create-moduleContent.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateContentDto extends CreateModuleContentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  @IsString()
  @IsOptional()
  title: string;
}
