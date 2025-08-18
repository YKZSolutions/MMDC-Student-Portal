import { Log } from '@/common/decorators/log.decorator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TestBodyDto } from './dto/test-body.dto';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { LogParam } from '@/common/decorators/log-param.decorator';

@Injectable()
export class TestService {
  constructor() {}

  @Log({
    logArgsMessage: ({ id }) => `${id}`,
    logSuccessMessage: (data) => `Hello to ${data.id}`,
    logErrorMessage: (err, { id }) =>
      `There was an error for id=${id}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: (msg, { id }) =>
      new BadRequestException(`Http error because user not found at id=${id}`),
  })
  async test(
    @LogParam('id') id: string,
    page: number,
    @LogParam('data') data: TestBodyDto,
  ) {
    // throw new PrismaClientKnownRequestError(
    //   'This is Prisma Error Due to missing Id',
    //   {
    //     clientVersion: '6.13.0',
    //     code: 'P2002',
    //   },
    // );
    return data;
  }
}
