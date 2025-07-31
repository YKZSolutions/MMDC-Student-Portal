import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { UserCredentialsDto } from './user-credentials.dto';
import { CreateUserDto } from '@/generated/nestjs-dto/create-user.dto';

export class CreateUserWithAccountDto extends CreateUserDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UserCredentialsDto)
  credentials?: UserCredentialsDto;
}
