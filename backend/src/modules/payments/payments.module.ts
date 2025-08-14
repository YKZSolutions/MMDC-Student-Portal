import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [HttpModule],
  exports: [PaymentsService],
})
export class PaymentsModule {}
