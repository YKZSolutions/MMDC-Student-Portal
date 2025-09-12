export const LOG_PARAM = Symbol('LOG_PARAM');

/**
 * Parameter decorator for marking method parameters to be included in logging.
 *
 * @param paramName - Optional name to assign to this parameter in the log output.
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
