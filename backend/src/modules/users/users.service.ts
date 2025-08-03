import { type ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
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
import { User } from '@supabase/supabase-js';
import { isUUID } from 'class-validator';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateUserWithAccountDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { PaginatedUsersDto } from './dto/paginated-user.dto';
import { UserWithRelations } from './dto/user-with-relations.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(createUserDto: CreateUserWithAccountDto, account: User) {
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            firstName: createUserDto.firstName,
            middleName: createUserDto.middleName,
            lastName: createUserDto.lastName,
            role: createUserDto.role,
          },
        });

        const userAccount = await tx.userAccount.create({
          data: {
            userId: user.id,
            authUid: account.id,
            email: account.email,
          },
        });

        return { user, userAccount };
      });
    } catch (err) {
      this.logger.error(`Failed to create user db entry: ${err}`);
      throw new InternalServerErrorException('Failed to create the user in DB');
    }
  }

  async findAll(filters: FilterUserDto): Promise<PaginatedUsersDto> {
    try {
      const where = {
        ...(filters.role && { role: filters.role }),

        ...(filters.search && {
          OR: [
            {
              firstName: {
                contains: filters.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              lastName: {
                contains: filters.search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              userAccount: {
                email: {
                  contains: filters.search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          ],
        }),
      };

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
          page: 1,
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

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
