import { Prisma, SubmissionState } from '@prisma/client';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateSubmissionAttachmentDto,
  type CreateSubmissionAttachmentDto as CreateSubmissionAttachmentDtoAsType,
} from './create-submissionAttachment.dto';

export class UpdateAssignmentSubmissionAttachmentsRelationInputDto {
  @ApiProperty({
    type: CreateSubmissionAttachmentDto,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubmissionAttachmentDto)
  create: CreateSubmissionAttachmentDtoAsType[];
}

@ApiExtraModels(
  CreateSubmissionAttachmentDto,
  UpdateAssignmentSubmissionAttachmentsRelationInputDto,
)
export class UpdateAssignmentSubmissionDto {
  @ApiProperty({
    type: () => Object,
    required: false,
    nullable: true,
  })
  @IsOptional()
  groupSnapshot?: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput;
  @ApiProperty({
    enum: SubmissionState,
    enumName: 'SubmissionState',
    required: false,
  })
  @IsOptional()
  @IsEnum(SubmissionState)
  state?: SubmissionState;
  @ApiProperty({
    type: () => Object,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  content?: Prisma.InputJsonValue[];
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  submittedAt?: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  lateDays?: number | null;
  @ApiProperty({
    required: false,
    type: UpdateAssignmentSubmissionAttachmentsRelationInputDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateAssignmentSubmissionAttachmentsRelationInputDto)
  attachments?: UpdateAssignmentSubmissionAttachmentsRelationInputDto;
}
