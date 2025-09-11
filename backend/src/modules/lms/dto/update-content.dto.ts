import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';

export class UpdateContentDto extends UpdateModuleContentDto {
  sectionId: string;
}
