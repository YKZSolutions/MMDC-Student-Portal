import { CreateCourseSectionDto } from '@/generated/nestjs-dto/create-courseSection.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class CreateCourseSectionFullDto extends OmitType(
  CreateCourseSectionDto,
  ['startSched', 'endSched'],
) {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startSched must be in HH:mm format',
  })
  startSched: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endSched must be in HH:mm format',
  })
  endSched: string;

  @IsNotEmpty()
  @IsUUID()
  mentorId: string;
}
