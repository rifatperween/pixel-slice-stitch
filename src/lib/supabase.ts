import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecpwjkishkowkyjyheij.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcHdqa2lzaGtvd2t5anloZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwODE5MTUsImV4cCI6MjA1MzY1NzkxNX0.Ara5uuLU4otlUMuZw7CtOTQeuFpwcHO82HZc1Tx_nP0';

export const supabase = createClient(supabaseUrl, supabaseKey);