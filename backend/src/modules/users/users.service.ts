import { type ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { AuthService } from '@/modules/auth/auth.service';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CreateUserFullDto,
  CreateUserStaffDto,
  CreateUserStudentDto,
} from './dto/create-user.dto';
import {
  UpdateUserStudentDto,
  UpdateUserStaffDto,
} from './dto/update-user-details.dto';
import { Prisma, Role } from '@prisma/client';
import { isUUID } from 'class-validator';
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
import { AuthUser } from '@/common/interfaces/auth.user-metadata';

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
   * It also sets the user's metadata which will be used in handling of role and status guards.
   * If Prisma creation fails, it will delete the Supabase account.
   *
   * @param credentials - The user's login credentials.
   * @param role - Role of the user (student, admin, etc).
   * @param callback - A function to create the Prisma user, passed the Supabase user object.
   * @returns The created Prisma user.
   * @throws BadRequestException if user creation in DB fails.
   */
  private async accountCreationHandler(
    credentials: CreateUserFullDto['credentials'],
    role: Role,
    callback: (user: User) => Promise<UserDto>,
  ) {
    const account = await this.authService.create(
      role,
      credentials.email,
      credentials.password,
    );
    try {
      const user = await callback(account);

      await this.authService.updateMetadata(account.id, {
        user_id: user.id,
      });

      return user;
    } catch (err) {
      this.logger.error(`Error creating user in DB: ${err}`);
      if (
        err instanceof Prisma.PrismaClientValidationError ||
        err instanceof Prisma.PrismaClientKnownRequestError
      ) {
        await this.authService.delete(account.id);
      }
      throw new BadRequestException('Error creating user in DB');
    }
  }

  /**
   * Creates a new user with associated Supabase account and database records.
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
    try {
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

          if (
            !('role' in createUserDto) &&
            'specificDetails' in createUserDto
          ) {
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
    } catch (err) {
      this.logger.error(`Failed to create user: ${err}`);

      throw new InternalServerErrorException('Failed to create the user');
    }
  }

  async inviteUser(inviteUserDto: InviteUserDto) {
    return await this.prisma.client.$transaction(async (tx) => {
      try {
        const account = await this.authService.invite(
          inviteUserDto.email,
          inviteUserDto.role,
        );

        const user = await tx.user.create({
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
      } catch (e) {
        this.logger.error(`Failed to invite user: ${e}`);
        throw new InternalServerErrorException('Failed to invite the user');
      }
    });
  }

  /**
   * Updates a user’s basic personal details (first name, middle name, last name).
   *
   * @param userId - The UUID of the user.
   * @param role - The Role of the user ("student", "mentor", "admin").
   * @param updateUserDto - Partial fields to update.
   * @returns The updated user object.
   * @throws InternalServerErrorException if update fails.
   */
  async updateUserDetails(
    userId: string,
    role: Role,
    updateUserDto: UpdateUserStudentDto | UpdateUserStaffDto,
  ) {
    try {
      if (!userId) throw new BadRequestException('User ID is required');
      if (!role) throw new BadRequestException('User role is required');

      const {
        user: userDto,
        userDetails: userDetailsDto,
        specificDetails: specificDetailsDto,
      } = updateUserDto;

      const baseUserData: Prisma.UserUpdateInput = {
        ...userDto,
        userDetails: {
          update: userDetailsDto,
        },
      };

      if (!('role' in updateUserDto) && 'specificDetails' in updateUserDto) {
        baseUserData.studentDetails = {
          update: specificDetailsDto,
        };
      } else if (
        (role === 'mentor' || role === 'admin') &&
        'specificDetails' in updateUserDto
      ) {
        baseUserData.staffDetails = {
          update: specificDetailsDto,
        };
      }

      return await this.prisma.client.user.update({
        where: { id: userId },
        data: baseUserData,
      });
    } catch (err) {
      this.logger.error(`Failed to update user db entry: ${err}`);
      throw new InternalServerErrorException('Failed to update the user in DB');
    }
  }

  /**
   * Finds all users that match provided filters (e.g. role, search keyword) with pagination.
   *
   * @param filters - Filter and pagination options.
   * @returns Paginated list of users with metadata.
   * @throws BadRequestException or InternalServerErrorException based on the failure type.
   */
  async findAll(filters: FilterUserDto): Promise<PaginatedUsersDto> {
    try {
      const where: Prisma.UserWhereInput = {};
      const page: FilterUserDto['page'] = Number(filters?.page) || 1;

      where.deletedAt = null;

      if (filters.role) where.role = filters.role;

      if (filters.search?.trim()) {
        const searchTerms = filters.search
          .trim()
          .split(/\s+/) // split by whitespace
          .filter(Boolean);

        where.AND = searchTerms.map((term) => ({
          OR: [
            {
              firstName: { contains: term, mode: Prisma.QueryMode.insensitive },
            },
            {
              lastName: { contains: term, mode: Prisma.QueryMode.insensitive },
            },
            {
              userAccount: {
                email: { contains: term, mode: Prisma.QueryMode.insensitive },
              },
            },
          ],
        }));
      }

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
    } catch (error) {
      this.logger.error(`Failed to fetch all users: ${error}`);

      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException('Failed to fetch all users');
    }
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
    try {
      if (!isUUID(id)) {
        throw new BadRequestException(`Invalid user ID format: ${id}`);
      }

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
    } catch (error) {
      this.logger.error(`Failed to fetch user: ${error}`);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  /**
   * Toggles a user's status between active and disabled, and updates related authentication metadata.
   *
   * @param userId - The ID of the user whose status will be toggled.
   *
   * @throws {NotFoundException} If the user or their user account does not exist.
   * @throws {InternalServerErrorException} If an unexpected error occurs.
   *
   * @remarks
   * - If the user is currently active, this will set the `disabledAt` timestamp to disable them.
   * - If the user is currently disabled, this will set `disabledAt` to `null` to enable them.
   * - The user's status in the authentication provider will also be updated accordingly.
   */
  async updateStatus(userId: string): Promise<{ message: string }> {
    try {
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

      return {
        message: isDisabled
          ? 'User enabled successfully.'
          : 'User disabled successfully.',
      };
    } catch (error) {
      this.logger.error(`Error updating status for user ${userId}`);

      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'An unexpected error has occurred',
      );
    }
  }

  /**
   * Retrieves the profile of the currently authenticated user.
   *
   * This method:
   * - Uses the user's Supabase Auth UID (`user.id`) to locate the corresponding account
   * - Includes related entities like `UserDetails`, `StudentDetails`, and `StaffDetails`
   * - Constructs and returns a flattened DTO depending on the user's role
   *
   * @param user - The authenticated user from Supabase Auth context
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
    user: AuthUser,
  ): Promise<UserDetailsFullDto | UserStudentDetailsDto | UserStaffDetailsDto> {
    try {
      const authUid = user.id;

      if (!authUid) {
        throw new UnauthorizedException('User not authorized');
      }

      const account = await this.prisma.client.userAccount.findUnique({
        where: { authUid: authUid },
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
    } catch (error) {
      this.logger.error(`Error fetching user details`, error);

      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'An unexpected error has occurred',
      );
    }
  }

  /**
   * Deletes a user either softly or permanently.
   *
   * - If `directDelete` is true, the user is permanently deleted without checking `deletedAt`.
   * - If `directDelete` is false or undefined:
   *   - If `deletedAt` is null, it sets the current date to soft delete the user.
   *   - If `deletedAt` is already set, the user is permanently deleted.
   *
   * All of the user details and the supabase auth account will be deleted from the cloud on hard delete
   *
   * @param id - The ID of the user to delete.
   * @param directDelete - Whether to skip soft delete and directly remove the user.
   * @returns A message indicating the result.
   */
  async remove(
    id: string,
    directDelete?: boolean,
  ): Promise<{ message: string }> {
    try {
      const user = await this.prisma.client.user.findFirstOrThrow({
        where: { id: id },
        include: {
          userAccount: true,
        },
      });

      if (!directDelete) {
        if (!user.deletedAt) {
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
      }

      if (user.userAccount)
        await this.authService.delete(user.userAccount.authUid);

      await this.prisma.client.user.delete({
        where: { id: id },
      });

      return {
        message: 'User has been permanently deleted',
      };
    } catch (err) {
      this.logger.error(err);
      if (err instanceof Prisma.PrismaClientKnownRequestError)
        if (err.code === 'P2025') throw new NotFoundException('User not found');

      if (err instanceof HttpException) throw err;

      throw new InternalServerErrorException('Error deleting the user');
    }
  }
}
