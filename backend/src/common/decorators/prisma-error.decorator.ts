import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Common Prisma error codes mapped to readable names.
 * Reference: https://www.prisma.io/docs/reference/api-reference/error-reference
 */
export const PrismaErrorCode = {
  /**
   * `P2000` — Value too long for the column type.
   * The value you are trying to store exceeds the column's size limit.
   *
   * Example: Storing a 300-character string in a `VARCHAR(255)` column.
   */
  ValueTooLong: 'P2000',

  /**
   * `P2020` — Value out of range for the column type.
   * The value you are trying to store exceeds the numeric range or precision.
   *
   * Example: Storing `999999` in a column defined as `TINYINT`.
   */
  ValueOutOfRange: 'P2020',

  /**
   * `P2002` — A unique constraint failed on the database.
   * This happens when you try to insert or update a record
   * with a value that already exists for a unique field.
   */
  UniqueConstraint: 'P2002',

  /**
   * `P2001` — The record you are trying to find does not exist.
   * Similar to `P2025` but is often thrown in certain specific contexts.
   */
  RecordExists: 'P2001',

  /**
   * `P2018` — Required connected records were not found.
   * This happens when attempting to connect related records
   * that do not exist.
   */
  RelatedRecordNotFound: 'P2018',

  /**
   * `P2025` — An operation failed because the record was not found.
   * Often occurs with `update`, `delete`, or `findUnique` when
   * no record matches the query.
   */
  RecordNotFound: 'P2025',

  /**
   * `P2003` — A foreign key constraint failed on the database.
   * This happens when a relation references a non-existent record.
   */
  ForeignKeyConstraint: 'P2003',

  /**
   * `P2011` — Null constraint violation.
   * This happens when you try to set a required field to `null`.
   */
  MissingRequiredValue: 'P2011',

  /**
   * `P2014` — A relation violation occurred.
   * The change you are trying to make would violate
   * the relation rules between records.
   */
  RelationViolation: 'P2014',

  /**
   * `P2034` — Transaction deadlock.
   * The transaction was aborted due to a deadlock between multiple transactions.
   */
  TransactionDeadlock: 'P2034',
} as const;

type PrismaErrorCodeKey = keyof typeof PrismaErrorCode;
type PrismaErrorCodeValue = (typeof PrismaErrorCode)[PrismaErrorCodeKey];

/**
 * Default mapping from Prisma error codes to NestJS exceptions.
 */
const defaultErrorMap: Record<
  PrismaErrorCodeValue,
  (message?: string) => Error
> = {
  [PrismaErrorCode.ValueTooLong]: (msg) =>
    new BadRequestException(msg || 'Value is too long.'),
  [PrismaErrorCode.ValueOutOfRange]: (msg) =>
    new BadRequestException(msg || 'Value is out of range.'),
  [PrismaErrorCode.UniqueConstraint]: (msg) =>
    new ConflictException(msg || 'Unique constraint failed.'),
  [PrismaErrorCode.RecordExists]: (msg) =>
    new NotFoundException(msg || 'Record not found.'),
  [PrismaErrorCode.RelatedRecordNotFound]: (msg) =>
    new NotFoundException(msg || 'Associated record(s) not found.'),
  [PrismaErrorCode.RecordNotFound]: (msg) =>
    new NotFoundException(msg || 'Record not found.'),
  [PrismaErrorCode.ForeignKeyConstraint]: (msg) =>
    new BadRequestException(msg || 'Foreign key constraint failed.'),
  [PrismaErrorCode.MissingRequiredValue]: (msg) =>
    new BadRequestException(msg || 'Missing required value.'),
  [PrismaErrorCode.RelationViolation]: (msg) =>
    new BadRequestException(msg || 'Relation violation.'),
  [PrismaErrorCode.TransactionDeadlock]: (msg) =>
    new InternalServerErrorException(msg || 'Transaction deadlock.'),
};

/**
 * Decorator to catch PrismaClientKnownRequestError and map them to NestJS exceptions.
 *
 * @param customMap - Optional custom mapping of error codes to exceptions.
 *
 * @example
 * ‎ @​PrismaError({
 *    [PrismaErrorCode.UniqueConstraint]:
 *       (msg) => new BadRequestException(msg || 'Email already exists')
 *  })
 *  async createUser(data: CreateUserDto) {
 *    return this.prisma.user.create({ data });
 *  }
 */
export function PrismaError(customMap: Partial<typeof defaultErrorMap> = {}) {
  const mergedMap = { ...defaultErrorMap, ...customMap };

  return function (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          const handler = mergedMap[err.code as PrismaErrorCodeValue];
          if (handler) {
            throw handler(err.message);
          }
        }
        throw err;
      }
    };

    return descriptor;
  };
}
