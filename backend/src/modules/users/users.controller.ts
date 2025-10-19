import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { MessageDto } from '@/common/dto/message.dto';
import { Role } from '@/common/enums/roles.enum';
import { AuthUser } from '@/common/interfaces/auth.user-metadata';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { User } from '@/generated/nestjs-dto/user.entity';
import { InviteUserDto } from '@/modules/users/dto/invite-user.dto';
import { UserWithRelations } from '@/modules/users/dto/user-with-relations.dto';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  ConflictException,
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
  UnauthorizedException
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { DeleteQueryDto } from '../../common/dto/delete-query.dto';
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
import {
  UserDetailsFullDto,
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from './dto/user-details.dto';
import { UsersService } from './users.service';

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
  @ApiException(() => [
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
  ])
  async create(@Body() createUserDto: CreateUserFullDto): Promise<UserDto> {
    return this.usersService.create(createUserDto.role, createUserDto);
  }

  /**
   * Create a new student user
   *
   * @remarks
   * This operation creates both a user and a supabase auth account.
   * It also has additional properties for student-specific details.
   *
   */
  @Post('/student')
  @Roles(Role.ADMIN)
  @ApiException(() => [
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
  ])
  async createStudent(
    @Body() createUserDto: CreateUserStudentDto,
  ): Promise<UserDto> {
    return this.usersService.create('student', createUserDto);
  }

  /**
   * Create a new staff user
   *
   * @remarks
   * This operation creates both a user and a supabase auth account.
   * It also has additional properties for staff-specific details.
   *
   */
  @Post('/staff')
  @Roles(Role.ADMIN)
  @ApiException(() => [
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
  ])
  async createStaff(
    @Body() createUserDto: CreateUserStaffDto,
  ): Promise<UserDto> {
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
  @ApiException(() => [
    BadRequestException,
    ConflictException,
    InternalServerErrorException,
  ])
  async inviteUser(@Body() inviteUserDto: InviteUserDto): Promise<UserDto> {
    return await this.usersService.inviteUser(inviteUserDto);
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
  ): Promise<UserStudentDetailsDto | UserStaffDetailsDto> {
    return this.usersService.getMe(user.id);
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
  ): Promise<UserDto> {
    const { user_id, role } = user.user_metadata;

    return this.usersService.updateUserDetails(user_id!, role!, updateUserDto);
  }

  /**
   * Update student user details (Admin only)
   *
   * @remarks
   * This operation updates the user details in the database.
   * The user should have a student role.
   */
  @Put(':id/student')
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async updateUserStudentDetails(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserStudentDto,
  ): Promise<UserDto> {
    const user = await this.usersService.findOne(id);

    return this.usersService.updateUserDetails(id, user.role, updateUserDto);
  }

  /**
   * Update staff user details (Admin only)
   *
   * @remarks
   * This operation updates the user details in the database.
   * The user should have a mentor or admin role.
   */
  @Put(':id/staff')
  @Roles(Role.ADMIN)
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async updateUserStaffDetails(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserStaffDto,
  ): Promise<UserDto> {
    const user = await this.usersService.findOne(id);

    return this.usersService.updateUserDetails(id, user.role, updateUserDto);
  }

  /**
   * Get users
   *
   * @remarks
   * Retrieves a paginated list of users based on the provided filter parameters.
   * - **Access: ** Requires `ADMIN` role.
   * - **Filtering & Pagination: ** Uses the `FilterUserDto` to define query parameters such as search terms, sorting, and page size.
   *
   */

  @Get()
  @Roles(Role.ADMIN, Role.MENTOR)
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
   * - **Validation: ** Ensures the provided `id` is a valid identifier format.
   * - **Not Found Handling: ** Throws an error if no matching user is found.
   *
   */
  @Get(':id')
  @ApiException(() => [
    BadRequestException,
    NotFoundException,
    InternalServerErrorException,
  ])
  async findOne(@Param('id') id: string): Promise<UserWithRelations> {
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
  async updateUserStatus(@Param('id') id: string): Promise<MessageDto> {
    return this.usersService.updateStatus(id);
  }

  /**
   * Deletes a user (soft and hard delete)
   *
   * @remarks
   * This endpoint performs either a soft delete or a permanent deletion of a user depending on the current state of the user or the query parameter provided:
   *
   * - If `directDelete` is true, the user is **permanently deleted** without checking if they are already softly deleted.
   * - If `directDelete` is not provided or false:
   *   - If the user is not yet softly deleted (`deletedAt` is null), a **soft delete** is performed by setting the `deletedAt` timestamp.
   *   - If the user is already softly deleted, a **permanent delete** is executed.
   *
   * All the user details and the supabase auth account will be deleted from the cloud on hard delete
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
    @Query() query?: DeleteQueryDto,
  ): Promise<MessageDto> {
    return this.usersService.remove(id, query?.directDelete);
  }
}
