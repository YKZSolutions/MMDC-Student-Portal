import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleSectionProgressUserIdModuleSectionIdUniqueInputDto {
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
  moduleSectionId: string;
}

@ApiExtraModels(ModuleSectionProgressUserIdModuleSectionIdUniqueInputDto)
export class ConnectModuleSectionProgressDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: ModuleSectionProgressUserIdModuleSectionIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleSectionProgressUserIdModuleSectionIdUniqueInputDto)
  userId_moduleSectionId?: ModuleSectionProgressUserIdModuleSectionIdUniqueInputDto;
}
