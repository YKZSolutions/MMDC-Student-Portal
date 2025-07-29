import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_ENV === 'local'
    ? import.meta.env.VITE_SUPABASE_LOCAL_URL
    : import.meta.env.VITE_SUPABASE_CLOUD_URL

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ENV === 'local'
    ? import.meta.env.VITE_SUPABASE_LOCAL_ANON_KEY
    : import.meta.env.VITE_SUPABASE_CLOUD_PUBLISH_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
