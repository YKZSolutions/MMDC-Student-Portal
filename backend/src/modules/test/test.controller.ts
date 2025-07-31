import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  constructor() {}

  @Get('student')
  @Roles(Role.STUDENT)
  testStudent() {
    return 'You are a student';
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  testAdmin() {
    return 'You are an admin';
  }
}
