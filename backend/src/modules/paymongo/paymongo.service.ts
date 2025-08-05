import { Injectable } from '@nestjs/common';
import { CreatePaymongoDto } from './dto/create-paymongo.dto';
import { UpdatePaymongoDto } from './dto/update-paymongo.dto';

@Injectable()
export class PaymongoService {
  create(createPaymongoDto: CreatePaymongoDto) {
    return 'This action adds a new paymongo';
  }

  findAll() {
    return `This action returns all paymongo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paymongo`;
  }

  update(id: number, updatePaymongoDto: UpdatePaymongoDto) {
    return `This action updates a #${id} paymongo`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymongo`;
  }
}
