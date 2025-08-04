import type { Role } from '@/integrations/api/client'
import { supabase } from '@/integrations/supabase/supabase-client'
import type {AuthError, AuthResponse, User, UserResponse} from '@supabase/supabase-js'
import { useRouteContext } from '@tanstack/react-router'

/**
 * Represents an authenticated user with their associated role
 * @interface AuthUser
 * @property {User} user - The Supabase user object
 * @property {Role} role - The user's role in the application
 */

interface AuthUser {
  user: User
  role: Role
}

/**
 * Handles user login with email and password
 * @async
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<AuthResponse>} The authentication response from Supabase
 */
const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  return await supabase.auth.signInWithPassword({ email, password })
}

/**
 * Handles user logout
 * @async
 * @returns {Promise<{error: Error | null}>} Error object if logout fails
 */
const logout = async (): Promise<{ error: Error | null }> => {
  return await supabase.auth.signOut()
}

/**
 * Initiates a password reset flow by sending a reset email
 * @async
 * @param {string} email - The email address to send the reset link to
 * @returns {Promise<{data: {} | null, error: AuthError | null}>} Result of the password reset request
 */
const requestPasswordReset = async (
  email: string,
): Promise<{ data: {} | null; error: AuthError | null }> => {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/update-password`,
  })
}

/**
 * Updates the authenticated user's password
 * @async
 * @param {string} newPassword - The new password to set
 * @returns {Promise<UserResponse>} The updated user response
 */
const updateUserPassword = async (
  newPassword: string,
): Promise<UserResponse> => {
  // Supabase automatically handles the session from the URL's access token
  return await supabase.auth.updateUser({
    password: newPassword,
  })
}


/**
 * Custom React hook for authentication functionality
 * 
 * @template Route - The route type ('protected' or other routes)
 * @param {Route} route - The route type to determine authentication context
 * @returns {Object} Authentication context with user and auth methods
 * @returns {AuthUser | null} authUser - The authenticated user or null if not on protected route
 * @returns {Function} login - Function to handle user login
 * @returns {Function} logout - Function to handle user logout
 * @returns {Function} requestPasswordReset - Function to handle password reset requests
 * 
 * @example
 * // In a protected route component
 * const { authUser, login } = useAuth('protected');
 * 
 * @example
 * // In a public route component
 * const { login } = useAuth();
 */
export function useAuth<Route extends 'protected'>(route: Route): {
  authUser: AuthUser;
  login: typeof login;
  logout: typeof logout;
  requestPasswordReset: typeof requestPasswordReset
  updateUserPassword: typeof updateUserPassword
}

/**
 * Overload for non-protected routes
 * @template Route - The route type (excluding 'protected')
 * @param {Exclude<Route, 'protected'>} [route] - Optional route parameter
 * @returns {Object} Authentication context with null user and auth methods
 */
export function useAuth<Route extends string>(route?: Exclude<Route, 'protected'>): {
  authUser: null;
  login: typeof login;
  logout: typeof logout;
  requestPasswordReset: typeof requestPasswordReset
  updateUserPassword: typeof updateUserPassword
}

export function useAuth(route?: string) {
  if (route === 'protected') {
    const { authUser } = useRouteContext({ from: '/(protected)' })
    return {
      authUser,
      login,
      logout,
      requestPasswordReset,
      updateUserPassword
    }
  }

  return {
    authUser: null,
    login,
    logout,
    requestPasswordReset,
    updateUserPassword
  }
}
