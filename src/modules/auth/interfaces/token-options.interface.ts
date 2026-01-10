import { UserRole } from "@entities/user.entity";

export interface TokenOptions {
  id: string;
  role: UserRole;
}
