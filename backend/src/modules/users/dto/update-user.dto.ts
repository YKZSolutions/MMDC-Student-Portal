import { PartialType } from '@nestjs/mapped-types';
import { CreateUserWithAccountDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserWithAccountDto) {}
