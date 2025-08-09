import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class DeleteQueryDto {
  /**
   * If set to true, will skip the soft delete process
   */
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  directDelete?: boolean;
}
