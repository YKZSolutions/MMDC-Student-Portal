import { UserMetadata } from '@/common/interfaces/auth.user-metadata';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from '@/config/env.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly siteUrl: string;

  constructor(
    private supabase: SupabaseService,
    private configService: ConfigService<EnvVars>,
  ) {
    this.siteUrl = this.configService.get('SITE_URL')!;
  }

  async create(email: string, password: string, role: Role) {
    const account = await this.supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: role,
        status: 'active',
      },
    });

    if (account.error) {
      this.logger.error(`Failed to create account: ${account.error.message}`);
      throw new BadRequestException('Error creating Supabase account');
    }

    return account.data.user;
  }

  async invite(email: string, role: Role) {
    const account = await this.supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role: role,
        status: 'active',
      },
      redirectTo: `${this.siteUrl}/update-password`,
    });

    if (account.error) {
      this.logger.error(`Failed to invite user: ${account.error.message}`);
      throw new BadRequestException('Error inviting user to Supabase');
    }

    // The data object will contain the invited user's information.
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
}
