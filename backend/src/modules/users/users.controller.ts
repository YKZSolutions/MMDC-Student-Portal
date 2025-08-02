import { Public } from '@/common/decorators/auth.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { User } from '@/generated/nestjs-dto/user.entity';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { CreateUserWithAccountDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

/**
 *
 * @remarks Handles user related operations
 *
 */
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Create a new user
   *
   * @remarks This operation creates both a user and a supabase auth account
   *
   */
  @Post()
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async create(@Body() createUserDto: CreateUserWithAccountDto): Promise<User> {
    try {
      const account = await this.authService.create(
        createUserDto.credentials?.email || 'test@email',
        createUserDto.credentials?.password || '1234',
        createUserDto.role,
      );
      const user = await this.usersService.create(createUserDto, account);

      await this.authService.updateMetadata(account.id, {
        user_id: user.user.id,
      });

      return user.user;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Get()
  // @Roles(Role.ADMIN)
  @Public()
  @ApiOkResponse({ type: [User] })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  findAll(): Promise<{ users: User[]; meta: any; }> {
    try {
      return this.usersService.findAll();
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
