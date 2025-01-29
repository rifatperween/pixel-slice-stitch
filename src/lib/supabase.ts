import { createClient } from '@supabase/supabase-js';

// Validate Supabase URL format
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.error('Invalid Supabase URL. Please set up your Supabase project URL in src/lib/supabase.ts');
  throw new Error('Invalid Supabase URL');
}

if (!supabaseKey || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('Invalid Supabase Anon Key. Please set up your Supabase anon key in src/lib/supabase.ts');
  throw new Error('Invalid Supabase Anon Key');
}

try {
  // Validate URL format
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', error);
  throw new Error('Invalid Supabase URL format');
}

export const supabase = createClient(supabaseUrl, supabaseKey);