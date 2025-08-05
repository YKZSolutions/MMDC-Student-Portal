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

  /**
   * Creates a new Supabase user account with the given email, password, and role.
   * The account will be marked as active and the email will be auto-confirmed.
   *
   * @param email - The email address for the new user.
   * @param password - The password for the new user.
   * @param role - The role to assign to the user (e.g., 'student', 'admin').
   * @returns The created Supabase user object.
   * @throws BadRequestException if the Supabase account creation fails.
   */
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

  /**
   * Updates the metadata of an existing Supabase user account.
   *
   * @param id - The Supabase UID of the user to update.
   * @param metadata - Partial user metadata to be merged into the existing data.
   * @returns The updated Supabase user object.
   * @throws BadRequestException if the update operation fails.
   */
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

  /**
   * Deletes a Supabase user account by UID.
   *
   * @param uid - The UID of the user to delete.
   * @throws BadRequestException if the deletion fails.
   */
  async delete(uid: string) {
    const account = await this.supabase.auth.admin.deleteUser(uid);

    if (account.error) {
      this.logger.error(`Failed to create account: ${account.error.message}`);
      throw new BadRequestException('Error deleting Supabase account');
    }

    this.logger.log(`Successful account deletion`);
  }
}
