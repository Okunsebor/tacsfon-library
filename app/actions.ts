'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadBook(bookData: any) {
  // Hardcode is_approved to false at the server level, preventing client override
  const payload = {
    ...bookData,
    is_approved: false
  };

  const { error } = await supabase.from('books').insert([payload]);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
