import { client } from '../api/client/client.gen'
import { supabase } from './supabase-client'

client.interceptors.request.use(async (req) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  req.headers.set('Authorization', `Bearer ${session?.access_token}`)
  return req
})
