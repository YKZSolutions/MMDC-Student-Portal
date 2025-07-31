import { Role } from '@prisma/client';
import { UserMetadata as SupabaseUserMetadata } from '@supabase/supabase-js';

export interface UserMetadata extends SupabaseUserMetadata {
  role: Role;
  user_id: string;
}
