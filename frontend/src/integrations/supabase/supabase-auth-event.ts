import { client } from '../api/client/client.gen'
import { supabase } from './supabase-client'

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.access_token) {
    console.log('Refreshing auth token...')
    client.setConfig({
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })
  }
})
