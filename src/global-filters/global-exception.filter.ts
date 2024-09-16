import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';
import { JsonWebTokenError } from '@nestjs/jwt';

import { Environment } from '../env.validate';
import { ValidationException } from './validation-exception.filter';

import { AppError } from '~/common/app-error.common';
import { ErrorMessage } from '~/common/error-messages.enum';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  catch(err: any, host: ArgumentsHost): Response<JSON> {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    let status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;

    let message: { [key: string]: any } | string =
      err.message || ErrorMessage.CUSTOM_SERVER_ERROR;

    let data: { [x: string]: any } | undefined | string = undefined;

    const errCode: string = err.code || false;

    if (err instanceof AppError) {
      ({ message } = err);
    }

    switch (true) {
      case errCode && errCode?.startsWith('SMTP'):
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = ErrorMessage.FAILED_TO_SEND_EMAIL;
        break;
      case errCode === 'ER_DUP_ENTRY':
        status = HttpStatus.CONFLICT;
        message = ErrorMessage.ENTITY_ALREADY_EXIST;
        break;
    }

    if (err.message === ErrorMessage.JWT_EXPIRED) {
      status = HttpStatus.BAD_REQUEST;
    }

    //  Include stacktrace only in development
    if (process.env.NODE_ENV === Environment.DEVELOPMENT) {
      data = {
        message: err.message,
        stack: err.stack,
      };
    }

    if (err instanceof ValidationException) {
      ({ message } = err); // destructure message from err object
      if (err.errors instanceof Array) {
        data = err.errors.map((err: ValidationError) => ({
          property: err.property,
          constraints: Object.values(err.constraints),
        }));
      } else data = err.getResponse();
    }

    if (err instanceof JsonWebTokenError) {
      status = HttpStatus.UNAUTHORIZED;
    }

    return res.status(status).json({
      status,
      message,
      data,
    });
  }
}
