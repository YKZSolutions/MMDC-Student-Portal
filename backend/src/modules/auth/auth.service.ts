import { UserMetadata } from '@/common/interfaces/auth.user-metadata';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from '@/config/env.schema';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';

@Injectable()
export class AuthService {
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
  @Log({
    logArgsMessage: ({ role, email }) =>
      `Create supabase user email=${email} role=${role}`,
    logSuccessMessage: (result, _) =>
      `Create supabase user account email=${result.email} role=${result.role}`,
    logErrorMessage: (err, { email, role }) =>
      `Create supabase user email=${email} role=${role}| Error: ${err.message}`,
  })
  async create(
    @LogParam('role') role: Role,
    @LogParam('email') email: string,
    password?: string,
  ) {
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
      throw account.error;
    }

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
  @Log({
    logArgsMessage: ({ email }) => `Login supabase user email=${email}`,
    logSuccessMessage: (_, { email }) => `Login supabase user email=${email}`,
    logErrorMessage: (err, { email }) =>
      `Login supabase user email=${email} | Error: ${err.message}`,
  })
  async login(@LogParam('email') email: string, password: string) {
    const user = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (user.error) throw new UnauthorizedException('Wrong login credentials');

    return user.data.session.access_token;
  }

  @Log({
    logArgsMessage: ({ email, role }) =>
      `Invite supabase user email=${email} role=${role}`,
    logSuccessMessage: (result, { email, role }) =>
      `Invite supabase user email=${email} role=${role} | id=${result.id}`,
    logErrorMessage: (err, { email, role }) =>
      `Invite supabase user email=${email} role=${role} | Error=${err.message}`,
  })
  async invite(@LogParam('email') email: string, @LogParam('role') role: Role) {
    const account = await this.supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role: role,
        status: 'active',
      },
      redirectTo: `${this.siteUrl}/update-password`,
    });

    if (account.error) {
      throw account.error;
    }

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
  @Log({
    logArgsMessage: ({ uid }) => `Update supabase user metadata uid=${uid}`,
    logSuccessMessage: (result, { uid }) =>
      `Update supabase user metadata uid=${uid} | id=${result.id}`,
    logErrorMessage: (err, { uid }) =>
      `Update supabase user metadata uid=${uid} | Error=${err.message}`,
  })
  async updateMetadata(
    @LogParam('uid') uid: string,
    metadata: Partial<UserMetadata>,
  ) {
    const account = await this.supabase.auth.admin.updateUserById(uid, {
      user_metadata: metadata,
    });

    if (account.error) {
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
  @Log({
    logArgsMessage: ({ uid }) => `Delete supabase user uid=${uid}`,
    logSuccessMessage: (_, { uid }) => `Delete supabase user uid=${uid}`,
    logErrorMessage: (err, { uid }) =>
      `Delete supabase user uid=${uid} | Error: ${err.message}`,
  })
  async delete(@LogParam('uid') uid: string) {
    const account = await this.supabase.auth.admin.deleteUser(uid);

    if (account.error) {
      throw new BadRequestException('Error deleting Supabase account');
    }
  }
}
