import { IsString } from 'class-validator';

export class TestBodyNestDto {
  @IsString()
  name: string;
}
