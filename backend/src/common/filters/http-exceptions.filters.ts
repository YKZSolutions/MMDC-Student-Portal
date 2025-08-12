import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { AuthError } from '@supabase/supabase-js';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);
  private readonly isProduction = process.env.NODE_ENV === 'production';

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId: string = (req as any).id || 'N/A';

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
      };

      const errorInfo = prismaErrorMap[exception.code];
      statusCode = errorInfo?.statusCode || HttpStatus.BAD_REQUEST;
      message = errorInfo?.message || 'An unexpected database error occurred.';
      this.logError('PrismaClientKnownRequestError', requestId, req, exception);

      // --- 3. NestJS HTTP Exceptions ---
    } else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      statusCode = exception.getStatus();

      let messages: string[] = [];
      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        messages = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message
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
      path: this.isProduction ? undefined : req.url,
    });
  }

  private logError(
    type: string,
    requestId: string,
    req: Request,
    exception: Error,
  ) {
    const logMessage = `[${type}] RequestID=${requestId} ${req.method} ${req.url} -> ${exception.message}`;
    if (this.isProduction) {
      this.logger.error(logMessage);
    } else {
      this.logger.error(logMessage, exception.stack);
    }
  }
}
