import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  traceId: string;
}

const STATUS_TO_CODE: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  429: 'TOO_MANY_REQUESTS',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId = request.traceId ?? 'unknown';

    const body = this.normalize(exception, traceId);

    this.logger.error({
      err:
        exception instanceof Error
          ? { message: exception.message, stack: exception.stack }
          : exception,
      traceId,
      path: request.url,
      method: request.method,
      statusCode: body.statusCode,
    });

    response.status(body.statusCode).json(body);
  }

  private normalize(exception: unknown, traceId: string): ErrorResponseBody {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const fallbackCode = STATUS_TO_CODE[status] ?? 'HTTP_ERROR';

      if (typeof res === 'string') {
        return {
          statusCode: status,
          code: fallbackCode,
          message: res,
          traceId,
        };
      }

      if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        const rawMessage = obj.message;

        const message =
          typeof rawMessage === 'string'
            ? rawMessage
            : Array.isArray(rawMessage)
              ? rawMessage.join(', ')
              : exception.message;

        const code = typeof obj.code === 'string' ? obj.code : fallbackCode;
        const details = obj.details;

        return details === undefined
          ? { statusCode: status, code, message, traceId }
          : { statusCode: status, code, message, details, traceId };
      }

      return {
        statusCode: status,
        code: fallbackCode,
        message: exception.message,
        traceId,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      traceId,
    };
  }
}
