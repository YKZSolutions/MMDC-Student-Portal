import { UserMetadata } from '@/common/interfaces/auth.user-metadata';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private supabase: SupabaseService) {}

  async create(email: string, password: string, role: Role) {
    const account = await this.supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: role,
      },
    });

    if (account.error) {
      this.logger.error(`Failed to create account: ${account.error.message}`);
      throw new BadRequestException('Error creating Supabase account');
    }

    return account.data.user;
  }

  async updateMetadata(id: string, metadata: Partial<UserMetadata>) {
    const account = await this.supabase.auth.admin.updateUserById(id, {
      user_metadata: metadata,
    });

    if (account.error) {
      this.logger.error(`Failed to create account: ${account.error.message}`);
      throw new BadRequestException('Error creating Supabase account');
    }

    return account.data.user;
  }

  /*TODO: possibly separate the email and password updates
     with validations and confirmation for security
   */
  async updateAccountCredentials(
    userId: string,
    email?: string,
    password?: string,
  ) {
    if (!email && !password) {
      throw new BadRequestException('Nothing to update');
    }

    try {
      return this.supabase.auth.admin.updateUserById(userId, {
        email: email,
        password: password,
      });
    } catch (err) {
      this.logger.error(`Failed to update user account credentials: ${err}`);
      throw new InternalServerErrorException(
        'Failed to update the user account credentials',
      );
    }
  }
}
