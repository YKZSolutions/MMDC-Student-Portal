import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthError } from '@supabase/supabase-js';
import { RequestWithId } from '@/middleware/request-id.middleware';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId: string = (req as RequestWithId).id || 'N/A';

    let statusCode: number;
    let message: string;

    // --- 1. Supabase Auth Errors ---
    if (exception instanceof AuthError) {
      statusCode = exception.status || HttpStatus.UNAUTHORIZED;
      message = exception.message;
      this.logError('Supabase AuthError', requestId, req, exception);

      // --- 2. Prisma Errors ---
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaErrorMap: Record<
        string,
        { message: string; statusCode: number }
      > = {
        // Common errors
        // All validation errors should be handled by DTO validations.
        P2000: {
          message: 'The provided value for a column is too long.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        P2020: {
          message: 'The provided value for a column is out of range.',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        P2002: {
          message: `Duplicate entry: ${exception.meta?.target as string}`,
          statusCode: HttpStatus.CONFLICT,
        },
        // For not found errors, it is generally much better to throw a NotFoundException
        // with the field that was not found.
        // But in cases where the field should not be known by the client,
        // we can directly use an `orThrow` in the Prisma query.
        P2001: {
          message: 'Record not found.',
          statusCode: HttpStatus.NOT_FOUND,
        },
        P2018: {
          message: 'Associated record/s not found.',
          statusCode: HttpStatus.NOT_FOUND,
        },
        P2025: {
          message: 'Associated record/s not found.',
          statusCode: HttpStatus.NOT_FOUND,
        },

        // Add more Prisma error codes as needed
        // Be wary of including too many Prisma error codes here,
        // especially since not everything should be known to the client.
      };

      const errorInfo = prismaErrorMap[exception.code];
      statusCode = errorInfo?.statusCode || HttpStatus.BAD_REQUEST;
      message = errorInfo?.message || 'An unexpected database error occurred.';
      this.logError('PrismaClientKnownRequestError', requestId, req, exception);

      // --- 3. NestJS HTTP Exceptions ---
    } else if (
      exception instanceof NotFoundException ||
      exception instanceof BadRequestException ||
      exception instanceof ConflictException ||
      exception instanceof UnauthorizedException ||
      exception instanceof ForbiddenException
    ) {
      const exceptionResponse = exception.getResponse();
      statusCode = exception.getStatus();

      let messages: string[] = [];

      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        messages = Array.isArray(exceptionResponse.message)
          ? (exceptionResponse.message as string[])
          : [exceptionResponse.message as string];
      }
      message = messages.length > 0 ? messages.join('; ') : exception.message;

      this.logError('HttpException', requestId, req, exception);

      // --- 4. Unhandled Errors ---
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected internal server error occurred.';
      this.logError('UnhandledException', requestId, req, exception);
    }

    res.status(statusCode).json({
      error: message,
      timestamp: new Date().toISOString(),
      requestId,
      path: this.isProduction ? undefined : req.url, // Don't expose the path in production'
    });
  }

  private logError(
    type: string,
    requestId: string,
    req: Request,
    exception: Error,
  ) {
    const logMessage = `[${type}] RequestID=${requestId} ${req.method} ${req.url} -> ${exception.message}`;
    this.logger.error(
      logMessage,
      !this.isProduction && type === 'UnhandledException' // Only log stack trace in non-production for unhandled exceptions
        ? exception.stack
        : undefined,
    );
  }
}
