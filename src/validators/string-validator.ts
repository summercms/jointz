import { ValidationError, Validator } from '../interfaces';

const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]*$/;
const UUID_REGEX = /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/;

interface StringValidatorOptions {
  readonly pattern?: RegExp;
  readonly minLength?: number;
  readonly maxLength?: number;
}

/**
 * Validates that a given value is a string with some format and minimum or maximum length.
 */
export default class StringValidator extends Validator<string> {
  private readonly options: StringValidatorOptions;

  public constructor(options: StringValidatorOptions) {
    super();
    this.options = options;
  }

  /**
   * Return a new validator that checks the string is not shorter than the given length.
   * @param min
   */
  public minLength(min: number): StringValidator {
    if (min < 0) {
      throw new Error(`given ${min} cannot be less than 0`);
    }

    return new StringValidator({ ...this.options, minLength: min });
  }

  /**
   * Returns a new string validator that checks the string does not exceed the maximum length
   * @param max length that the string may not exceed
   */
  public maxLength(max: number): StringValidator {
    if (max < 0) {
      throw new Error(`given ${max} cannot be less than 0`);
    }

    return new StringValidator({ ...this.options, maxLength: max });
  }

  /**
   * Return a string validator that checks the string matches a given pattern.
   * @param pattern to check
   */
  public pattern(pattern: RegExp): StringValidator {
    return new StringValidator({ ...this.options, pattern });
  }

  /**
   * Return a string validator that checks the string is alphanumeric.
   */
  public alphanum(): StringValidator {
    return new StringValidator({ ...this.options, pattern: ALPHANUMERIC_REGEX });
  }

  /**
   * Return a string validator that checks the string is a uuid.
   */
  public uuid(): StringValidator {
    return new StringValidator({ ...this.options, pattern: UUID_REGEX });
  }

  public validate(value: any, path: string = ''): ValidationError[] {
    const { pattern, minLength, maxLength } = this.options;

    if (typeof value !== 'string') {
      return [ { message: `must be a string`, path, value } ];
    }

    const errors: ValidationError[] = [];

    if (pattern && !pattern.test(value)) {
      errors.push({
        message: pattern === ALPHANUMERIC_REGEX ?
          'must be alphanumeric' :
          (
            pattern === UUID_REGEX ?
              'must be a uuid' :
              'did not match pattern'
          ),
        path,
        value
      });
    }

    if (typeof minLength !== 'undefined' && value.length < minLength) {
      errors.push({ message: `length ${value.length} was shorter than minimum length: ${minLength}`, path, value });
    }

    if (typeof maxLength !== 'undefined' && value.length > maxLength) {
      errors.push({ message: `length ${value.length} was longer than maximum length: ${maxLength}`, path, value });
    }

    return errors;
  }
}