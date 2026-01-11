import { AuthController } from '@auth/auth.contoller';
import { AuthService } from '@auth/auth.service';
import { Request, Response } from 'express';

jest.mock('@auth/auth.service');

describe('AuthController', () => {
  let authService: AuthService;
  let authController: AuthController;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    authService = new AuthService();
    authController = new AuthController(authService);

    req = {
      body: {
        email: 'ivan.ivanov.test@test.test',
        password: 'password12345',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('login', () => {
    it('should return a 201 status and response from authService.login when login is successful', async () => {
      const result = { token: 'mocked-jwt-token' };
      authService.login = jest.fn().mockResolvedValue(result);
      await authController.login(req as Request, res as Response);
      expect(authService.login).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    it('should return a 400 status and error message if login fails', async () => {
      const errorMessage = 'Invalid credentials';
      authService.login = jest.fn().mockRejectedValue(new Error(errorMessage));
      await authController.login(req as Request, res as Response);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});
