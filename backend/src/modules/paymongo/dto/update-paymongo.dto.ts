import { PartialType } from '@nestjs/swagger';
import { CreatePaymongoDto } from './create-paymongo.dto';

export class UpdatePaymongoDto extends PartialType(CreatePaymongoDto) {}
