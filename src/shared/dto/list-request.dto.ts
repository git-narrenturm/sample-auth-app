import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListRequestDto<T> {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 1;

  @IsOptional()
  orderBy?: string = 'id';

  @IsOptional()
  sort?: 'asc' | 'desc' = 'asc';
}
