import { MajorDto } from '@/generated/nestjs-dto/major.dto';

export class MajorItemDto extends MajorDto {
  programId: string;
}
