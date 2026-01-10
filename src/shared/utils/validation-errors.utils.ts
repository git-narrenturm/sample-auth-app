import { ValidationError } from 'class-validator';

export function formatValidationErrors(errors: ValidationError[]) {
  return errors.map(error => ({
    field: error.property,
    errors: error.constraints
      ? Object.values(error.constraints)
      : [],
  }));
}