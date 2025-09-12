import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContentProgressUserIdModuleContentIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  moduleContentId: string;
}

@ApiExtraModels(ContentProgressUserIdModuleContentIdUniqueInputDto)
export class ConnectContentProgressDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: ContentProgressUserIdModuleContentIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContentProgressUserIdModuleContentIdUniqueInputDto)
  userId_moduleContentId?: ContentProgressUserIdModuleContentIdUniqueInputDto;
}
