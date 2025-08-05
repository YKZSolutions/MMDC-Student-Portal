import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { User } from '@/generated/nestjs-dto/user.entity';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Put,
  Req,
  Get,
  HttpException,
  NotFoundException,
  InternalServerErrorException,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateUserWithAccountDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { PaginatedUsersDto } from './dto/paginated-user.dto';
import { UserWithRelations } from './dto/user-with-relations.dto';
import { UsersService } from './users.service';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { Request } from 'express';

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
   * Update personal details
   *
   * @remarks This operation updates the user details in the database
   *
   */
  @Put('/me')
  @ApiCreatedResponse({ type: User })
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async updateOwnUserDetails(
    @Req() request: Request,
    @Body() updateUserDto: UpdateUserDetailsDto,
  ): Promise<User> {
    if (!request.user) {
      throw new BadRequestException('User not found');
    }

    const userId = request.user.user_metadata?.user_id as string;

    try {
      return await this.usersService.updateUserDetails(userId, updateUserDto);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Failed to update user: ${err}`);
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

  /**
   * Retrieves a paginated list of users based on the provided filter parameters.
   *
   * - **Access:** Requires `ADMIN` role.
   * - **Filtering & Pagination:** Uses the `FilterUserDto` to define query parameters such as search terms, sorting, and page size.
   *
   * @param {FilterUserDto} filters - Query parameters for filtering, sorting, and pagination.
   * @returns {Promise<PaginatedUsersDto>} A paginated list of users matching the provided filters.
   *
   * @throws {BadRequestException} If the provided filters are invalid or cannot be processed.
   * @throws {InternalServerErrorException} If an unexpected server error occurs while fetching users.
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
   * Retrieves a specific user by their unique identifier.
   *
   * - **Validation:** Ensures the provided `id` is a valid identifier format.
   * - **Not Found Handling:** Throws an error if no matching user is found.
   *
   * @param {User['id']} id - The unique identifier of the user to retrieve.
   * @returns {Promise<User>} The user matching the provided ID.
   *
   * @throws {BadRequestException} If the provided ID format is invalid.
   * @throws {NotFoundException} If no user exists with the given ID.
   * @throws {InternalServerErrorException} If an unexpected server error occurs while fetching the user.
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
   * Disables a user account by setting the `disabledAt` timestamp.
   *
   * @param id - The ID of the user to disable.
   *
   * @remarks
   * - This endpoint marks a user as disabled by updating the `disabledAt` field.
   * - It ensures the user exists and is not already disabled.
   * - Also verifies that the associated user account exists.
   *
   * @returns A confirmation that the user has been successfully disabled.
   *
   * @throws {NotFoundException} If the user or the user's account does not exist.
   * @throws {BadRequestException} If the user is already disabled.
   * @throws {InternalServerErrorException} If an unexpected error occurs during the operation.
   */
  @Patch(':id/disable')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ description: 'User disabled successfully' })
  @ApiException(() => [
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  ])
  async disable(@Param('id') id: string) {
    try {
      await this.usersService.disableUser(id);

      return { message: 'User disabled successfully.' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('An unexpected error has occured');
    }
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
