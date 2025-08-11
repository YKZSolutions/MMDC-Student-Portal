import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { User } from '@/generated/nestjs-dto/user.entity';
import { InviteUserDto } from '@/modules/users/dto/invite-user.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
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
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { AuthUser } from '@/common/interfaces/auth.user-metadata';
import {
  UserDetailsFullDto,
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from './dto/user-details.dto';
import { DeleteQueryDto } from './dto/delete-user-query.dto';

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
    return this.usersService.create(createUserDto.role, createUserDto);
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
    return this.usersService.create('student', createUserDto);
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
    return this.usersService.create(createUserDto.role, createUserDto);
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
    const user = await this.usersService.inviteUser(inviteUserDto);

    return user.user;
  }

  /**
   * Get the currently authenticated user
   *
   * @remarks
   * This endpoint returns the full profile of the currently authenticated user.
   * The structure of the returned object depends on the user's role:
   *
   * - `UserStudentDetailsDto` for users with the `student` role
   * - `UserStaffDetailsDto` for users with the `mentor` or `admin` role
   */
  @ApiExtraModels(
    UserDetailsFullDto,
    UserStudentDetailsDto,
    UserStaffDetailsDto,
  )
  @ApiOkResponse({
    description: 'Current user details fetched successfully',
    schema: {
      type: 'object',
      oneOf: [
        { $ref: getSchemaPath(UserStudentDetailsDto) },
        { $ref: getSchemaPath(UserStaffDetailsDto) },
      ],
    },
  })
  @ApiException(() => [
    UnauthorizedException,
    NotFoundException,
    InternalServerErrorException,
  ])
  @Get('/me')
  async getMe(
    @CurrentUser() user: AuthUser,
  ): Promise<UserDetailsFullDto | UserStudentDetailsDto | UserStaffDetailsDto> {
    return this.usersService.getMe(user);
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
    @CurrentUser() user: AuthUser,
    @Body() updateUserDto: UpdateUserBaseDto,
  ): Promise<User> {
    const { user_id, role } = user.user_metadata;

    return this.usersService.updateUserDetails(user_id!, role!, updateUserDto);
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
    const user = await this.usersService.findOne(id);

    return this.usersService.updateUserDetails(id, user.role, updateUserDto);
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
    const user = await this.usersService.findOne(id);

    return this.usersService.updateUserDetails(id, user.role, updateUserDto);
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
    return this.usersService.findAll(filters);
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
    return this.usersService.findOne(id);
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

  /**
   * Deletes a user (soft & hard delete)
   *
   * @remarks
   * This endpoint performs either a soft delete or a permanent delete on a user depending on the current state of the user or the query parameter provided:
   *
   * - If `directDelete` is true, the user is **permanently deleted** without checking if they are already soft deleted.
   * - If `directDelete` is not provided or false:
   *   - If the user is not yet soft deleted (`deletedAt` is null), a **soft delete** is performed by setting the `deletedAt` timestamp.
   *   - If the user is already soft deleted, a **permanent delete** is executed.
   *
   * All of the user details and the supabase auth account will be deleted from the cloud on hard delete
   *
   * Use this endpoint to manage user deletion workflows flexibly through a single API.
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOkResponse({
    description: 'User deleted successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          examples: [
            'User has been soft deleted.',
            'User has been permanently deleted.',
          ],
        },
      },
    },
  })
  @ApiException(() => [NotFoundException, InternalServerErrorException])
  remove(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true })) query?: DeleteQueryDto,
  ) {
    return this.usersService.remove(id, query?.directDelete);
  }
}
