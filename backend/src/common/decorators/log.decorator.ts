import { Logger } from '@nestjs/common';

export function Log() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const logger = new Logger(target.constructor.name);

      logger.log(`[${propertyKey}] START: ${JSON.stringify(args)}`);

      try {
        const result = await originalMethod.apply(this, args);

        logger.log(
          `[${propertyKey}] SUCCESS — return: ${JSON.stringify(result)}`,
        );

        return result;
      } catch (err) {
        logger.error(`${propertyKey} FAIL: ${err.message}`);
        throw err;
      }
    };

    return descriptor;
  };
}
