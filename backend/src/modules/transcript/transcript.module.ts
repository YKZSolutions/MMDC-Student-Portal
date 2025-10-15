import { Module } from '@nestjs/common';
import { TranscriptService } from './transcript.service';
import { TranscriptController } from './transcript.controller';

@Module({
  controllers: [TranscriptController],
  providers: [TranscriptService],
})
export class TranscriptModule {}
