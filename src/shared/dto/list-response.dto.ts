export class ListResponseDto<T> {
  items: T[];

  
  total: number;
  page: number;
  limit: number;
  pages: number;
}
