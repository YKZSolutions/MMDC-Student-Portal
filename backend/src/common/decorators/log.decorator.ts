import { Logger } from '@nestjs/common';
import 'reflect-metadata';

const LOG_PARAM = Symbol('LOG_PARAM');

/**
 * Parameter decorator for marking method parameters to be included in logging.
 *
 * @param {string} [paramName] - Optional name to assign to this parameter in the log output.
 * If omitted, the name will default to `param<index>`.
 */
export function LogParam(paramName?: string): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const existingParams: Record<number, string> =
      Reflect.getMetadata(LOG_PARAM, target, propertyKey) || {};

    existingParams[parameterIndex] = paramName || `param${parameterIndex}`;
    Reflect.defineMetadata(LOG_PARAM, existingParams, target, propertyKey);
  };
}

/**
 * Options for the {@link Log} method decorator.
 */
interface LogOptions {
  /**
   * Message template for logging method arguments.
   *
   * - If `true` (default), all decorated parameters are stringified and logged.
   * - If `false`, arguments are not logged.
   * - If a string, the string acts as a template, with `{key}` placeholders
   *   replaced by parameter values.
   *
   * @example
   * // Log all arguments (default)
   * logArgsMessage: true
   *
   * @example
   * // Disable logging of arguments
   * logArgsMessage: false
   *
   * @example
   * // Use a template
   * logArgsMessage: "Called with id={id} and name={name}"
   */
  logArgsMessage?: string | boolean;

  /**
   * Message template for logging successful return values.
   *
   * - If `true` (default), the return value is stringified and logged.
   * - If `false`, no success log is output.
   * - If a string, the string acts as a template, with `{key}` placeholders
   *   replaced by object property values (or `{result}` for primitives).
   *
   * @example
   * // Log the return value (default)
   * logSuccessMessage: true
   *
   * @example
   * // Disable logging of return values
   * logSuccessMessage: false
   *
   * @example
   * // Use a template for object return
   * logSuccessMessage: "User created with id={id}"
   *
   * @example
   * // Use a template for primitive return
   * logSuccessMessage: "Operation result: {result}"
   */
  logSuccessMessage?: string | boolean;
}

/**
 * Method decorator for logging method arguments and return values.
 *
 * Uses `@LogParam` to determine which arguments to log. Also supports
 * templated messages with `{key}` placeholders for both arguments and return values.
 *
 * @param {LogOptions} options - Configuration for logging behavior.
 */
export function Log(options: LogOptions): MethodDecorator {
  const { logArgsMessage = true, logSuccessMessage = true } = options;

  return (
    target: Object | Function,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const logger = new Logger(target.constructor?.name || 'UnknownClass');

      if (logArgsMessage) {
        const params: Record<number, string> = Reflect.getMetadata(
          LOG_PARAM,
          target,
          propertyKey,
        );

        const keyArgs = extractArgs(params, args);

        if (logArgsMessage === true) {
          logger.log(`[${propertyKey}] START: ${JSON.stringify(keyArgs)}`);
        } else {
          logger.log(
            `[${propertyKey}] START: ${JSON.stringify(applyTemplate(logArgsMessage, keyArgs))}`,
          );
        }
      }

      try {
        const result = await originalMethod.apply(this, args);

        if (logSuccessMessage) {
          if (logSuccessMessage === true) {
            logger.log(`[${propertyKey}] SUCCESS: ${JSON.stringify(result)}`);
          } else {
            if (result !== null && typeof result === 'object') {
              logger.log(
                `[${propertyKey}] SUCCESS: ${applyTemplate(logSuccessMessage, result)}`,
              );
            } else {
              logger.log(
                `[${propertyKey}] SUCCESS: ${JSON.stringify(applyTemplate(logSuccessMessage, { result }))}`,
              );
            }
          }
        }

        return result;
      } catch (err) {
        logger.error(`[${propertyKey}] FAIL: ${err.message}`);
        throw err;
      }
    };

    return descriptor;
  };
}

function extractArgs(
  params: Record<number, string>,
  args: any[],
): Record<string, any> {
  const output: Record<string, any> = {};

  for (const key of Object.keys(params)) {
    output[params[key]] = args[key];
  }
  return output;
}

function applyTemplate(template: string, values: Record<string, any>): string {
  return template.replace(/{([\w.]+)}/g, (_, keyPath) => {
    const keys = keyPath.split('.');
    let result: any = values;

    for (const k of keys) {
      if (result != null && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return `{${keyPath}}`;
      }
    }

    return String(result);
  });
}

// Example on how decorators work

// export function Sample(): MethodDecorator {
//   return (
//     target: Object | Function,
//     propertyKey: string,
//     descriptor: PropertyDescriptor,
//   ) => {
//     // Reference nung original method na pinaglagyan ng decorator
//     const originalMethod = descriptor.value;

//     // Etong descriptor.value is yung parang ihihighjack mo yung method para makagawa ng HoM
//     descriptor.value = async function (...args: any[]) {
//       const logger = new Logger(target.constructor?.name || 'UnknownClass');

//       // Logging before mag run yung component
//       logger.log(`[${propertyKey}] START:`);

//       // Eto yung component na nilagyan mo ng decorator
//       const result = await originalMethod.apply(this, args);

//       // Logging after mag run yung component
//       logger.log(`[${propertyKey}] SUCCESS:`);

//       // Return para ipasa sa next decorator
//       return result;
//     };

//     return descriptor;
//   };
// }
