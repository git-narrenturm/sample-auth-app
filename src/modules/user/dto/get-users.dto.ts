import { ListResponseDto } from '@shared/dto/list-response.dto';
import { ListRequestDto } from '@shared/dto/list-request.dto';
import { UserDto } from './user.dto';

export class GetUsersRequestDto extends ListRequestDto<UserDto> {}

export class GetUsersResponseDto extends ListResponseDto<UserDto> {
  declare items: UserDto[];
}
