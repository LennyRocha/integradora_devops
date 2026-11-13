// validators/is-curp.decorator.ts
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";

const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

export function IsCURP(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isCURP",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== "string") return false;

          return CURP_REGEX.test(value.toUpperCase());
        },

        defaultMessage(args: ValidationArguments) {
          return `${args.property} no es una CURP válida.`;
        },
      },
    });
  };
}
