import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserWithAccountDto } from './dto/create-user.dto';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { ApiBearerAuth, ApiCreatedResponse } from '@nestjs/swagger';
import { User } from '@/generated/nestjs-dto/user.entity';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { Public } from '@/common/decorators/auth.decorator';
import { Request } from 'express';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';

/**
 *
 * @remarks Handles user related operations
 *
 */
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user
   *
   * @remarks This operation creates both a user and a supabase auth account
   *
   */
  @Post()
  @Roles(Role.ADMIN)
  @Public()
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async create(@Body() createUserDto: CreateUserWithAccountDto): Promise<User> {
    try {
      const user = await this.usersService.create(createUserDto);

      return user.user;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Update user details (Admin only)
   *
   *
   * @remarks This operation updates the user details in the database
   *
   */
  @Put(':id')
  @Roles(Role.ADMIN)
  @Public()
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async updateUserDetails(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDetailsDto,
  ): Promise<User> {
    try {
      return await this.usersService.updateUserDetails(id, updateUserDto);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  //TODO: Still cannot be tested with the database as of now, needs logged in user implementation
  /**
   * Update personal details
   *
   * @remarks This operation updates the user details in the database
   *
   */
  @Put('/me')
  @Roles(Role.STUDENT, Role.MENTOR, Role.ADMIN)
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async updateOwnUserDetails(
    @Req() request: Request,
    @Body() updateUserDto: UpdateUserDetailsDto,
  ): Promise<User> {
    if (!request.user) throw new BadRequestException('User not found');

    const id = request.user.id;

    try {
      return await this.usersService.updateUserDetails(id, updateUserDto);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

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
