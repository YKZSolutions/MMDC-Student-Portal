import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public } from '@/common/decorators/auth.decorator';
import { StatusBypass } from '@/common/decorators/user-status.decorator';
import { TestBodyDto } from './dto/test-body.dto';
import { TestService } from './test.service';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

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

  /**
   * Logging Test
   *
   * @remarks Test the logging & prisma error handling functionality
   *
   */
  @Post(':id')
  @Public()
  @StatusBypass()
  async test(
    @Param('id') id: string,
    @Query('page') page: number,
    @Body() testBodyDto: TestBodyDto,
  ) {
    await this.testService.test(id, page, testBodyDto);
    return 'less';
  }
}
