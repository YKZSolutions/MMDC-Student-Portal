import { type ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { AuthService } from '@/modules/auth/auth.service';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

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
  private async accountCreationHandler(
    credentials: CreateUserFullDto['credentials'],
    role: Role,
    callback: (user: User) => Promise<UserDto>,
  ) {
    const method = 'accountCreationHandler';
    this.logger.log(
      `[${method}] START: email=${credentials.email}, role=${role}`,
    );

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

      this.logger.log(
        `[${method}] SUCCESS: created user id=${user.id}, authUid=${account.id}`,
      );
      return user;
    } catch (err) {
      this.logger.error(
        `[${method}] FAIL: email=${credentials.email}, reason=${
          err instanceof Error ? err.message : String(err)
        }`,
        err instanceof Error ? err.stack : undefined,
      );
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
  async create(
    role: Role,
    createUserDto:
      | CreateUserFullDto
      | CreateUserStudentDto
      | CreateUserStaffDto,
  ) {
    const method = 'create';
    const {
      user: userDto,
      credentials,
      userDetails: userDetailsDto,
    } = createUserDto;

    this.logger.log(
      `[${method}] START: role=${role}, email=${credentials.email}`,
    );

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

    this.logger.log(`[${method}] SUCCESS: created user id=${user.id}`);
    return user;
  }

  async inviteUser(inviteUserDto: InviteUserDto) {
    const method = 'inviteUser';
    this.logger.log(
      `[${method}] START: email=${inviteUserDto.email}, role=${inviteUserDto.role}`,
    );

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

    this.logger.log(`[${method}] SUCCESS: invited user id=${result.user.id}`);
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
  async updateUserDetails(
    userId: string,
    role: Role,
    updateUserDto: UpdateUserStudentDto | UpdateUserStaffDto,
  ): Promise<UserDto> {
    const method = 'updateUserDetails';
    this.logger.log(`[${method}] START: userId=${userId}, role=${role}`);

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

    this.logger.log(`[${method}] SUCCESS: updated user id=${updatedUser.id}`);
    return updatedUser;
  }

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
  async findAll(filters: FilterUserDto): Promise<PaginatedUsersDto> {
    const method = 'findAll';
    this.logger.log(
      `[${method}] START: role=${filters.role ?? 'any'}, search="${
        filters.search ?? ''
      }", page=${filters.page ?? 1}`,
    );

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

    this.logger.log(`[${method}] SUCCESS: returned ${users.length} users`);
    return { users, meta };
  }

  async countAll(filters: FilterUserDto): Promise<number> {
    const method = 'countAll';
    this.logger.log(
      `[${method}] START: role=${filters.role ?? 'any'}, search="${
        filters.search ?? ''
      }", page=${filters.page ?? 1}`,
    );

    const where: Prisma.UserWhereInput = {};

    this.filterHandler(filters, where);

    const count = await this.prisma.client.user.count({ where });
    this.logger.log(`[${method}] SUCCESS: count=${count}`);
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
  async findOne(id: string): Promise<UserWithRelations> {
    const method = 'findOne';
    this.logger.log(`[${method}] START: id=${id}`);

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
      this.logger.error(`[${method}] FAIL: id=${id}, reason=User not found`);
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    this.logger.log(`[${method}] SUCCESS: found user id=${id}`);
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
  async updateStatus(userId: string): Promise<{ message: string }> {
    const method = 'updateStatus';
    this.logger.log(`[${method}] START: userId=${userId}`);

    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: {
        disabledAt: true,
        userAccount: { select: { authUid: true } },
      },
    });

    if (!user) {
      this.logger.error(
        `[${method}] FAIL: userId=${userId}, reason=User not found`,
      );
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.userAccount) {
      this.logger.error(
        `[${method}] FAIL: userId=${userId}, reason=User account not found`,
      );
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
    this.logger.log(
      `[${method}] SUCCESS: userId=${userId}, message="${message}"`,
    );
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
  async getMe(
    authId: string,
  ): Promise<UserStudentDetailsDto | UserStaffDetailsDto> {
    const method = 'getMe';

    this.logger.log(`[${method}] START: authId=${authId ?? 'unknown'}`);

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
      this.logger.error(
        `[${method}] FAIL: authUid=${authId}, reason=User not found`,
      );
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

    this.logger.log(`[${method}] SUCCESS: userId=${id}, role=${role}`);

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
  async remove(
    id: string,
    directDelete?: boolean,
  ): Promise<{ message: string }> {
    const method = 'remove';
    this.logger.log(
      `[${method}] START: id=${id}, directDelete=${Boolean(directDelete)}`,
    );

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

      const message = 'User has been soft deleted';
      this.logger.log(`[${method}] SUCCESS: id=${id}, message="${message}"`);
      return {
        message,
      };
    }

    if (user.userAccount)
      await this.authService.delete(user.userAccount.authUid);

    await this.prisma.client.user.delete({
      where: { id: id },
    });

    const message = 'User has been permanently deleted';
    this.logger.log(`[${method}] SUCCESS: id=${id}, message="${message}"`);
    return {
      message,
    };
  }
}
