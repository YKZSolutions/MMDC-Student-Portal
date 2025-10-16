import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { Role } from '@/common/enums/roles.enum';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  Query,
} from '@nestjs/common';
import { FilterTranscriptDto } from './dto/filter-transcript.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';
import { UpsertTranscriptDto } from './dto/upsert-transcript.dto';
import { TranscriptService } from './transcript.service';

@Controller('transcript')
export class TranscriptController {
  constructor(private readonly transcriptService: TranscriptService) {}

  /**
   * Upsert a transcript record
   * @remarks
   * Creates or updates a transcript record for a student in a specific course offering.
   * If a transcript for the given student and course offering already exists, it will be updated.
   * If not, a new transcript record will be created.
   * Requires `ADMIN` or `MENTOR` role.
   */
  @Put()
  @Roles(Role.ADMIN, Role.MENTOR)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  upsert(@Body() createTranscriptDto: UpsertTranscriptDto) {
    return this.transcriptService.upsertTranscript(createTranscriptDto);
  }

  /**
   * Fetch transcripts
   * @remarks
   * Fetch transcripts with the option to filter them.
   * Requires `ADMIN`, `MENTOR`, or `STUDENT` role.
   * Returns a list of transcripts.
   */
  @Get()
  @Roles(Role.ADMIN, Role.MENTOR, Role.STUDENT)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  findAll(
    @Query() filters: FilterTranscriptDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    return this.transcriptService.findAllTranscript(filters, user);
  }

  /**
   * Update a transcript record
   * @remarks
   * Updates the details of an existing transcript record identified by its ID.
   * Requires `ADMIN` or `MENTOR` role.
   */
  @Patch(':transcriptId')
  @Roles(Role.ADMIN, Role.MENTOR)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  update(
    @Param('transcriptId') transcriptId: string,
    @Body() updateTranscriptDto: UpdateTranscriptDto,
  ) {
    return this.transcriptService.updateTranscript(
      transcriptId,
      updateTranscriptDto,
    );
  }

  /**
   * Delete a transcript record
   * @remarks
   * Deletes a transcript record identified by its ID.
   * If `directDelete` query parameter is set to true, the record will be permanently deleted.
   * Otherwise, it may be soft-deleted based on the service implementation.
   * Requires `ADMIN` role.
   */
  @Delete(':transcriptId')
  @Roles(Role.ADMIN)
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(
    @Param('transcriptId', new ParseUUIDPipe()) transcriptId: string,
    @Query() query?: DeleteQueryDto,
  ) {
    return this.transcriptService.removeTranscript(
      transcriptId,
      query?.directDelete,
    );
  }
}
