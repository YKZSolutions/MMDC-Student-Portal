import { User } from '@supabase/supabase-js';
import { AuthUser } from '../interfaces/auth.user-metadata';

declare module 'express' {
  interface Request {
    user?: AuthUser;
  }
}
