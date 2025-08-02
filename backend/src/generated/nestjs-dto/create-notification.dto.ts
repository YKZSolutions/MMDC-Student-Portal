import { ApiExtraModels, ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConnectUserDto,
  type ConnectUserDto as ConnectUserDtoAsType,
} from './connect-user.dto';

export class CreateNotificationUserRelationInputDto {
  @ApiProperty({
    type: ConnectUserDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConnectUserDto)
  connect: ConnectUserDtoAsType;
}

@ApiExtraModels(ConnectUserDto, CreateNotificationUserRelationInputDto)
export class CreateNotificationDto {
  @ApiHideProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateNotificationUserRelationInputDto)
  user: CreateNotificationUserRelationInputDto;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  title: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  isRead: string;
}
