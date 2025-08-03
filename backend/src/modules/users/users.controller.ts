import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { User } from '@/generated/nestjs-dto/user.entity';
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
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { CreateUserWithAccountDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { PaginatedUsersDto } from './dto/paginated-user.dto';
import { UserWithRelations } from './dto/user-with-relations.dto';
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

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
