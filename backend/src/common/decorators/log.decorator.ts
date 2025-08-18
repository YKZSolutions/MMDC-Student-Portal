import { HttpException, Logger } from '@nestjs/common';
import { extractArgs, ExtractedArgs, MetaParams } from './extract-args.util';
import { LOG_PARAM } from './log-param.decorator';
import 'reflect-metadata';

/**
 * Callback type for generating a log message based on method arguments.
 *
 * @param args - Keyed arguments (from `@LogParam`).
 * @returns A string message to log.
 */
type ArgsCallback = (args: Record<string, any>) => string;

/**
 * Callback type for generating a log message when the method succeeds.
 *
 * @template R - The resolved return type of the method.
 * @param result - The method's return value (resolved if async).
 * @param args - Keyed arguments (from `@LogParam`).
 * @returns A string message to log.
 */
type SuccessCallback<R> = (result: R, args: Record<string, any>) => string;

/**
 * Callback type for generating a log message when the method throws.
 *
 * @param error - The thrown error instance.
 * @param args - Keyed arguments (from `@LogParam`).
 * @returns A string message to log.
 */
type ErrorCallback = (
  error: HttpException,
  args: Record<string, any>,
) => string;

/**
 * Options for the {@link Log} method decorator.
 *
 * Each option can be:
 * - `true`: logs a default stringified message.
 * - `false`: disables logging for that stage.
 * - a callback: generates a custom log message with full access to method args and return/error values.
 *
 * @template R - The resolved return type of the method.
 */
interface LogOptions<R = any> {
  /**
   * Logs the arguments of the decorated method.
   *
   * - If set to `true`, logs the arguments using the default format (e.g., JSON.stringify).
   * - If set to a callback, allows customizing the log message.
   *
   * **Callback signature:**
   * ```ts
   * type ArgsCallback<A extends any[]> = (args: A) => string;
   * ```
   *
   * @example
   * ```ts
   * logArgsMessage: true
   *
   * logArgsMessage: (args) => `Called with ${args.length} args: ${args.join(", ")}`
   * ```
   */
  logArgsMessage?: boolean | ArgsCallback;

  /**
   * Logs a success message when the method finishes without error.
   *
   * - If set to `true`, logs a default success message.
   * - If set to a callback, allows customizing the log message with both args and return value.
   *
   * **Callback signature:**
   * ```ts
   * type SuccessCallback<A extends any[], R> = (args: A, result: R) => string;
   * ```
   *
   * @example
   * ```ts
   * logSuccessMessage: true
   *
   * logSuccessMessage: (args, result) =>
   *   `Method succeeded with result: ${result} for args: ${JSON.stringify(args)}`
   * ```
   */
  logSuccessMessage?: boolean | SuccessCallback<R>;

  /**
   * Logs an error message when the method throws.
   *
   * - If set to `true`, logs a default error message.
   * - If set to a callback, allows customizing the log message with args and error details.
   *
   * **Callback signature:**
   * ```ts
   * type ErrorCallback<A extends any[]> = (args: A, error: unknown) => string;
   * ```
   *
   * @example
   * ```ts
   * logErrorMessage: true
   *
   * logErrorMessage: (args, error) =>
   *   `Error "${(error as Error).message}" occurred with args: ${JSON.stringify(args)}`
   * ```
   */
  logErrorMessage?: boolean | ErrorCallback;
}

/**
 * Method decorator for logging method arguments, successful results, and errors.
 *
 * Uses {@link LogParam} to determine which arguments to log by key, while
 * also providing access to the full raw arguments array. Developers can
 * choose to enable/disable each logging stage or provide custom callbacks
 * for precise control over the logged messages.
 *
 * @template T - The method signature type being decorated.
 * @param options - Logging configuration.
 *
 * @example
 * ```
 * class UserService {
 *  ‎@Log({
 *     logArgsMessage: (args) => `Fetching user with id=${args.id}`,
 *     logSuccessMessage: (result) => `User found: ${result.name}`,
 *     logErrorMessage: (error, args) => `Failed to fetch user ${args.id}: ${error.message}`
 *   })
 *   getUser(@LogParam("id") userId: string) {
 *     return { id: userId, name: "John" };
 *   }
 * }
 * ```
 */
export function Log<T extends (...args: Parameters<T>) => any>(
  options: LogOptions<Awaited<ReturnType<T>>>,
) {
  const {
    logArgsMessage = true,
    logSuccessMessage = true,
    logErrorMessage = true,
  } = options;

  return function (
    target: Object | Function,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const originalMethod = descriptor.value!;

    type Args = Parameters<T>;
    type Ret = Awaited<ReturnType<T>>;

    descriptor.value = async function (...args: Args): Promise<Ret> {
      const logger = new Logger(target.constructor.name || 'UnknownClass');

      let params: MetaParams = {};
      let keyArgs: ExtractedArgs<Args, MetaParams> = {};

      if (logArgsMessage) {
        params = Reflect.getMetadata(LOG_PARAM, target, propertyKey);
        keyArgs = extractArgs(params, args); // I cannot extract the type due to the arg's name not retrievable

        if (logArgsMessage === true) {
          logger.log(`[${propertyKey}] START: ${JSON.stringify(keyArgs)}`);
        } else {
          logger.log(`[${propertyKey}] START: ${logArgsMessage(keyArgs)}`);
        }
      }

      try {
        const result = await originalMethod.apply(this, args);

        if (logSuccessMessage) {
          if (logSuccessMessage === true) {
            logger.log(`[${propertyKey}] SUCCESS: ${JSON.stringify(result)}`);
          } else {
            logger.log(
              `[${propertyKey}] SUCCESS: ${logSuccessMessage(result, keyArgs)}`,
            );
          }
        }

        return result;
      } catch (error) {
        if (logErrorMessage) {
          if (!logArgsMessage) {
            params = Reflect.getMetadata(LOG_PARAM, target, propertyKey);
            keyArgs = extractArgs(params, args);
          }

          if (logErrorMessage === true) {
            logger.error(
              `[${propertyKey}] FAIL: ${JSON.stringify((error as any).message)}`,
            );
          } else {
            logger.error(
              `[${propertyKey}] FAIL: ${logErrorMessage(error, keyArgs)}`,
            );
          }
        }
        throw error;
      }
    } as T;

    return descriptor;
  };
}
