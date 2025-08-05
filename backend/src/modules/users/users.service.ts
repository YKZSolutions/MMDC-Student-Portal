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
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateUserWithAccountDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { PaginatedUsersDto } from './dto/paginated-user.dto';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { UserWithRelations } from './dto/user-with-relations.dto';
import { InviteUserDto } from '@/modules/users/dto/invite-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserWithAccountDto) {
    try {
      const account = await this.authService.create(
        createUserDto.credentials?.email || 'test@email',
        createUserDto.credentials?.password || '1234',
        createUserDto.role,
      );

      return await this.prisma.client.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            firstName: createUserDto.firstName,
            middleName: createUserDto.middleName,
            lastName: createUserDto.lastName,
            role: createUserDto.role,
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
    } catch (err) {
      this.logger.error(`Failed to create user: ${err}`);

      //TODO: implement deleting the account that was just created upon error
      // await this.authService.delete(account.id);

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

  async updateUserDetails(userId: string, updateUserDto: UpdateUserDetailsDto) {
    //TODO: Include other fields later on if there are updates in the schema
    //TODO: Other user details are not included, would be updated if implemented in the create method
    try {
      return await this.prisma.client.user.update({
        where: { id: userId },
        data: {
          firstName: updateUserDto.firstName,
          middleName: updateUserDto.middleName,
          lastName: updateUserDto.lastName,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to update user db entry: ${err}`);
      throw new InternalServerErrorException('Failed to update the user in DB');
    }
  }

  async findAll(filters: FilterUserDto): Promise<PaginatedUsersDto> {
    try {
      const where: Prisma.UserWhereInput = {};
      const page: FilterUserDto['page'] = Number(filters?.page) || 1;

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

      where.disabledAt = null;

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
   * Disables a user and updates related authentication metadata.
   *
   * @param userId - The ID of the user to disable.
   *
   * @throws {NotFoundException} If the user or their user account does not exist.
   * @throws {BadRequestException} If the user is already disabled.
   * @throws {InternalServerErrorException} If an unexpected error occurs.
   */
  async disableUser(userId: string) {
    try {
      const user = await this.prisma.client.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (user.disabledAt) {
        throw new BadRequestException('User already disabled');
      }

      const userAccount = await this.prisma.client.userAccount.findUnique({
        where: { userId: userId },
      });

      if (!userAccount) {
        throw new NotFoundException(`User account for ID ${userId} not found`);
      }

      await this.prisma.client.user.update({
        where: { id: userId },
        data: { disabledAt: new Date() },
      });

      await this.authService.updateMetadata(userAccount.authUid, {
        status: 'disabled',
      });

      this.logger.log(`User with ID ${userId} was successfully disabled.`);
    } catch (error) {
      this.logger.error('Error disabling user');

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('An unexpected error has occured');
    }
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
