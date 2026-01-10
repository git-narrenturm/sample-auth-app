import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import { formatValidationErrors } from '@shared/utils/validation-errors.utils';

export class DtoValidatorMiddleware {
  static validate(DtoClass: new () => object) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const dto = plainToInstance(DtoClass, req.body);

      const errors = await validate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
        return res.status(422).json({
          message: 'Validation failed',
          errors: formatValidationErrors(errors),
        });
      }

      req.body = dto;
      next();
    };
  }
}
