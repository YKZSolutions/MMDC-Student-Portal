import { Log, LogParam } from '@/common/decorators/log.decorator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { TestBodyDto } from './dto/test-body.dto';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class TestService {
  constructor() {}

  @Log({
    logArgsMessage: 'Hello from id={id} and {data.nested.name}',
    logSuccessMessage: 'Hello to {nested.name}',
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: () =>
      new BadRequestException('Http error because user not found'),
  })
  async test(
    @LogParam('id') id: string,
    page: number,
    @LogParam('data') data: TestBodyDto,
  ) {
    // throw new PrismaClientKnownRequestError('This is Prisma Error Due to missing Id', {
    //   clientVersion: '6.13.0',
    //   code: 'P2002',
    // });
    return data;
  }
}
