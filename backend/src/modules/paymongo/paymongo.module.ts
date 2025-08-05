import { Module } from '@nestjs/common';
import { PaymongoService } from './paymongo.service';
import { PaymongoController } from './paymongo.controller';

@Module({
  controllers: [PaymongoController],
  providers: [PaymongoService],
})
export class PaymongoModule {}
