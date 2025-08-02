import type { Role } from '@/integrations/api/client'
import { supabase } from '@/integrations/supabase/supabase-client'
import type { User } from '@supabase/supabase-js'
import { useRouteContext } from '@tanstack/react-router'

interface AuthUser {
  user: User
  role: Role
}

const login = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

const logout = async () => {
  return await supabase.auth.signOut()
}

export function useAuth<Route extends 'protected'>(
  route: Route,
): { authUser: AuthUser; login: typeof login; logout: typeof logout }

export function useAuth<Route extends string>(
  route?: Exclude<Route, 'protected'>,
): { authUser: null; login: typeof login; logout: typeof logout }

export function useAuth(route?: string) {
  if (route === 'protected') {
    const { authUser } = useRouteContext({ from: '/(protected)' })
    return {
      authUser,
      login,
      logout,
    }
  }

  return {
    authUser: null,
    login,
    logout,
  }
}
