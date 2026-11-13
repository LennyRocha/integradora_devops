/* eslint-disable @typescript-eslint/no-unused-vars */
// commons/contracts/src/decorators/is-unique-array.decorator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsUniqueObjectArray<T = unknown>(
  key: keyof T,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUniqueObjectArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [key],
      validator: {
        validate(value: T[], args: ValidationArguments) {
          if (!Array.isArray(value)) return false;
          const [propertyKey] = args.constraints as [keyof T];
          const values = value.map((item) => item[propertyKey]);
          return new Set(values).size === values.length;
        },
        defaultMessage(args: ValidationArguments) {
          const [propertyKey] = args.constraints as [string];
          return `${args.property} contiene elementos con "${String(propertyKey)}" duplicad@s`;
        },
      },
    });
  };
}

export function IsUniquePrimitiveArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUniquePrimitiveArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown[], _args: ValidationArguments) {
          if (!Array.isArray(value)) return false;
          const uniqueValues = new Set(value);
          return uniqueValues.size === value.length;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} no debe contener elementos duplicados`;
        },
      },
    });
  };
}
