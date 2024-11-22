import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import dayjs from 'dayjs';

// YYYY-MM-DD format validator
@ValidatorConstraint({ name: 'isDateFormat', async: false })
export class IsDateFormatConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (!value) return false;

    // Check basic format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split('-').map(Number);

    // Check month is between 1-12
    if (month < 1 || month > 12) return false;

    // Special handling for February
    if (month === 2) {
      const isLeapYear =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const maxDays = isLeapYear ? 29 : 28;
      if (day > maxDays) return false;
    }
    // Check days for other months
    else {
      const monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
      const maxDays = monthsWith31Days.includes(month) ? 31 : 30;
      if (day < 1 || day > maxDays) return false;
    }

    // Final validation using dayjs
    const date = dayjs(value);
    return date.isValid() && date.format('YYYY-MM-DD') === value;
  }

  defaultMessage() {
    return 'Invalid date format or date. Must be YYYY-MM-DD with valid month (01-12) and appropriate days for the month';
  }
}

// StartDate < EndDate validator
@ValidatorConstraint({ name: 'isBeforeEndDate', async: false })
export class IsBeforeEndDateConstraint implements ValidatorConstraintInterface {
  validate(startDate: string, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const endDate = (args.object as any)[relatedPropertyName];

    if (!startDate || !endDate) return true; // Skip if either date is not provided

    return dayjs(startDate).isBefore(dayjs(endDate));
  }

  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    return `startDate must be before ${relatedPropertyName}`;
  }
}

// CurrentDate < EndDate validator
@ValidatorConstraint({ name: 'isFutureEndDate', async: false })
export class IsFutureEndDateConstraint implements ValidatorConstraintInterface {
  validate(endDate: string) {
    if (!endDate) return true; // Skip if date is not provided
    return dayjs().isBefore(dayjs(endDate));
  }

  defaultMessage() {
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
    return `End date must be after today's date. Please select a date from ${tomorrow} onwards`;
  }
}

// Custom decorators
export function IsDateFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDateFormatConstraint,
    });
  };
}

export function IsBeforeEndDate(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsBeforeEndDateConstraint,
    });
  };
}

export function IsFutureEndDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureEndDateConstraint,
    });
  };
}
