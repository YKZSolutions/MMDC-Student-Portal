import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';
import { TestBodyNestDto } from './test-nested.dto';

export class TestBodyDto {
  /**
   * The id shit
   */
  @IsNumber()
  id: number;

  @ValidateNested()
  @Type(() => TestBodyNestDto)
  nested: TestBodyNestDto;
}
