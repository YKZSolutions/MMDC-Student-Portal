import { ApiExtraModels, ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConnectUserDto,
  type ConnectUserDto as ConnectUserDtoAsType,
} from './connect-user.dto';

export class CreateUserAccountUserRelationInputDto {
  @ApiProperty({
    type: ConnectUserDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConnectUserDto)
  connect: ConnectUserDtoAsType;
}

@ApiExtraModels(ConnectUserDto, CreateUserAccountUserRelationInputDto)
export class CreateUserAccountDto {
  @ApiHideProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateUserAccountUserRelationInputDto)
  user: CreateUserAccountUserRelationInputDto;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  authUid: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string | null;
}
