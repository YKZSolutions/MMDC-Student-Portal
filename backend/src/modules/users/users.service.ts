import { type ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { AuthService } from '@/modules/auth/auth.service';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateUserFullDto,
  CreateUserStaffDto,
  CreateUserStudentDto,
} from './dto/create-user.dto';
import {
  UpdateUserStaffDto,
  UpdateUserStudentDto,
} from './dto/update-user-details.dto';
import { Prisma, Role } from '@prisma/client';
import { CustomPrismaService } from 'nestjs-prisma';
import { FilterUserDto } from './dto/filter-user.dto';
import { PaginatedUsersDto } from './dto/paginated-user.dto';
import { UserWithRelations } from './dto/user-with-relations.dto';
import { InviteUserDto } from '@/modules/users/dto/invite-user.dto';
import { User } from '@supabase/supabase-js';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import {
  UserDetailsFullDto,
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from './dto/user-details.dto';
import { UpdateStudentDetailsDto } from '@/generated/nestjs-dto/update-studentDetails.dto';
import { UpdateStaffDetailsDto } from '@/generated/nestjs-dto/update-staffDetails.dto';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';

@Injectable()
export class UsersService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private authService: AuthService,
  ) {}

  /**
   * Handles Supabase account creation and executes a callback that creates the corresponding Prisma user.
   * It also sets the user's metadata, which will be used in handling of role and status guards.
   * If Prisma creation fails, it will delete the Supabase account.
   *
   * @param credentials - The user's login credentials.
   * @param role - Role of the user (student, admin, etc.).
   * @param callback - A function to create the Prisma user, passed the Supabase user object.
   * @returns The created Prisma user.
   * @throws BadRequestException if user creation in DB fails.
   */
  @Log({
    logArgsMessage: ({ credentials, role }) =>
      `Create supabase account email=${credentials.email} role=${role}`,
    logSuccessMessage: (result, { credentials }) =>
      `Create supabase account email=${credentials.email} id=${result.id}`,
    logErrorMessage: (err, { credentials }) =>
      `Create supabase account email=${credentials.email} | Error: ${err.message}`,
  })
  private async accountCreationHandler(
    @LogParam('credentials') credentials: CreateUserFullDto['credentials'],
    @LogParam('role') role: Role,
    callback: (user: User) => Promise<UserDto>,
  ) {
    const account = await this.authService.create(
      role,
      credentials.email,
      credentials.password,
    );

    try {
      const user: UserDto = await callback(account);

      await this.authService.updateMetadata(account.id, {
        user_id: user.id,
      });

      return user;
    } catch (err) {
      if (account) await this.authService.delete(account.id);
      throw err;
    }
  }

  /**
   * Creates a new user with an associated Supabase account and database records.
   *
   * @param role - The role of the user being created.
   * @param createUserDto - The complete user creation payload.
   * @returns The created user object.
   * @throws InternalServerErrorException if user creation fails.
   */
  @Log({
    logArgsMessage: ({ role, dto }) =>
      `Create user account email=${dto.credentials.email} role=${role}`,
    logSuccessMessage: (result, { role, dto }) =>
      `Create user account email=${dto.credentials.email} role=${role} | id=${result.id}`,
    logErrorMessage: (err, { role, dto }) =>
      `Create user account email=${dto.credentials.email} role=${role} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: (msg, { dto }) =>
      new ConflictException(
        `User creation failed: email=${dto.credentials.email} already exists`,
      ),
    [PrismaErrorCode.ForeignKeyConstraint]: () =>
      new BadRequestException('Invalid reference when creating user'),
    [PrismaErrorCode.RelationViolation]: () =>
      new BadRequestException(
        'Invalid relation setup (e.g., multiple details for one user)',
      ),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'User creation failed due to transaction deadlock',
      ),
  })
  async create(
    @LogParam('role') role: Role,
    @LogParam('dto')
    createUserDto:
      | CreateUserFullDto
      | CreateUserStudentDto
      | CreateUserStaffDto,
  ) {
    const {
      user: userDto,
      credentials,
      userDetails: userDetailsDto,
    } = createUserDto;

    const user = await this.accountCreationHandler(
      credentials,
      role,
      async (account) => {
        const baseUserData: Prisma.UserCreateInput = {
          ...userDto,
          role,
          userAccount: {
            create: {
              authUid: account.id,
              email: account.email,
            },
          },
          userDetails: {
            create: userDetailsDto || {
              dateJoined: new Date(),
            },
          },
        };

        if (!('role' in createUserDto) && 'specificDetails' in createUserDto) {
          baseUserData.studentDetails = {
            create: createUserDto.specificDetails,
          };
        } else if (
          (role === 'mentor' || role === 'admin') &&
          'specificDetails' in createUserDto
        ) {
          baseUserData.staffDetails = {
            create: createUserDto.specificDetails,
          };
        }

        return await this.prisma.client.user.create({
          data: baseUserData,
        });
      },
    );

    return user;
  }

  /**
   * Invites a user by creating a Supabase account and a corresponding database record.
   *
   * - If a user with the same auth UID already exists, it returns that user instead of creating a new one.
   * - Updates metadata on Supabase with the newly created user ID.
   *
   * @param inviteUserDto - Payload containing email, role, and optional user details.
   * @returns The invited user and associated metadata.
   * @throws ConflictException if a user with the email already exists.
   * @throws InternalServerErrorException if invitation fails unexpectedly.
   */

  @Log({
    logArgsMessage: ({ dto }) =>
      `Invite user email=${dto.email} role=${dto.role}`,
    logSuccessMessage: (result, { dto }) =>
      `Invite user email=${dto.email} role=${dto.role} | id=${result.user.id}`,
    logErrorMessage: (err, { dto }) =>
      `Invite user email=${dto.email} role=${dto.role} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.UniqueConstraint]: (msg, { dto }) =>
      new ConflictException(
        `Invitation failed: email=${dto.email} already exists`,
      ),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'User invitation failed due to transaction deadlock',
      ),
  })
  async inviteUser(@LogParam('dto') inviteUserDto: InviteUserDto) {
    const result = await this.prisma.client.$transaction(async (tx) => {
      const account = await this.authService.invite(
        inviteUserDto.email,
        inviteUserDto.role,
      );

      let user = await tx.user.findFirst({
        where: { userAccount: { authUid: account.id } },
      });

      if (user) return { user };

      user = await tx.user.create({
        data: {
          firstName: inviteUserDto.firstName,
          middleName: inviteUserDto.middleName,
          lastName: inviteUserDto.lastName,
          role: inviteUserDto.role,
          userAccount: {
            create: {
              authUid: account.id,
              email: account.email,
            },
          },
        },
      });

      await this.authService.updateMetadata(account.id, {
        user_id: user.id,
      });

      return { user };
    });

    return result;
  }

  /**
   * Updates a user’s basic personal details (first name, middle name, last name).
   *
   * @param userId - The UUID of the user.
   * @param role - The Role of the user ("student", "mentor", "admin").
   * @param updateUserDto - Partial fields to update.
   * @returns The updated user object.
   * @throws BadRequestException if no updatable fields are provided or payload is invalid.
   * @throws NotFoundException if the user does not exist.
   * @throws InternalServerErrorException if update fails unexpectedly.
   */
  @Log({
    logArgsMessage: ({ userId, role }) =>
      `Update user details userId=${userId}, role=${role}`,
    logSuccessMessage: (result, { userId }) =>
      `Updated user details userId=${userId}, id=${result.id}`,
    logErrorMessage: (err, { userId }) =>
      `Failed to update user details userId=${userId} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (msg, { userId }) =>
      new NotFoundException(`User with ID ${userId} not found`),
    [PrismaErrorCode.ForeignKeyConstraint]: () =>
      new BadRequestException('Invalid reference during user update'),
    [PrismaErrorCode.RelationViolation]: () =>
      new BadRequestException('Invalid relation setup during user update'),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'User update failed due to transaction deadlock',
      ),
  })
  async updateUserDetails(
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
    updateUserDto: UpdateUserStudentDto | UpdateUserStaffDto,
  ): Promise<UserDto> {
    const {
      user: userDto,
      userDetails: userDetailsDto,
      specificDetails: specificDetailsDto,
    } = updateUserDto;

    const baseUserData: Prisma.UserUpdateInput = {
      ...userDto,
    };

    if (userDetailsDto) {
      baseUserData.userDetails = {
        update: {
          ...userDetailsDto,
        },
      };
    }

    if (specificDetailsDto) {
      if (role === 'student') {
        baseUserData.studentDetails = {
          update: {
            ...(specificDetailsDto as UpdateStudentDetailsDto),
          },
        };
      } else if (role === 'mentor' || role === 'admin') {
        baseUserData.staffDetails = {
          update: {
            ...(specificDetailsDto as UpdateStaffDetailsDto),
          },
        };
      }
    }

    const updatedUser = await this.prisma.client.user.update({
      where: { id: userId },
      data: baseUserData,
    });

    return updatedUser;
  }

  /**
   * Applies filtering conditions to a Prisma `UserWhereInput` based on the provided filters.
   *
   * - Filters by role if provided.
   * - Only includes users that are not soft-deleted (`deletedAt = null`).
   * - Supports full-text search across firstName, lastName, and userAccount email.
   *
   * @param filters - Filter conditions including role and search terms.
   * @param where - Prisma `UserWhereInput` object that will be mutated.
   */

  filterHandler(filters: FilterUserDto, where: Prisma.UserWhereInput) {
    if (filters.role) where.role = filters.role;

    where.deletedAt = null;

    if (filters.search?.trim()) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      where.AND = searchTerms.map((term) => ({
        OR: [
          {
            firstName: {
              contains: term,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            lastName: {
              contains: term,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            userAccount: {
              email: {
                contains: term,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        ],
      }));
    }
  }

  /**
   * Finds all users that match provided filters (e.g., role, search keyword) with pagination.
   *
   * @param filters - Filter and pagination options.
   * @returns Paginated list of users with metadata.
   * @throws BadRequestException or InternalServerErrorException based on the failure type.
   */
  @Log({
    logArgsMessage: ({ filters }) =>
      `Find all users filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result) => `Found ${result.users.length} users`,
    logErrorMessage: (err) => `Failed to find users | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'User search failed due to transaction deadlock',
      ),
  })
  async findAll(
    @LogParam('filters') filters: FilterUserDto,
  ): Promise<PaginatedUsersDto> {
    const page: FilterUserDto['page'] = Number(filters?.page) || 1;
    const where: Prisma.UserWhereInput = {};

    this.filterHandler(filters, where);

    const [users, meta] = await this.prisma.client.user
      .paginate({
        where,
        include: {
          userAccount: true,
          userDetails: true,
        },
      })
      .withPages({
        limit: 10,
        page: page,
        includePageCount: true,
      });

    return { users, meta };
  }

  /**
   * Counts all users that match the provided filters.
   *
   * - Uses the same filtering logic as `findAll`.
   * - Supports search terms and role-based filtering.
   *
   * @param filters - Filter conditions including role and search terms.
   * @returns The total number of users matching the filters.
   * @throws InternalServerErrorException if counting fails unexpectedly.
   */

  @Log({
    logArgsMessage: ({ filters }) =>
      `Count all users filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result) => `User count=${result}`,
    logErrorMessage: (err) => `Failed to count users | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Counting users failed due to transaction deadlock',
      ),
  })
  async countAll(@LogParam('filters') filters: FilterUserDto): Promise<number> {
    const where: Prisma.UserWhereInput = {};

    this.filterHandler(filters, where);

    const count = await this.prisma.client.user.count({ where });
    return count;
  }

  /**
   * Finds a user by their ID, including related records like userAccount and userDetails.
   *
   * @param id - UUID of the user.
   * @returns The user and their related entities.
   * @throws BadRequestException if the ID format is invalid.
   * @throws NotFoundException if the user does not exist.
   * @throws InternalServerErrorException for all other errors.
   */

  @Log({
    logArgsMessage: ({ id }) => `Find user by ID=${id}`,
    logSuccessMessage: (result) => `Found user id=${result.id}`,
    logErrorMessage: (err, { id }) =>
      `Failed to find user id=${id} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (_, { id }) =>
      new NotFoundException(`User with ID ${id} not found`),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Finding user failed due to transaction deadlock',
      ),
  })
  async findOne(@LogParam('id') id: string): Promise<UserWithRelations> {
    const user = await this.prisma.client.user.findUnique({
      where: {
        id,
      },
      include: {
        userAccount: true,
        userDetails: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }

  /**
   * Toggles a user's status between active and disabled, and updates related authentication metadata.
   *
   * @param userId - The ID of the user whose status will be toggled.
   *
   * @throws {NotFoundException} If the user or their user account does not exist.
   * @remarks
   * - If the user is currently active, this will set the `disabledAt` timestamp to disable them.
   * - If the user is currently disabled, this will set `disabledAt` to `null` to enable them.
   * - The user's status in the authentication provider will also be updated accordingly.
   */
  @Log({
    logArgsMessage: ({ userId }) => `Update status for userId=${userId}`,
    logSuccessMessage: (result, { userId }) =>
      `Updated status for userId=${userId}, message="${result.message}"`,
    logErrorMessage: (err, { userId }) =>
      `Failed to update status for userId=${userId} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (msg, { userId }) =>
      new NotFoundException(`User or account with ID ${userId} not found`),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Updating user status failed due to transaction deadlock',
      ),
  })
  async updateStatus(
    @LogParam('userId') userId: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: {
        disabledAt: true,
        userAccount: { select: { authUid: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.userAccount) {
      throw new NotFoundException(`User account for ${userId} not found`);
    }

    const isDisabled = !!user.disabledAt;
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { disabledAt: isDisabled ? null : new Date() },
    });

    await this.authService.updateMetadata(user.userAccount.authUid, {
      status: isDisabled ? 'active' : 'disabled',
    });

    const message = isDisabled
      ? 'User enabled successfully.'
      : 'User disabled successfully.';

    return { message };
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   *
   * This method:
   * - Uses the user's Supabase Auth UID (`user.id`) to locate the corresponding account
   * - Includes related entities like `UserDetails`, `StudentDetails`, and `StaffDetails`
   * - Constructs and returns a flattened DTO depending on the user's role
   *
   * @param authId - The Supabase Auth UID of the authenticated user.
   * @returns One of:
   * - `UserStudentDetailsDto` if the user is a student
   * - `UserStaffDetailsDto` if the user is a mentor/admin
   * - Fallback: `UserDetailsFullDto` if role-based detail is missing
   *
   * @throws UnauthorizedException If the `authUid` is missing or invalid
   * @throws NotFoundException If no user account is found
   * @throws InternalServerErrorException If an unexpected error occurs
   */
  @Log({
    logArgsMessage: ({ authId }) => `Get profile for authId=${authId}`,
    logSuccessMessage: (result) => `Retrieved profile for userId=${result.id}`,
    logErrorMessage: (err, { authId }) =>
      `Failed to get profile for authId=${authId} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException('User not found'),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Fetching profile failed due to transaction deadlock',
      ),
  })
  async getMe(
    @LogParam('authId') authId: string,
  ): Promise<UserStudentDetailsDto | UserStaffDetailsDto> {
    const account = await this.prisma.client.userAccount.findUnique({
      where: { authUid: authId },
      include: {
        user: {
          include: {
            userDetails: true,
            staffDetails: true,
            studentDetails: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('User not found');
    }

    const { email } = account;
    const {
      id,
      firstName,
      middleName,
      lastName,
      role,
      userDetails,
      studentDetails,
      staffDetails,
    } = account.user;

    const basicDetails: Partial<UserDetailsFullDto> = {
      id,
      email,
      firstName,
      middleName,
      lastName,
      role,
      userDetails,
    };

    if (role === 'student') {
      return {
        ...basicDetails,
        studentDetails,
      } as UserStudentDetailsDto;
    }

    return {
      ...basicDetails,
      staffDetails,
    } as UserStaffDetailsDto;
  }

  /**
   * Deletes a user either softly or permanently.
   *
   * - If `directDelete` is true, the user is permanently deleted without checking `deletedAt`.
   * - If `directDelete` is false or undefined:
   *   - If `deletedAt` is null, it sets the current date to softly delete the user.
   *   - If `deletedAt` is already set, the user is permanently deleted.
   *
   * All the user details and the supabase auth account will be deleted from the cloud on hard delete
   *
   * @param id - The ID of the user to delete.
   * @param directDelete - Whether to skip soft delete and directly remove the user.
   * @returns A message indicating the result.
   */
  @Log({
    logArgsMessage: ({ id, directDelete }) =>
      `Remove user id=${id}, directDelete=${directDelete}`,
    logSuccessMessage: (result, { id }) =>
      `Removed user id=${id}, message="${result.message}"`,
    logErrorMessage: (err, { id }) =>
      `Failed to remove user id=${id} | Error=${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: (msg, { id }) =>
      new NotFoundException(`User with ID ${id} not found`),
    [PrismaErrorCode.TransactionDeadlock]: () =>
      new InternalServerErrorException(
        'Deleting user failed due to transaction deadlock',
      ),
  })
  async remove(
    @LogParam('id') id: string,
    directDelete?: boolean,
  ): Promise<{ message: string }> {
    const user = await this.prisma.client.user.findUniqueOrThrow({
      where: { id },
      include: {
        userAccount: true,
      },
    });

    if (!directDelete && !user.deletedAt) {
      await this.prisma.client.user.update({
        where: { id: id },
        data: {
          deletedAt: new Date(),
        },
      });

      if (user.userAccount)
        await this.authService.updateMetadata(user.userAccount.authUid, {
          status: 'deleted',
        });

      return {
        message: 'User has been soft deleted',
      };
    }

    if (user.userAccount)
      await this.authService.delete(user.userAccount.authUid);

    await this.prisma.client.user.delete({
      where: { id: id },
    });

    return {
      message: 'User has been permanently deleted',
    };
  }
}
