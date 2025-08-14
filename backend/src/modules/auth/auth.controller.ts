import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthUser, UserMetadata } from '@/common/interfaces/auth.user-metadata';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { AuthMetadataDto } from './dto/auth-metadata.dto';
import { AuthService } from './auth.service';
import { UserCredentialsDto } from '../users/dto/user-credentials.dto';
import { Session } from '@supabase/supabase-js';
import { Public } from '@/common/decorators/auth.decorator';
import { StatusBypass } from '@/common/decorators/user-status.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Get User Account Metadata
   *
   * @remarks Retrieves the supabase auth account's metadata based on the uid given
   *
   * @param {string} uid - Query parameters for filtering, sorting, and pagination.
   * @returns {AuthMetadataDto} The user's metadata
   *
   */
  @Get(':uid/metadata')
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: AuthMetadataDto })
  @ApiException(() => NotFoundException, {
    description: 'If the uid provided is invalid',
  })
  @ApiException(() => InternalServerErrorException, {
    description: 'If an unexpected server error has occured',
  })
  async getMetadata(@Param('uid') uid: string): Promise<AuthMetadataDto> {
    try {
      const data = await this.supabase.auth.admin.getUserById(uid);

      if (data.error) throw new NotFoundException('User not found');

      const user: AuthUser = data.data.user;

      return user.user_metadata;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  /**
   * Login Account
   *
   * @remarks Login via email & password
   */
  @Post('login')
  @Public()
  @StatusBypass()
  @ApiException(() => [BadRequestException, UnauthorizedException])
  async login(@Body() credentials: UserCredentialsDto): Promise<string> {
    if (!credentials.password)
      throw new BadRequestException('Password not found');

    return await this.authService.login(
      credentials.email,
      credentials.password,
    );
  }
}
