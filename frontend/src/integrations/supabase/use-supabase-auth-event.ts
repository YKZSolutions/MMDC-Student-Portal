import { useEffect } from 'react'
import { client } from '../api/client/client.gen'
import { supabase } from './supabase-client'

export const useSupabaseAuthEvent = () => {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token) {
          console.log('Refreshing auth token...')
          client.setConfig({
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })
        } else {
          client.setConfig({
            headers: {
              Authorization: null,
            },
          })
        }
      },
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])
}
