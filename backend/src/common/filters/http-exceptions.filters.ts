import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let errorToThrow = exception;

    // If error is not HTTP error throw InternalServerError
    if (!(exception instanceof HttpException)) {
      this.logger.error(
        `Unhandled error in ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      errorToThrow = new InternalServerErrorException(
        'An unexpected error has occured',
      );
    }

    const status = (errorToThrow as HttpException).getStatus();
    const body = (errorToThrow as HttpException).getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: body,
    });
  }
}
