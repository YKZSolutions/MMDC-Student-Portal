import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { CurrentAuthUser } from '@/common/interfaces/auth.user-metadata';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
    return this.transcriptService.upsert(createTranscriptDto);
  }

  @Get()
  findAll(
    @Query() filters: FilterTranscriptDto,
    @CurrentUser() user: CurrentAuthUser,
  ) {
    return this.transcriptService.findAll(filters, user);
  }

  @Patch(':transcriptId')
  update(
    @Param('transcriptId') transcriptId: string,
    @Body() updateTranscriptDto: UpdateTranscriptDto,
  ) {
    return this.transcriptService.update(transcriptId, updateTranscriptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transcriptService.remove(+id);
  }
}
