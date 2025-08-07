import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { Role as RoleType } from '@prisma/client';
import { User } from '@/generated/nestjs-dto/user.entity';
import { InviteUserDto } from '@/modules/users/dto/invite-user.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  CreateUserFullDto,
  CreateUserStaffDto,
  CreateUserStudentDto,
} from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { PaginatedUsersDto } from './dto/paginated-user.dto';
import {
  UpdateUserBaseDto,
  UpdateUserStaffDto,
  UpdateUserStudentDto,
} from './dto/update-user-details.dto';
import { UserWithRelations } from './dto/user-with-relations.dto';
import { UsersService } from './users.service';
import { Public } from '@/common/decorators/auth.decorator';
import { StatusBypass } from '@/common/decorators/user-status.decorator';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { AuthUser } from '@/common/interfaces/auth.user-metadata';
import { UserDetailsDto } from './dto/user-details.dto';
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
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async create(@Body() createUserDto: CreateUserFullDto): Promise<User> {
    try {
      const user = await this.usersService.create(
        createUserDto.role,
        createUserDto,
      );

      return user;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Create a new student user
   *
   * @remarks
   * This operation creates both a user and a supabase auth account.
   * It also has additional properties for student specific details.
   *
   */
  @Post('/student')
  @Roles(Role.ADMIN)
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async createStudent(
    @Body() createUserDto: CreateUserStudentDto,
  ): Promise<User> {
    try {
      const user = await this.usersService.create('student', createUserDto);

      return user;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Create a new staff user
   *
   * @remarks
   * This operation creates both a user and a supabase auth account.
   * It also has additional properties for staff specific details.
   *
   */
  @Post('/staff')
  @Roles(Role.ADMIN)
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async createStaff(@Body() createUserDto: CreateUserStaffDto): Promise<User> {
    try {
      const user = await this.usersService.create(
        createUserDto.role,
        createUserDto,
      );

      return user;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Invite a new user
   *
   * @remarks This operation creates both a user and a supabase auth account
   *
   */
  @Post('invite')
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async inviteUser(@Body() inviteUserDto: InviteUserDto): Promise<User> {
    try {
      const user = await this.usersService.inviteUser(inviteUserDto);

      return user.user;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Retrieves profile information of the currently authenticated user.
   *
   * @remarks
   * This endpoint uses the `UserDetailsDto` as the response schema.
   */
  @ApiOkResponse({ type: UserDetailsDto })
  @Get('/me')
  async getMe(@CurrentUser() user: AuthUser) {
    const id = user.id;

    if (!id) {
      throw new UnauthorizedException('User not authorized');
    }

    return this.usersService.getMe(id);
  }

  /**
   * Update personal details
   *
   * @remarks This operation updates the user details in the database
   *
   */
  @Put('/me')
  @ApiExtraModels(UpdateUserStudentDto, UpdateUserStaffDto)
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async updateOwnUserDetails(
    @Req() request: Request,
    @Body() updateUserDto: UpdateUserBaseDto,
  ): Promise<User> {
    if (!request.user) throw new BadRequestException('User not found');

    if (
      !request.user.user_metadata ||
      !request.user.user_metadata.user_id ||
      !request.user.user_metadata.role
    )
      throw new BadRequestException('User metadata not found');

    const { user_id, role } = request.user.user_metadata;

    try {
      return await this.usersService.updateUserDetails(
        user_id,
        role,
        updateUserDto,
      );
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to update user: ${err}`);
    }
  }

  /**
   * Update student user details (Admin only)
   *
   * @remarks
   * This operation updates the user details in the database.
   * The user should be have a student role.
   */
  @Put(':id/student')
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async updateUserStudentDetails(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserStudentDto,
  ): Promise<User> {
    try {
      const user = await this.usersService.findOne(id);

      return await this.usersService.updateUserDetails(
        id,
        user.role,
        updateUserDto,
      );
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /**
   * Update staff user details (Admin only)
   *
   * @remarks
   * This operation updates the user details in the database.
   * The user should be have a mentor or admin role.
   */
  @Put(':id/staff')
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async updateUserStaffDetails(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserStaffDto,
  ): Promise<User> {
    try {
      const user = await this.usersService.findOne(id);

      return await this.usersService.updateUserDetails(
        id,
        user.role,
        updateUserDto,
      );
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /**
   * Get users
   *
   * @remarks
   * Retrieves a paginated list of users based on the provided filter parameters.
   * - **Access:** Requires `ADMIN` role.
   * - **Filtering & Pagination:** Uses the `FilterUserDto` to define query parameters such as search terms, sorting, and page size.
   *
   */

  @Get()
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'List of users retrieved successfully',
    type: PaginatedUsersDto,
  })
  @ApiException(() => [BadRequestException, InternalServerErrorException])
  async findAll(@Query() filters: FilterUserDto): Promise<PaginatedUsersDto> {
    try {
      return await this.usersService.findAll(filters);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  /**
   * Get user by id

   *
   * @remarks
   * Retrieves a specific user by their unique identifier.
   * - **Validation:** Ensures the provided `id` is a valid identifier format.
   * - **Not Found Handling:** Throws an error if no matching user is found.
   *
   */
  @Get(':id')
  @ApiOkResponse({ description: 'User found successfully', type: User })
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  async findOne(
    @Param('id') id: UserWithRelations['id'],
  ): Promise<UserWithRelations> {
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  /**
   * Updates the status of a user (enable/disable).
   *
   * @remarks
   * This endpoint toggles the user's status between active and disabled
   * by updating the `disabledAt` field. The change is also reflected in
   * the authentication provider's metadata.
   */

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'User status updated successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          examples: [
            'User enabled successfully.',
            'User disabled successfully.',
          ],
        },
      },
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  async updateUserStatus(@Param('id') id: string) {
    return this.usersService.updateStatus(id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
