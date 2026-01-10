import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@shared/interfaces/authenticated-request.interface';
import { UserRole } from '@entities/user.entity';

interface RoleValidatorOptions {
  requires: UserRole[];
  selfOnly?: UserRole[];
}

export class RoleValidatorMiddleware {
  constructor() {}

  public validate(options: RoleValidatorOptions) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { requires = [], selfOnly = [] } = options;

      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { id: userId, role: userRole } = req.user;
      const { id: paramId } = req.params;

      // Если пользователь в selfOnly и обращается к себе — разрешаем
      if (selfOnly.includes(userRole) && userId === paramId) {
        return next();
      }

      // Если пользователь в requires — разрешаем
      if (requires.includes(userRole)) {
        return next();
      }

      return res.status(403).json({ message: 'Forbidden' });
    };
  }
}
