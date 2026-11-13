/* eslint-disable @typescript-eslint/no-unused-vars */
// commons/contracts/src/decorators/is-unique-array.decorator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function MinArraySize<T = unknown>(
  minSize: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "minArraySize",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [minSize],
      validator: {
        validate(value: T[], args: ValidationArguments) {
          if (!Array.isArray(value)) return false;
          const [minSize] = args.constraints as [number];
          return value.length >= minSize;
        },
        defaultMessage(args: ValidationArguments) {
          const [minSize] = args.constraints as [number];
          return `${args.property} debe contener al menos ${minSize} elementos`;
        },
      },
    });
  };
}
