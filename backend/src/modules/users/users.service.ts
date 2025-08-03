import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserWithAccountDto } from './dto/create-user.dto';
import { UpdateUserDetailsDto } from './dto/update-user-details.dto';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from '@/modules/auth/auth.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  create(createUserDto: CreateUserWithAccountDto) {
    try {
      return this.prisma.$transaction(async (tx) => {
        const account = await this.authService.create(
          createUserDto.credentials?.email || 'test@email',
          createUserDto.credentials?.password || '1234',
          createUserDto.role,
        );

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

        await this.authService.updateMetadata(account.id, {
          user_id: user.id,
        });

        return { user, userAccount };
      });
    } catch (err) {
      this.logger.error(`Failed to create user db entry: ${err}`);
      throw new InternalServerErrorException('Failed to create the user in DB');
    }
  }

  updateUserDetails(userId: string, updateUserDto: UpdateUserDetailsDto) {
    //TODO: Include other fields later on if there are updates in the schema
    try {
      return this.prisma.user.update({
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

  // findAll() {
  //   return `This action returns all users`;
  // }

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
