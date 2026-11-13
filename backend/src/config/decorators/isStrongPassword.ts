import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

export function IsStrongPassword(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isStrongPassword",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== "string") return false;

          const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,64}$/;

          return regex.test(value);
        },

        defaultMessage(args: ValidationArguments) {
          return `${args.property} debe tener entre 12 y 64 caracteres, incluir una letra mayúscula, una minúscula, un número y un carácter especial.`;
        },
      },
    });
  };
}
