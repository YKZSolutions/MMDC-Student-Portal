import { Module } from '@nestjs/common';
import { SwaggerController } from './swagger.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [SwaggerController],
  providers: [],
})
export class SwaggerModule {}
