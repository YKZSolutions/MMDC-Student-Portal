import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TranscriptService } from './transcript.service';
import { CreateTranscriptDto } from './dto/create-transcript.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';

@Controller('transcript')
export class TranscriptController {
  constructor(private readonly transcriptService: TranscriptService) {}

  @Post()
  create(@Body() createTranscriptDto: CreateTranscriptDto) {
    return this.transcriptService.create(createTranscriptDto);
  }

  @Get()
  findAll() {
    return this.transcriptService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transcriptService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTranscriptDto: UpdateTranscriptDto) {
    return this.transcriptService.update(+id, updateTranscriptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transcriptService.remove(+id);
  }
}
