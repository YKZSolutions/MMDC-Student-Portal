import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymongoService } from './paymongo.service';
import { CreatePaymongoDto } from './dto/create-paymongo.dto';
import { UpdatePaymongoDto } from './dto/update-paymongo.dto';

@Controller('paymongo')
export class PaymongoController {
  constructor(private readonly paymongoService: PaymongoService) {}

  @Post()
  create(@Body() createPaymongoDto: CreatePaymongoDto) {
    return this.paymongoService.create(createPaymongoDto);
  }

  @Get()
  findAll() {
    return this.paymongoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymongoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymongoDto: UpdatePaymongoDto) {
    return this.paymongoService.update(+id, updatePaymongoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymongoService.remove(+id);
  }
}
