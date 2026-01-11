import { Router } from 'express';
import { DtoValidatorMiddleware } from '@middleware/dto-validator.middleware';
import { UserController } from '@user/user.controller';
import { UserService } from '@user/user.service';
import { CreateUserDto } from '@user/dto/create-user.dto';

import { AuthMiddleware } from '@middleware/auth.middleware';
import { RoleValidatorMiddleware } from '@middleware/role-validator.middleware';
import { UserRole } from '@entities/user.entity';
import { AuthenticatedRequest } from '@root/shared/interfaces/authenticated-request.interface';

const router = Router();

const userService = new UserService();
const controller = new UserController(userService);

const authMiddleware = new AuthMiddleware();
const roleValidatorMiddleware = new RoleValidatorMiddleware();

router.get(
  '/',
  authMiddleware.verifyToken,
  roleValidatorMiddleware.validate({ requires: [UserRole.ADMIN] }),
  (req: AuthenticatedRequest, res) => {
    controller.findAll(req, res);
  },
);

router.get(
  '/:userId',
  authMiddleware.verifyToken,
  roleValidatorMiddleware.validate({
    requires: [UserRole.ADMIN, UserRole.USER],
    selfOnly: [UserRole.USER],
  }),
  (req: AuthenticatedRequest, res) => {
    controller.findOne(req, res);
  },
);

router.post('/', DtoValidatorMiddleware.validate(CreateUserDto), (req, res) => {
  controller.create(req, res);
});

router.post(
  '/:userId/block',
  authMiddleware.verifyToken,
  roleValidatorMiddleware.validate({
    requires: [UserRole.ADMIN, UserRole.USER],
    selfOnly: [UserRole.USER],
  }),
  (req: AuthenticatedRequest, res) => {
    controller.block(req, res);
  },
);

export default router;
