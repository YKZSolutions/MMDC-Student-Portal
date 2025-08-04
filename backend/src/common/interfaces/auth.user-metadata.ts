import { Role, UserStatus } from '@prisma/client';
import {
  UserMetadata as SupabaseUserMetadata,
  User,
} from '@supabase/supabase-js';

export interface AuthUser extends User {
  user_metadata: UserMetadata;
}

export interface UserMetadata extends SupabaseUserMetadata {
  role?: Role;
  status?: UserStatus;
  user_id?: string;
}
