import { Module } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ProgramController } from './program.controller';
import { MajorService } from '../major/major.service';

@Module({
  controllers: [ProgramController],
  providers: [ProgramService, MajorService],
})
export class ProgramModule {}
