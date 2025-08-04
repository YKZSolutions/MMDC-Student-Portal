import {
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { AuthUser, UserMetadata } from '@/common/interfaces/auth.user-metadata';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { ApiResponse } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { AuthMetadataDto } from './dto/auth-metadata.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get(':uid/metadata')
  @Roles(Role.ADMIN)
  @ApiResponse({ type: AuthMetadataDto })
  @ApiException(() => NotFoundException)
  @ApiException(() => InternalServerErrorException)
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
}
