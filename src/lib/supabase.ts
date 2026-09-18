import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env ausente — funcionalidades limitadas');
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY ausentes. Configure .env');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
