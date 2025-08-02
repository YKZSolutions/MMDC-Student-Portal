import { type ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { CustomPrismaService } from 'nestjs-prisma';
import { CreateUserWithAccountDto } from './dto/create-user.dto';

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

  async findAll() {
    try {
      const [users, meta] = await this.prisma.client.user.paginate().withPages({
        limit: 10,
        page: 1,
        includePageCount: true,
      });

      return { users, meta };
    } catch (error) {
      this.logger.error(`Failed to fetch all users: ${error}`);
      throw new InternalServerErrorException('Failed to fetch all users');
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
