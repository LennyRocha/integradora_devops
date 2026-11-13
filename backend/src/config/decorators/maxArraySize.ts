/* eslint-disable @typescript-eslint/no-unused-vars */
// commons/contracts/src/decorators/is-unique-array.decorator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function MaxArraySize<T = unknown>(
  maxSize: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "maxArraySize",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [maxSize],
      validator: {
        validate(value: T[], args: ValidationArguments) {
          if (!Array.isArray(value)) return false;
          const [maxSize] = args.constraints as [number];
          return value.length <= maxSize;
        },
        defaultMessage(args: ValidationArguments) {
          const [maxSize] = args.constraints as [number];
          return `${args.property} no puede contener más de ${maxSize} elementos`;
        },
      },
    });
  };
}
