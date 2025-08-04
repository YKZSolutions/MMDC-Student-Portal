import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '@/generated/nestjs-dto/create-user.dto';

export class UpdateUserDetailsDto extends PartialType(CreateUserDto) {}
