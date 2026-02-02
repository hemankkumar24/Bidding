declare module '../lib/supabase.js' {
  import { SupabaseClient } from '@supabase/supabase-js'
  export const supabase: SupabaseClient
}