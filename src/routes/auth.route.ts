import { Router } from 'express';
import { AuthController } from '@auth/auth.contoller';
import { AuthService } from '@auth/auth.service';
import { DtoValidatorMiddleware } from '@middleware/dto-validator.middleware';
import { LoginDto } from '@auth/dto/login.dto';
const router = Router();

const service = new AuthService();
const controller = new AuthController(service);

router.post('/login', DtoValidatorMiddleware.validate(LoginDto), (req, res) => {
  controller.login(req, res);
});

export default router;
