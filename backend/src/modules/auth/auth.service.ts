import { UserMetadata } from '@/common/interfaces/auth.user-metadata';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
  async create(role: Role, email: string, password?: string) {
    const method = 'create';
    this.logger.log(`[${method}] START: email=${email}, role=${role}`);

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
      this.logger.error(
        `[${method}] FAIL: email=${email}, reason=${account.error.message}`,
        account.error.stack,
      );
      throw account.error;
    }

    const userId = account.data?.user?.id ?? 'unknown';
    this.logger.log(`[${method}] SUCCESS: created user id=${userId}`);

    return account.data.user;
  }

  /**
   * Test function that logs in the user via email and password
   *
   * @param email - The email address of the user.
   * @param password - The password of the user.
   * @returns The user's session token.
   * @throws UnauthorizedException if the login fails (wrong email or password).
   */
  async login(email: string, password: string) {
    const user = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (user.error) throw new UnauthorizedException('Wrong login credentials');

    return user.data.session.access_token;
  }

  async invite(email: string, role: Role) {
    const method = 'invite';
    this.logger.log(`[${method}] START: email=${email}, role=${role}`);

    const account = await this.supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role: role,
        status: 'active',
      },
      redirectTo: `${this.siteUrl}/update-password`,
    });

    if (account.error) {
      this.logger.error(
        `[${method}] FAIL: email=${email}, reason=${account.error.message}`,
        account.error.stack,
      );
      throw account.error;
    }

    const userId = account.data?.user?.id ?? 'unknown';
    this.logger.log(`[${method}] SUCCESS: invited user id=${userId}`);

    return account.data.user;
  }

  /**
   * Updates the metadata of an existing Supabase user account.
   *
   * @param uid - The Supabase UID of the user to update.
   * @param metadata - Partial user metadata to be merged into the existing data.
   * @returns The updated Supabase user object.
   * @throws BadRequestException if the update operation fails.
   */
  async updateMetadata(uid: string, metadata: Partial<UserMetadata>) {
    const method = 'updateMetadata';
    this.logger.log(`[${method}] START: uid=${uid}`);

    const account = await this.supabase.auth.admin.updateUserById(uid, {
      user_metadata: metadata,
    });

    if (account.error) {
      this.logger.error(
        `[${method}] FAIL: uid=${uid}, reason=${account.error.message}`,
        account.error.stack,
      );
      throw new BadRequestException('Error creating Supabase account');
    }

    const updatedUserId = account.data?.user?.id ?? uid;
    this.logger.log(`[${method}] SUCCESS: updated user id=${updatedUserId}`);

    return account.data.user;
  }

  /**
   * Deletes a Supabase user account by UID.
   *
   * @param uid - The UID of the user to delete.
   * @throws BadRequestException if the deletion fails.
   */
  async delete(uid: string) {
    const method = 'delete';
    this.logger.log(`[${method}] START: uid=${uid}`);

    const account = await this.supabase.auth.admin.deleteUser(uid);

    if (account.error) {
      this.logger.error(
        `[${method}] FAIL: uid=${uid}, reason=${account.error.message}`,
        account.error.stack,
      );
      throw new BadRequestException('Error deleting Supabase account');
    }

    this.logger.log(`[${method}] SUCCESS: deleted user uid=${uid}`);
  }
}
