import { CreateModuleSectionDto as AutoGenDto } from '@/generated/nestjs-dto/create-moduleSection.dto';
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateModuleSectionDto extends AutoGenDto {
  @ApiProperty({ type: 'string', required: false, nullable: true })
  @IsOptional()
  @IsString()
  parentSectionId?: string | null;

  @ApiProperty({ type: 'string', required: false, nullable: true })
  @IsOptional()
  @IsString()
  prerequisiteSectionId?: string | null;
}