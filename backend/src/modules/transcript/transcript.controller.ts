import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { DeleteQueryDto } from '@/common/dto/delete-query.dto';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import {
  Body,
  Controller,
  Delete,
  Get,
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

  @Put()
  upsert(@Body() createTranscriptDto: UpsertTranscriptDto) {
    return this.transcriptService.upsertTranscript(createTranscriptDto);
  }

  @Get()
  findAll(
    @Query() filters: FilterTranscriptDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    return this.transcriptService.findAllTranscript(filters, user);
  }

  @Patch(':transcriptId')
  update(
    @Param('transcriptId') transcriptId: string,
    @Body() updateTranscriptDto: UpdateTranscriptDto,
  ) {
    return this.transcriptService.updateTranscript(
      transcriptId,
      updateTranscriptDto,
    );
  }

  @Delete(':transcriptId')
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
