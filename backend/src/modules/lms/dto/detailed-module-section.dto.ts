import { ModuleSectionDto } from "@/generated/nestjs-dto/moduleSection.dto";
import { ApiProperty } from "@nestjs/swagger";

export class DetailedModuleSectionDto extends ModuleSectionDto {
  @ApiProperty({
    type: 'string',
  })
  prerequisiteSectionId?: string | null;
  @ApiProperty({
    type: 'string',
  })
  parentSectionId?: string | null;

}